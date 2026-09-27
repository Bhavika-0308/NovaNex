export interface Policy {
  id: string;
  name: string;
  type: string;
  sumInsured: string;
  pageCount: number;
}

export interface Citation {
  sectionRef: string;
  pageRef: string;
  sourceText: string;
}

export interface ExtractedField {
  label: string;
  value: string;
  citation: Citation;
}

export interface TreatmentCostEntry {
  treatmentName: string;
  avgCost: number;
  costRange: [number, number];
}

export interface EstimateResult {
  totalCost: number;
  coveredAmount: number;
  outOfPocket: number;
  confidence: "High" | "Medium" | "Low";
  missingInfo: string[];
}
