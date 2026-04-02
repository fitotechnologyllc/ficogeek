export const dynamic = "force-dynamic";
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { FICO_GEEK_AI_PERSONA, DISPUTE_INTAKE_PROMPT } from '@/lib/ai/prompts';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc, addDoc, where, updateDoc } from 'firebase/firestore';
import { updateIntakeData } from '@/lib/ai/intake-engine';
import { mapIntakeToTemplate } from '@/lib/ai/letter-engine';
import { Letter, LetterTemplate } from '@/lib/schema';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, conversationId, userId, isIntakeMode } = await req.json();

    // 1. Retrieval Layer (RAG)
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const knowledgeContext = await searchKnowledge(lastUserMessage);

    // 1.5. Engagement Persistence (Cross-Device)
    if (userId) {
      const profileRef = doc(db, "profiles", userId);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists() && !profileSnap.data().firstAiSessionAt) {
        await updateDoc(profileRef, {
          firstAiSessionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    // 2. Execute modern streamText
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing from environment.");
      return new Response(JSON.stringify({ 
        error: "AI Service temporarily unavailable. Please contact support." 
      }), { status: 503 });
    }

    const result = await streamText({
      model: google('gemini-1.5-pro'),
      system: `
        ${FICO_GEEK_AI_PERSONA}
        ${isIntakeMode ? DISPUTE_INTAKE_PROMPT : ""}
        
        Relevant Platform Knowledge:
        ${knowledgeContext}
        
        CONTEXTUAL INFO:
        Current Conversation ID: ${conversationId}
        User ID: ${userId}
      `,
      messages,
      tools: {
        update_dispute_intake: {
          description: "Update the structured data for the user's dispute intake. Use this AFTER the user answers a collector step (Bureau, Account, Reason).",
          inputSchema: z.object({
            bureaus: z.array(z.string()).optional().describe("Array of bureaus like ['Equifax', 'Experian', 'TransUnion']"),
            creditorName: z.string().optional().describe("The name of the creditor or collection agency."),
            accountNumber: z.string().optional().describe("The account number of the disputed item."),
            reason: z.string().optional().describe("The specific reason for the dispute (e.g. 'Inaccurate Balance')."),
            completion_update: z.string().describe("Internal note about what was updated."),
          }),
          execute: async ({ bureaus, creditorName, accountNumber, reason, completion_update }) => {
            const intakeId = `intake_${conversationId}`;
            if (!userId) {
              console.error("[AI Engine] Post-intake Update Failed: No userId provided.");
              return { success: false, error: "No userId" };
            }
            await updateIntakeData(userId, intakeId, { bureaus, creditorName, accountNumber, reason });
            return { success: true, updatedFields: Object.keys({ bureaus, creditorName, accountNumber, reason }) };
          },
        },
        generate_dispute_letters: {
          description: "Finalize the intake and generate the official dispute letters for each requested bureau.",
          inputSchema: z.object({
            intakeId: z.string().describe("The ID of the completion intake record."),
          }),
          execute: async ({ intakeId }) => {
          console.log(`[AI Engine] Generating letters for intake: ${intakeId}`);
          
          if (!userId) {
            console.error("[AI Engine] Critical: Attempted letter generation without user session.");
            return { error: "User session lost. Please refresh and try again." };
          }

          try {
            // 1. Fetch Intake Data
            const intakeRef = doc(db, "profiles", userId, "intakes", intakeId);
            const intakeSnap = await getDoc(intakeRef);
            
            if (!intakeSnap.exists()) {
              return { success: false, message: `Intake record ${intakeId} not found.` };
            }

            const intakeData = intakeSnap.data();

            // 2. Fetch User Profile for personal data (Fallback if not in intake)
            const profileRef = doc(db, "profiles", userId);
            const profileSnap = await getDoc(profileRef);
            const profileData = profileSnap.exists() ? profileSnap.data() : {};

            // 3. Fetch an active Dispute Template
            const templatesRef = collection(db, "templates");
            const q = query(templatesRef, where("category", "==", "Dispute"), where("active", "==", true), limit(1));
            const templateSnap = await getDocs(q);
            
            if (templateSnap.empty) {
              console.warn(`[AI Engine] No active templates found for category: Dispute. Falling back to default.`);
              return { 
                error: "Standard Template Not Found", 
                message: "We couldn't find the Round 1 Section 609 template. Please contact support or ensure your account has access to templates." 
              };
            }

            const template = { id: templateSnap.docs[0].id, ...templateSnap.docs[0].data() } as LetterTemplate;

            // 4. Merge Data (Prioritize intake, fallback to profile)
            const mergedIntake = {
              ...intakeData,
              data: {
                 fullName: profileData.name || "Consumer Name",
                 address: profileData.address || "Owner Address",
                 ...intakeData.data
              }
            };

            // 5. Generate Letters for each bureau
            const generatedLetterIds: string[] = [];
            const bureaus = mergedIntake.data.bureaus || ["Equifax", "Experian", "TransUnion"];

            for (const bureau of bureaus) {
              const { fullContent } = mapIntakeToTemplate(mergedIntake as any, template, bureau);
              const letterObj: Partial<Letter> = {
                ownerUID: userId || "anonymous",
                content: fullContent,
                bureau,
                status: "Draft",
                type: template.type,
                templateId: template.id || "manual",
                disputeId: "ai-generated", // Placeholder since we don't have a dispute record yet
                version: 1,
                metadata: {
                  recipient: bureau,
                  address: "Bureau Address Placeholder",
                  date: new Date().toLocaleDateString(),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              const docRef = await addDoc(collection(db, "letters"), letterObj);
              generatedLetterIds.push(docRef.id);
            }

            return { 
              success: true, 
              message: `Generated ${generatedLetterIds.length} letter drafts successfully. Tell the user they can now review and send them in the Letter Center.`,
              letterIds: generatedLetterIds 
            };
          } catch (err: unknown) {
            console.error("Letter Gen Error:", err);
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            return { success: false, message: "Failed to generate letters: " + errorMessage };
          }
        },
        },
      }
    });

    return result.toTextStreamResponse();
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("POST Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

async function searchKnowledge(userQuery: string) {
  if (!userQuery || userQuery.length < 5) return "No specific knowledge context found.";
  
  try {
    const q = query(collection(db, "ai_knowledge"), limit(3));
    const snap = await getDocs(q);
    const context = snap.docs.map(doc => `Q: ${doc.data().question}\nA: ${doc.data().answer}`).join("\n\n");
    return context || "FICO Geek general guidance applies.";
  } catch (err) {
    return "Knowledge offline.";
  }
}
