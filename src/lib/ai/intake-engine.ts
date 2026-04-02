import { AIDisputeIntake } from "@/lib/schema";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

export const REQUIRED_INTAKE_FIELDS = [
  "bureaus",
  "creditorName",
  "accountNumber",
  "reason"
];

export async function getOrCreateIntake(
  userId: string, 
  conversationId: string, 
  isPro: boolean = false, 
  clientId?: string
): Promise<AIDisputeIntake> {
  const intakeId = `intake_${conversationId}`;
  const intakeRef = doc(db, "profiles", userId, "intakes", intakeId);
  const intakeSnap = await getDoc(intakeRef);

  if (intakeSnap.exists()) {
    return { id: intakeSnap.id, ...intakeSnap.data() } as AIDisputeIntake;
  }

  const newIntake: AIDisputeIntake = {
    ownerUID: userId,
    clientId: isPro ? clientId : undefined,
    conversationId,
    status: "draft",
    data: {
      isMasked: true,
      hasDocuments: false,
      bureaus: [],
    },
    completionPercent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(intakeRef, newIntake);
  return newIntake;
}

export async function updateIntakeData(
  userId: string,
  intakeId: string, 
  partialData: Partial<AIDisputeIntake["data"]>
) {
  const intakeRef = doc(db, "profiles", userId, "intakes", intakeId);
  const intakeSnap = await getDoc(intakeRef);

  if (!intakeSnap.exists()) return;

  const currentData = intakeSnap.data();
  const updatedData = { ...currentData.data, ...partialData };
  
  // Calculate completion percentage
  const filledRequired = REQUIRED_INTAKE_FIELDS.filter(field => {
    const val = updatedData[field as keyof typeof updatedData];
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  });

  const completionPercent = Math.round((filledRequired.length / REQUIRED_INTAKE_FIELDS.length) * 100);

  await updateDoc(intakeRef, {
    data: updatedData,
    completionPercent,
    updatedAt: new Date().toISOString()
  });
}
