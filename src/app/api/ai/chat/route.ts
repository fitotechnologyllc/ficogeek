import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { FICO_GEEK_AI_PERSONA, DISPUTE_INTAKE_PROMPT } from '@/lib/ai/prompts';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, limit, doc, getDoc, addDoc, where } from 'firebase/firestore';
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

    // 2. Execute modern streamText
    if (!process.env.OPENAI_API_KEY) {
      console.error("CRITICAL: OPENAI_API_KEY is missing from environment.");
      return new Response(JSON.stringify({ 
        error: "AI Service temporarily unavailable. Please contact support." 
      }), { status: 503 });
    }

    const result = await (streamText as any)({
      model: openai('gpt-4o'),
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
      maxSteps: 5,
      tools: {
        update_dispute_intake: {
          description: "Update the structured data for the user's dispute intake.",
          parameters: z.object({
            fullName: z.string().optional(),
            address: z.string().optional(),
            bureaus: z.array(z.string()).optional(),
            creditorName: z.string().optional(),
            accountNumber: z.string().optional(),
            reason: z.string().optional(),
            completion_update: z.string().describe("Internal note about what was updated."),
          }),
          execute: async (args: any) => {
            const intakeId = `intake_${conversationId}`;
            await updateIntakeData(intakeId, args);
            return { success: true, updatedFields: Object.keys(args) };
          },
        },
        generate_dispute_letters: {
          description: "Finalize the intake and generate the official dispute letters for each requested bureau.",
          parameters: z.object({
            intakeId: z.string().describe("The ID of the completion intake record."),
          }),
          execute: async (args: any) => {
          const { intakeId } = args;
          try {
            // 1. Fetch Intake Data
            const intakeRef = doc(db, "ai_dispute_intakes", intakeId);
            const intakeSnap = await getDoc(intakeRef);

            if (!intakeSnap.exists()) {
              return { success: false, message: "Intake record not found. Please complete the setup first." };
            }

            const intakeData = intakeSnap.data();

            // 2. Fetch an active Dispute Template
            const templatesRef = collection(db, "templates");
            const q = query(templatesRef, where("category", "==", "Dispute"), where("active", "==", true), limit(1));
            const templateSnap = await getDocs(q);
            
            if (templateSnap.empty) {
              return { success: false, message: "No active dispute templates found. Please contact support or check Admin Forge." };
            }

            const template = { id: templateSnap.docs[0].id, ...templateSnap.docs[0].data() } as LetterTemplate;

            // 3. Generate Letters for each bureau
            const generatedLetterIds: string[] = [];
            const bureaus = intakeData.bureaus || ["Equifax", "Experian", "TransUnion"];

            for (const bureau of bureaus) {
              const { fullContent } = mapIntakeToTemplate(intakeData as any, template, bureau);
              const letterObj: any = {
                bureau,
                content: fullContent,
                status: "Draft",
                userId: userId || "anonymous",
                conversationId,
                intakeId,
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
          } catch (err: any) {
            console.error("Letter Gen Error:", err);
            return { success: false, message: "Failed to generate letters: " + err.message };
          }
        }
        }
      } as any
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("POST Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
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
