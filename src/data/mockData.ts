import { StructuralVariant, ChromatinLoop3D, PathwayStructure, TrackDataPoint } from "../types";

export interface OrganismDataset {
  name: string;
  scientificName: string;
  category: "plant" | "animal" | "model";
  chromosomes: string[];
  variants: StructuralVariant[];
  chromatinLoops: ChromatinLoop3D[];
  pathwayCascades: Record<string, PathwayStructure>;
}

// ==============================================================
// 1. ORGANISMS COMPREHENSIVE DATASES (PLANT, LIVESTOCK, MODEL)
// ==============================================================
export const organismsData: Record<string, OrganismDataset> = {
  "Arabidopsis thaliana (Crop Plant)": {
    name: "Arabidopsis thaliana (Crop Plant)",
    scientificName: "Arabidopsis thaliana",
    category: "plant",
    chromosomes: ["Chr 1", "Chr 2", "Chr 3", "Chr 4", "Chr 5"],
    variants: [
      {
        id: "SV-CHR3-DUP42",
        type: "Duplication",
        chromosome: "Chr 3",
        start: 12430000,
        end: 12434200,
        sizeBp: 4200,
        targetGene: "TF-ERF071",
        functionalScore: 94.5,
        proximityToOpenChromatin: 150,
        qtlCorrelation: 0.89,
        subgenome: "Subgenome A",
        consequence: "Upstream Regulatory Duplication (Enhancer Gain)",
        isTargetSV: true,
        expressionLFC: 3.12,
        methylationLevelControl: 0.85,
        methylationLevelStress: 0.12,
      },
      {
        id: "SV-CHR1-DEL15",
        type: "Deletion",
        chromosome: "Chr 1",
        start: 4210000,
        end: 4211500,
        sizeBp: 1500,
        targetGene: "P5CS1",
        functionalScore: 88.2,
        proximityToOpenChromatin: 420,
        qtlCorrelation: 0.78,
        subgenome: "Subgenome B",
        consequence: "Repressor Binding Motif Deletion (De-repression)",
        isTargetSV: false,
        expressionLFC: 2.04,
        methylationLevelControl: 0.15,
        methylationLevelStress: 0.18,
      },
      {
        id: "SV-CHR5-INV89",
        type: "Inversion",
        chromosome: "Chr 5",
        start: 22810000,
        end: 22818900,
        sizeBp: 8900,
        targetGene: "HSF-B2A",
        functionalScore: 82.1,
        proximityToOpenChromatin: 810,
        qtlCorrelation: 0.72,
        subgenome: "Subgenome A",
        consequence: "Promoter Reorientation (Heat Stress Inducible Fusion)",
        isTargetSV: false,
        expressionLFC: 2.32,
        methylationLevelControl: 0.62,
        methylationLevelStress: 0.45,
      },
      {
        id: "SV-CHR4-TRA12",
        type: "Translocation",
        chromosome: "Chr 4",
        start: 8910000,
         end: 8922000,
        sizeBp: 12000,
        targetGene: "WRKY33",
        functionalScore: 79.4,
        proximityToOpenChromatin: 1250,
        qtlCorrelation: 0.64,
        subgenome: "Subgenome B",
        consequence: "Distal Enhancer Inter-chromosomal Translocation",
        isTargetSV: false,
        expressionLFC: -1.45,
        methylationLevelControl: 0.42,
        methylationLevelStress: 0.44,
      },
      {
        id: "SV-CHR3-DEL08",
        type: "Deletion",
        chromosome: "Chr 3",
        start: 12478100,
        end: 12478900,
        sizeBp: 800,
        targetGene: "GST-U19",
        functionalScore: 65.4,
        proximityToOpenChromatin: 2300,
        qtlCorrelation: 0.41,
        subgenome: "Subgenome A",
        consequence: "Distal Non-coding Sequence Deletion",
        isTargetSV: false,
        expressionLFC: 0.25,
        methylationLevelControl: 0.72,
        methylationLevelStress: 0.68,
      },
      {
        id: "SV-CHR2-INV35",
        type: "Inversion",
        chromosome: "Chr 2",
        start: 18500000,
        end: 18535000,
        sizeBp: 35000,
        targetGene: "MYB12",
        functionalScore: 56.8,
        proximityToOpenChromatin: 3400,
        qtlCorrelation: 0.35,
        subgenome: "Subgenome B",
        consequence: "Intergenic Structural Inversion",
        isTargetSV: false,
        expressionLFC: 0.12,
        methylationLevelControl: 0.51,
        methylationLevelStress: 0.50,
      }
    ],
    chromatinLoops: [
      {
        id: "L3-01",
        chromosome: "Chr 3",
        anchorAStart: 12430000,
        anchorAEnd: 12433000,
        anchorBStart: 12460000,
        anchorBEnd: 12463000,
        cisRegulatoryElement: "Enhancer Locus (SV Site)",
        targetGene: "TF-ERF071",
        contactFrequencyControl: 12.4,
        contactFrequencyStress: 88.6,
        isTargetLoop: true,
      },
      {
        id: "L1-01",
        chromosome: "Chr 1",
        anchorAStart: 4210000,
        anchorAEnd: 4211000,
        anchorBStart: 4240000,
        anchorBEnd: 4242000,
        cisRegulatoryElement: "Distal Enhancer (SV Site)",
        targetGene: "P5CS1",
        contactFrequencyControl: 31.2,
        contactFrequencyStress: 74.5,
        isTargetLoop: false,
      },
      {
        id: "L5-01",
        chromosome: "Chr 5",
        anchorAStart: 22810000,
        anchorAEnd: 22813000,
        anchorBStart: 22850000,
        anchorBEnd: 22853000,
        cisRegulatoryElement: "Heat Response Motif",
        targetGene: "HSF-B2A",
        contactFrequencyControl: 15.1,
        contactFrequencyStress: 68.2,
        isTargetLoop: false,
      },
      {
        id: "L4-01",
        chromosome: "Chr 4",
        anchorAStart: 8910000,
        anchorAEnd: 8912000,
        anchorBStart: 8950000,
        anchorBEnd: 8952000,
        cisRegulatoryElement: "WRKY Enhancer Core",
        targetGene: "WRKY33",
        contactFrequencyControl: 45.3,
        contactFrequencyStress: 22.1,
        isTargetLoop: false,
      }
    ],
    pathwayCascades: {
      "SV-CHR3-DUP42": {
        nodes: [
          {
            id: "node-sv",
            label: "SV-CHR3-DUP42",
            type: "Variant",
            valueControl: 2,
            valueStress: 4,
            unit: "Copies",
            description: "Upstream 4.2 kb tandem duplication in high-impact regulatory enhancer sequence.",
            layer: "Genomics & Long-Read SV"
          },
          {
            id: "node-transcript",
            label: "TF-ERF071",
            type: "Transcript",
            valueControl: 1.4,
            valueStress: 12.2,
            unit: "FPKM",
            description: "Stress-responsive Ethylene Response Factor 71 transcription factor upregulated down-loop.",
            layer: "Transcriptomics"
          },
          {
            id: "node-protein",
            label: "GST-U19 Enzyme",
            type: "Protein",
            valueControl: 0.18,
            valueStress: 1.45,
            unit: "Normalized Abundance",
            description: "Glutathione S-Transferase U19 enzyme active in leaf/root defensive synthesis.",
            layer: "Proteomics"
          },
          {
            id: "node-metabolite",
            label: "Flavonoid-DF-42",
            type: "Metabolite",
            valueControl: 4.8,
            valueStress: 76.5,
            unit: "μmol/g Dry Weight",
            description: "Specialized antioxidant anthocyanin-related flavonoid that mitigates cell oxidative stress damage.",
            layer: "Metabolomics"
          },
          {
            id: "node-phenotype",
            label: "Drought Survival",
            type: "Phenotype",
            valueControl: 35.0,
            valueStress: 88.5,
            unit: "% Control Recovery",
            description: "Enhanced cellular turgor, higher chlorophyll conservation, and plant survival under extreme desiccated environment.",
            layer: "Phenomics"
          }
        ],
        links: [
          {
            source: "node-sv",
            target: "node-transcript",
            correlation: 0.94,
            direction: "positive",
            type: "chromatin_loop"
          },
          {
            source: "node-transcript",
            target: "node-protein",
            correlation: 0.88,
            direction: "positive",
            type: "transcription_activation"
          },
          {
            source: "node-protein",
            target: "node-metabolite",
            correlation: 0.91,
            direction: "positive",
            type: "enzymatic_synthesis"
          },
          {
            source: "node-metabolite",
            target: "node-phenotype",
            correlation: 0.85,
            direction: "positive",
            type: "translation_dynamics"
          }
        ]
      },
      "SV-CHR1-DEL15": {
        nodes: [
          {
            id: "node-sv",
            label: "SV-CHR1-DEL15",
            type: "Variant",
            valueControl: 2,
            valueStress: 0,
            unit: "Loci intact",
            description: "Deletion of genomic binding repressor motif downstream GFF alignment.",
            layer: "Genomics & Long-Read SV"
          },
          {
            id: "node-transcript",
            label: "P5CS1",
            type: "Transcript",
            valueControl: 3.1,
            valueStress: 21.6,
            unit: "FPKM",
            description: "Delta-1-pyrroline-5-carboxylate synthase 1 enzyme coding transcript upregulated under de-repression.",
            layer: "Transcriptomics"
          },
          {
            id: "node-protein",
            label: "P5CS1 Synthetase",
            type: "Protein",
            valueControl: 0.42,
            valueStress: 3.82,
            unit: "PPM Density",
            description: "Catalytic synthetase enzyme driving biosynthetic osmolyte synthesis cycles.",
            layer: "Proteomics"
          },
          {
            id: "node-metabolite",
            label: "L-Proline Osmolyte",
            type: "Metabolite",
            valueControl: 12.5,
            valueStress: 142.0,
            unit: "mg/g Fresh Weight",
            description: "Compatibly solubilized amino-acid osmoprotectant that maintains osmotic potential.",
            layer: "Metabolomics"
          },
          {
            id: "node-phenotype",
            label: "Osmotic Turgor Retention",
            type: "Phenotype",
            valueControl: 42.0,
            valueStress: 80.5,
            unit: "% Leaf Water Content",
            description: "Maintains positive stomatal turgor and osmotic resistance preventing cell collapse.",
            layer: "Phenomics"
          }
        ],
         links: [
          {
            source: "node-sv",
            target: "node-transcript",
            correlation: 0.86,
            direction: "positive",
            type: "transcription_activation"
          },
          {
            source: "node-transcript",
            target: "node-protein",
            correlation: 0.92,
            direction: "positive",
            type: "translation_dynamics"
          },
          {
            source: "node-protein",
            target: "node-metabolite",
            correlation: 0.95,
            direction: "positive",
            type: "enzymatic_synthesis"
          },
          {
            source: "node-metabolite",
            target: "node-phenotype",
            correlation: 0.78,
            direction: "positive",
            type: "translation_dynamics"
          }
        ]
      }
    }
  },
  "Bos taurus (Livestock Animal)": {
    name: "Bos taurus (Livestock Animal)",
    scientificName: "Bos taurus",
    category: "animal",
    chromosomes: ["Chr 8", "Chr 14", "Chr 21"],
    variants: [
      {
        id: "SV-CHR14-DUP08",
        type: "Duplication",
        chromosome: "Chr 14",
        start: 12430000,
        end: 12434200,
        sizeBp: 8400,
        targetGene: "DGAT1",
        functionalScore: 95.2,
        proximityToOpenChromatin: 110,
        qtlCorrelation: 0.91,
        subgenome: "Autosome 14",
        consequence: "Enhancer Duplication near DGAT1 promoting high fat yield and cellular survival during core temperature rises.",
        isTargetSV: true,
        expressionLFC: 2.85,
        methylationLevelControl: 0.78,
        methylationLevelStress: 0.15,
      },
      {
        id: "SV-CHR8-DEL22",
        type: "Deletion",
        chromosome: "Chr 8",
        start: 4210000,
        end: 4211500,
        sizeBp: 1800,
        targetGene: "HSP70",
        functionalScore: 87.5,
        proximityToOpenChromatin: 310,
        qtlCorrelation: 0.82,
        subgenome: "Autosome 8",
        consequence: "Upstream Heat Shock transcription repressor deletion causing heat-shock hyper-response under severe environmental thermal conditions",
        isTargetSV: false,
        expressionLFC: 3.42,
        methylationLevelControl: 0.35,
        methylationLevelStress: 0.32,
      },
      {
        id: "SV-CHR21-INV04",
        type: "Inversion",
        chromosome: "Chr 21",
        start: 18500000,
        end: 18535000,
        sizeBp: 15400,
        targetGene: "LEPR",
        functionalScore: 71.3,
        proximityToOpenChromatin: 920,
        qtlCorrelation: 0.58,
        subgenome: "Autosome 21",
        consequence: "Alternative inversion of LEPR enhancer aligning with stress response module",
        isTargetSV: false,
        expressionLFC: 1.15,
        methylationLevelControl: 0.55,
        methylationLevelStress: 0.40,
      }
    ],
    chromatinLoops: [
      {
        id: "L14-01",
        chromosome: "Chr 14",
        anchorAStart: 12430000,
        anchorAEnd: 12433000,
        anchorBStart: 12460000,
        anchorBEnd: 12463000,
        cisRegulatoryElement: "Enhancer Looping Block",
        targetGene: "DGAT1",
        contactFrequencyControl: 14.5,
        contactFrequencyStress: 92.4,
        isTargetLoop: true,
      },
      {
        id: "L8-01",
        chromosome: "Chr 8",
        anchorAStart: 4210000,
        anchorAEnd: 4211000,
        anchorBStart: 4240000,
        anchorBEnd: 4242000,
        cisRegulatoryElement: "HSP Promotor Link",
        targetGene: "HSP70",
        contactFrequencyControl: 20.2,
        contactFrequencyStress: 80.5,
        isTargetLoop: false,
      }
    ],
    pathwayCascades: {
      "SV-CHR14-DUP08": {
        nodes: [
          {
            id: "node-sv",
            label: "SV-CHR14-DUP08",
            type: "Variant",
            valueControl: 2,
            valueStress: 4,
            unit: "Copies",
            description: "Duplication of cell membrane lipid biosynthesis master enhancer.",
            layer: "Genomics & Long-Read SV"
          },
          {
            id: "node-transcript",
            label: "DGAT1 mRNA",
            type: "Transcript",
            valueControl: 2.1,
            valueStress: 18.5,
            unit: "FPKM",
            description: "Diacylglycerol O-Acyltransferase 1 transcript driving long-chain lipid esterification.",
            layer: "Transcriptomics"
          },
          {
            id: "node-protein",
            label: "DGAT1 Synthetase",
            type: "Protein",
            valueControl: 0.25,
            valueStress: 2.65,
            unit: "PPM Density",
            description: "Catalyzes conversion of diacylglycerol and fatty acyl-CoA into triacylglycerols.",
            layer: "Proteomics"
          },
          {
            id: "node-metabolite",
            label: "Milk Triacylglycerols",
            type: "Metabolite",
            valueControl: 8.4,
            valueStress: 48.2,
            unit: "g/dL Milk Lipids",
            description: "Primary animal lipid energy stores, highly protective against cell membrane damage under thermal stress.",
            layer: "Metabolomics"
          },
          {
            id: "node-phenotype",
            label: "Thermotolerant Lactation",
            type: "Phenotype",
            valueControl: 45.0,
            valueStress: 94.2,
            unit: "% Thermal Efficiency",
            description: "Preserves lactation fatty acid yield and prevents systemic shock under severe heat index spikes.",
            layer: "Phenomics"
          }
        ],
        links: [
          {
            source: "node-sv",
            target: "node-transcript",
            correlation: 0.95,
            direction: "positive",
            type: "chromatin_loop"
          },
          {
            source: "node-transcript",
            target: "node-protein",
            correlation: 0.90,
            direction: "positive",
            type: "transcription_activation"
          },
          {
            source: "node-protein",
            target: "node-metabolite",
            correlation: 0.92,
            direction: "positive",
            type: "enzymatic_synthesis"
          },
          {
            source: "node-metabolite",
            target: "node-phenotype",
            correlation: 0.88,
            direction: "positive",
            type: "translation_dynamics"
          }
        ]
      }
    }
  },
  "Mus musculus (Mammalian Model)": {
    name: "Mus musculus (Mammalian Model)",
    scientificName: "Mus musculus",
    category: "model",
    chromosomes: ["Chr 2", "Chr 11", "Chr 17"],
    variants: [
      {
        id: "SV-CHR11-DUP10",
        type: "Duplication",
        chromosome: "Chr 11",
        start: 12430000,
        end: 12434200,
        sizeBp: 3500,
        targetGene: "UCP1",
        functionalScore: 92.1,
        proximityToOpenChromatin: 90,
        qtlCorrelation: 0.88,
        subgenome: "Chromosome 11",
        consequence: "Thermogenic enhancer gain raising dynamic cold exposure survival",
        isTargetSV: true,
        expressionLFC: 3.12,
        methylationLevelControl: 0.82,
        methylationLevelStress: 0.10,
      },
      {
        id: "SV-CHR2-DEL05",
        type: "Deletion",
        chromosome: "Chr 2",
        start: 4210000,
        end: 4211500,
        sizeBp: 900,
        targetGene: "BDNF",
        functionalScore: 84.6,
        proximityToOpenChromatin: 220,
        qtlCorrelation: 0.79,
        subgenome: "Chromosome 2",
        consequence: "BDNF repressor clearance elevating synapses and resilience inside hypothalamus under desensitization stress",
        isTargetSV: false,
        expressionLFC: 2.05,
        methylationLevelControl: 0.18,
        methylationLevelStress: 0.14,
      },
      {
        id: "SV-CHR17-INV32",
        type: "Inversion",
        chromosome: "Chr 17",
        start: 18500000,
        end: 18535000,
        sizeBp: 22000,
        targetGene: "IL6",
        functionalScore: 68.4,
        proximityToOpenChromatin: 1100,
        qtlCorrelation: 0.61,
        subgenome: "Chromosome 17",
        consequence: "Promoter inversion of anti-inflammatory interleukin IL6 during pathogenic stressage",
        isTargetSV: false,
        expressionLFC: 1.45,
        methylationLevelControl: 0.49,
        methylationLevelStress: 0.42,
      }
    ],
    chromatinLoops: [
      {
        id: "L11-01",
        chromosome: "Chr 11",
        anchorAStart: 12430000,
        anchorAEnd: 12433000,
        anchorBStart: 12460000,
        anchorBEnd: 12463000,
        cisRegulatoryElement: "UCP1 Loop Enhancer",
        targetGene: "UCP1",
        contactFrequencyControl: 10.1,
        contactFrequencyStress: 85.2,
        isTargetLoop: true,
      },
      {
        id: "L2-01",
        chromosome: "Chr 2",
        anchorAStart: 4210000,
        anchorAEnd: 4211000,
        anchorBStart: 4240000,
        anchorBEnd: 4242000,
        cisRegulatoryElement: "Neuron Core Promotor",
        targetGene: "BDNF",
        contactFrequencyControl: 25.4,
        contactFrequencyStress: 72.3,
        isTargetLoop: false,
      }
    ],
    pathwayCascades: {
      "SV-CHR11-DUP10": {
        nodes: [
          {
            id: "node-sv",
            label: "SV-CHR11-DUP10",
            type: "Variant",
            valueControl: 2,
            valueStress: 4,
            unit: "Copies",
            description: "Duplication of major brown-adipose tissue brown metabolic enhancer.",
            layer: "Genomics & Long-Read SV"
          },
          {
            id: "node-transcript",
            label: "UCP1 mRNA",
            type: "Transcript",
            valueControl: 1.2,
            valueStress: 14.8,
            unit: "FPKM",
            description: "Uncoupling Protein 1 mitochondrial coding coding transcript which triggers heat dissipation.",
            layer: "Transcriptomics"
          },
          {
            id: "node-protein",
            label: "Thermogenin",
            type: "Protein",
            valueControl: 0.15,
            valueStress: 1.95,
            unit: "PPM Density",
            description: "Mitochondrial inner membrane carrier protein driving cellular non-shivering thermogenesis.",
            layer: "Proteomics"
          },
          {
            id: "node-metabolite",
            label: "Mitochondrial Free Fatty Acids",
            type: "Metabolite",
            valueControl: 3.5,
            valueStress: 38.6,
            unit: "μmol/g Wet Tissue",
            description: "Free fatty acids released into adipose tissue driving active mitochondrial proton leaks.",
            layer: "Metabolomics"
          },
          {
            id: "node-phenotype",
            label: "Non-shivering Thermogenesis",
            type: "Phenotype",
            valueControl: 38.0,
            valueStress: 91.4,
            unit: "% Thermal Capacity",
            description: "Dramatically enhances systemic body temperature maintenance and animal survival under extreme subzero cold stress.",
            layer: "Phenomics"
          }
        ],
        links: [
          {
            source: "node-sv",
            target: "node-transcript",
            correlation: 0.93,
            direction: "positive",
            type: "chromatin_loop"
          },
          {
            source: "node-transcript",
            target: "node-protein",
            correlation: 0.89,
            direction: "positive",
            type: "transcription_activation"
          },
          {
            source: "node-protein",
            target: "node-metabolite",
            correlation: 0.91,
            direction: "positive",
            type: "enzymatic_synthesis"
          },
          {
            source: "node-metabolite",
            target: "node-phenotype",
            correlation: 0.86,
            direction: "positive",
            type: "translation_dynamics"
          }
        ]
      }
    }
  }
};

// ==========================================
// BACKWARD COMPATIBLE EXPORT FALLBACKS
// ==========================================
const primaryPlant = organismsData["Arabidopsis thaliana (Crop Plant)"];
export const mockVariants = primaryPlant.variants;
export const mockChromatinLoops = primaryPlant.chromatinLoops;
export const pathwayCascades = primaryPlant.pathwayCascades;

// ==========================================
// 4. GENERATOR FOR HIGH-DENSITY 2D TRACK DATA (WITH PHENOMICS!)
// ==========================================
export function generateTrackData(chromosome: string, organismName?: string): TrackDataPoint[] {
  const points: TrackDataPoint[] = [];
  
  // Resolve Selected Organism
  const activeOrgName = organismName || "Arabidopsis thaliana (Crop Plant)";
  const activeOrg = organismsData[activeOrgName] || primaryPlant;

  // Find boundaries depending on selected variant/chromosome
  let baseCoordsStart = 12410000;
  let baseCoordsEnd = 12490000;
  let sStart = 12430000;
  let sEnd = 12434200;
  let geneStart = 12460000;
  let geneEnd = 12468000;
  let secondGeneStart = 12474000;
  let secondGeneEnd = 12479500;

  // Let's adjust based on chromosomes found across organisms
  if (chromosome === "Chr 1" || chromosome === "Chr 8") {
    baseCoordsStart = 4190000;
    baseCoordsEnd = 4270000;
    sStart = 4210000;
    sEnd = 4211500;
    geneStart = 4235000;
    geneEnd = 4242000;
    secondGeneStart = 4252000;
    secondGeneEnd = 4258000;
  } else if (chromosome === "Chr 5" || chromosome === "Chr 21" || chromosome === "Chr 17") {
    baseCoordsStart = 22790000;
    baseCoordsEnd = 22870000;
    sStart = 22810000;
    sEnd = 22818900;
    geneStart = 22845000;
    geneEnd = 22852000;
    secondGeneStart = 22860000;
    secondGeneEnd = 22866000;
  } else if (chromosome === "Chr 4" || chromosome === "Chr 2") {
    baseCoordsStart = 8890000;
    baseCoordsEnd = 8970000;
    sStart = 8910000;
    sEnd = 8922000;
    geneStart = 8945000;
    geneEnd = 8952000;
    secondGeneStart = 8960000;
    secondGeneEnd = 8965000;
  }

  const step = 2000; // 2 kb resolution for granular charting
  const count = Math.ceil((baseCoordsEnd - baseCoordsStart) / step);

  for (let i = 0; i <= count; i++) {
    const coord = baseCoordsStart + i * step;

    // Genomics depth
    let coverage = 80 + Math.sin(coord / 15000) * 15 + Math.random() * 8;
    if (coord >= sStart && coord <= sEnd) {
      coverage += 85; // spike in reads due to gain duplication
    }

    // Epigenomics
    let distToSV = Math.abs(coord - (sStart + sEnd) / 2);
    let distToGene = Math.min(Math.abs(coord - geneStart), Math.abs(coord - secondGeneStart));
    
    let methControl = 75 + Math.sin(coord / 8000) * 6;
    let methStress = methControl;
    if (distToSV < 15000) {
      methControl = 82; 
      methStress = 15; // demeth
    }
    methControl = Math.max(5, Math.min(98, methControl + Math.random() * 4));
    methStress = Math.max(5, Math.min(98, methStress + (methStress < 40 ? Math.random() * 5 : -Math.random() * 4)));

    // Accessibility peaks
    let openChromControl = 10 + 20 * Math.exp(-Math.pow(distToSV / 8000, 2)) + Math.random() * 5;
    let openChromStress = 12 + 82 * Math.exp(-Math.pow(distToSV / 5000, 2)) + Math.random() * 6;
    if (coord >= geneStart && coord <= geneEnd) {
      openChromStress += 40 * Math.exp(-Math.pow((coord - (geneStart + geneEnd)/2) / 3000, 2));
    }

    // Transcriptomics
    let rnaControl = 5 + 8 * Math.exp(-Math.pow((coord - (geneStart + geneEnd)/2) / 8000, 2)) + Math.random() * 2;
    let rnaStress = rnaControl;
    if (coord >= geneStart && coord <= geneEnd) {
      rnaStress = rnaControl + 145 * Math.exp(-Math.pow((coord - (geneStart + geneEnd)/2) / 4000, 2));
    }
    if (coord >= secondGeneStart && coord <= secondGeneEnd) {
      rnaStress = rnaControl + 80 * Math.exp(-Math.pow((coord - (secondGeneStart + secondGeneEnd)/2) / 5000, 2));
    }

    // Proteomics
    let protControl = rnaControl * 0.12 + Math.random() * 0.5;
    let protStress = rnaStress * 0.12 + (rnaStress > 20 ? 8 : 0) + Math.random() * 1.5;

    // Metabolomics
    let metabolAbundControl = Math.max(1, 4 + Math.sin(coord / 25000) * 2 + Math.random() * 1);
    let metabolAbundStress = metabolAbundControl;
    if (distToGene < 20000) {
      metabolAbundStress = metabolAbundControl + 60 * Math.exp(-Math.pow(distToGene / 15000, 2));
    }

    // Phenomics (Phenotypic intensity representing final physical traits)
    let phenoControl = 30 + Math.sin(coord / 30000) * 12 + Math.random() * 2;
    let phenoStress = phenoControl;
    if (distToGene < 25000) {
      phenoStress = phenoControl + 55 * Math.exp(-Math.pow(distToGene / 16000, 2));
    }

    points.push({
      coordinate: coord,
      baseCoverage: Math.round(coverage),
      methylationControl: Math.round(methControl),
      methylationStress: Math.round(methStress),
      chromatinControl: Math.round(openChromControl),
      chromatinStress: Math.round(openChromStress),
      rnaSeqControl: Math.round(rnaControl),
      rnaSeqStress: Math.round(rnaStress),
      proteinAbundanceControl: Math.max(0.1, Number(protControl.toFixed(2))),
      proteinAbundanceStress: Math.max(0.1, Number(protStress.toFixed(2))),
      metaboliteAbundanceControl: Math.max(0.1, Number(metabolAbundControl.toFixed(2))),
      metaboliteAbundanceStress: Math.max(0.1, Number(metabolAbundStress.toFixed(2))),
      phenotypeControl: Math.max(1, Math.round(phenoControl)),
      phenotypeStress: Math.max(1, Math.round(phenoStress)),
    });
  }

  return points;
}
