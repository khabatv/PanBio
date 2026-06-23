export type VariantType = "Duplication" | "Deletion" | "Inversion" | "Translocation";

export interface StructuralVariant {
  id: string;
  type: VariantType;
  chromosome: string;
  start: number;
  end: number;
  sizeBp: number;
  targetGene: string;
  functionalScore: number; // 0-100 prioritization score
  proximityToOpenChromatin: number; // in bp
  qtlCorrelation: number; // Pearson correlation coefficient 0-1
  subgenome: string; // e.g. "Subgenome A" or "Subgenome B"
  consequence: string; // e.g. "Upstream Enhancer Duplication", "Exon Deletion"
  isTargetSV: boolean; // Flag identifying the principal demonstration target
  expressionLFC: number; // Log2 Fold Change of downstream target gene
  methylationLevelControl: number;
  methylationLevelStress: number;
}

export interface ChromatinLoop3D {
  id: string;
  chromosome: string;
  anchorAStart: number;
  anchorAEnd: number;
  anchorBStart: number;
  anchorBEnd: number;
  cisRegulatoryElement: string;
  targetGene: string;
  contactFrequencyControl: number; // contact intensity in control
  contactFrequencyStress: number; // contact intensity in stress
  isTargetLoop: boolean;
}

export interface MultiOmicsLayerConfig {
  longReadsSV: boolean;
  genomicsEpigenomics: boolean;
  transcriptomics: boolean;
  proteomics: boolean;
  metabolomics: boolean;
  phenomics: boolean;
}

export interface ActiveFilterConfig {
  variantTypes: VariantType[];
  subgenome: string; // "All" or specific
  minFunctionalScore: number;
  maxFdr: number; // Significance Filter
  experimentCondition: "Control" | "Stress";
  stressType: "Drought" | "Salinity" | "Heat" | "Pathogen";
  selectedLayer: keyof MultiOmicsLayerConfig;
}

export interface TrackDataPoint {
  coordinate: number;
  baseCoverage: number;
  methylationControl: number;
  methylationStress: number;
  chromatinControl: number;
  chromatinStress: number;
  rnaSeqControl: number;
  rnaSeqStress: number;
  proteinAbundanceControl: number;
  proteinAbundanceStress: number;
  metaboliteAbundanceControl: number;
  metaboliteAbundanceStress: number;
  phenotypeControl: number;
  phenotypeStress: number;
}

export interface PhenotypicNode {
  id: string;
  label: string;
  type: "Variant" | "Transcript" | "Protein" | "Metabolite" | "Phenotype";
  valueControl: number;
  valueStress: number;
  unit: string;
  description: string;
  layer: string; // e.g., "Long-Read / Genomics", "Transcriptomics", etc.
}

export interface PhenotypicLink {
  source: string;
  target: string;
  correlation: number; // coefficient
  direction: "positive" | "negative";
  type: "chromatin_loop" | "transcription_activation" | "translation_dynamics" | "enzymatic_synthesis";
}

export interface PathwayStructure {
  nodes: PhenotypicNode[];
  links: PhenotypicLink[];
}

