import { AIDisputeIntake, LetterTemplate } from "@/lib/schema";
import { getBureauAddress } from "@/lib/constants/bureaus";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface MappingResult {
  fullContent: string;
  mappedPlaceholders: Record<string, string>;
}

/**
 * Maps AIDisputeIntake data into a LetterTemplate.
 */
export function mapIntakeToTemplate(
  intake: AIDisputeIntake, 
  template: LetterTemplate,
  bureau: string
): MappingResult {
  const data = intake.data || {};
  const bureauInfo = getBureauAddress(bureau);
  
  const placeholders: Record<string, string> = {
    "{{USER_NAME}}": data.fullName || "Consumer Name",
    "{{USER_ADDRESS}}": data.address || "Owner Address",
    "{{CITY_STATE_ZIP}}": `${data.city || ""}, ${data.state || ""} ${data.zipCode || ""}`.trim(),
    "{{DATE}}": new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    "{{BUREAU_NAME}}": bureauInfo?.name || bureau,
    "{{BUREAU_ADDRESS}}": bureauInfo?.address || "Bureau Address",
    "{{ACCOUNT_NAME}}": data.creditorName || "Account Holder",
    "{{ACCOUNT_NUMBER}}": data.accountNumber || "Account Number",
    "{{DISPUTE_REASON}}": data.reason || "Information is inaccurate.",
    "{{DISPUTE_BODY}}": data.resolution || "Please investigate and remove this item.",
    "{{SIGNATURE_NAME}}": data.fullName || "Consumer Name",
    "{{TODAYS_DATE}}": new Date().toLocaleDateString(), // Legacy support
  };

  let content = template.body;
  Object.entries(placeholders).forEach(([key, value]) => {
    // Global replacement for placeholders
    content = content.replace(new RegExp(key, "g"), value);
  });

  return {
    fullContent: content,
    mappedPlaceholders: placeholders
  };
}

/**
 * Uses AI to refine ONLY the dispute body (the narrative part).
 * This ensures the legal structure remains intact while the tone is perfected.
 */
export async function refineLetterBody(body: string): Promise<string> {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are a professional legal drafting assistant for FICO Geek. Your task is to refine the PROVIDED dispute body text to be more professional, authoritative, and clear under FCRA Section 609 guidelines. DO NOT add personal info. DO NOT change facts. Keep it concise.",
    prompt: `Refine this dispute body for a professional credit dispute letter:\n\n"${body}"`,
  });

  return text.trim();
}
