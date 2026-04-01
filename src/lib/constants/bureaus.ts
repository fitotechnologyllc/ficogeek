export const BUREAU_ADDRESSES = {
  equifax: {
    name: "Equifax Information Services, LLC",
    address: "P.O. Box 740256\nAtlanta, GA 30374-0256",
  },
  experian: {
    name: "Experian",
    address: "P.O. Box 4500\nAllen, TX 75013",
  },
  transunion: {
    name: "TransUnion LLC",
    address: "Consumer Dispute Center\nP.O. Box 2000\nChester, PA 19016",
  }
} as const;

export type BureauId = keyof typeof BUREAU_ADDRESSES;

export function getBureauAddress(bureauId: string) {
  const idCase = bureauId.toLowerCase() as BureauId;
  return BUREAU_ADDRESSES[idCase] || null;
}
