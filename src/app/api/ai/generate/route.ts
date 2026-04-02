export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, query, where, getDocs, limit } from "firebase/firestore";
import { mapIntakeToTemplate, refineLetterBody } from "@/lib/ai/letter-engine";
import { Letter, LetterTemplate } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    const { intakeId, userId, refine } = await req.json();

    if (!intakeId || !userId) {
      return NextResponse.json({ success: false, message: "Missing intakeId or userId" }, { status: 400 });
    }

    // 1. Fetch Intake
    const intakeRef = doc(db, "ai_dispute_intakes", intakeId);
    const intakeSnap = await getDoc(intakeRef);
    if (!intakeSnap.exists()) {
      return NextResponse.json({ success: false, message: "Intake not found" }, { status: 404 });
    }
    const intake = { id: intakeSnap.id, ...intakeSnap.data() } as any;

    // 2. Fetch Template (Dispute Category)
    const templatesRef = collection(db, "templates");
    const q = query(templatesRef, where("active", "==", true), where("category", "==", "Dispute"), limit(1));
    const templateSnap = await getDocs(q);
    
    if (templateSnap.empty) {
      return NextResponse.json({ success: false, message: "No active dispute templates found" }, { status: 404 });
    }
    const template = { id: templateSnap.docs[0].id, ...templateSnap.docs[0].data() } as LetterTemplate;

    // 3. Generate for each Bureau
    const bureaus = intake.data?.bureaus || ["Experian"];
    const generatedIds = [];

    for (const b of bureaus) {
      let { fullContent } = mapIntakeToTemplate(intake, template, b);

      if (refine) {
        // Optional AI refinement of the body
        // We refine just the generated text for now
        fullContent = await refineLetterBody(fullContent);
      }

      const letterData: Partial<Letter> = {
        ownerUID: userId,
        intakeId: intakeId,
        templateId: template.id,
        type: "Dispute",
        content: fullContent,
        bureau: b,
        status: "Draft",
        version: 1,
        aiGenerated: true,
        refinedByAI: !!refine,
        isDraft: true,
        metadata: {
          recipient: b,
          address: "Mapping pending...",
          date: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "letters"), letterData);
      generatedIds.push(docRef.id);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${generatedIds.length} letters.`,
      letterIds: generatedIds
    });

  } catch (err: any) {
    console.error("Manual Gen Error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
