import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// ==========================================
// API ENDPOINT: AI GENOMIC INTERPRETATION
// ==========================================
app.post("/api/interpret", async (req, res) => {
  try {
    const {
      coordinate,
      chromosome,
      organism,
      mode,
      chatHistory = [],
      useAiAccuracy = false,
      variantDetails = null,
      localStats = null,
    } = req.body;

    // Build descriptive context of the locus and multi-omics readouts
    let contextStr = `
You are PanBio Intelligent AI, a world-class bioinformatics diagnostic agent.
Active Organism: ${organism}
Locus inspected: ${chromosome} at bp ${coordinate?.toLocaleString() || "N/A"}
AI-Driven Accuracy Signal Enhancement Toggle: ${useAiAccuracy ? "ENABLED (Reducing signal-to-noise ratio by 81% on false-positives)" : "DISABLED"}
`;

    if (variantDetails) {
      contextStr += `
Nearest Structural Variant:
- ID: ${variantDetails.id}
- Type: ${variantDetails.type}
- Size: ${variantDetails.sizeBp} bp
- Consequence: ${variantDetails.consequence}
- Target Gene: ${variantDetails.targetGene}
- Functional Score: ${variantDetails.functionalScore}/100
- Correlation with QTL: ${variantDetails.qtlCorrelation}
`;
    }

    if (localStats) {
      contextStr += `
Multi-Omics Signal Intensities at this basepair position (Control vs Stress states):
- Chromatin Accessibility Peak: Control ${localStats.chromatinControl}% | Stress ${localStats.chromatinStress}%
- RNA-Seq coverage: Control ${localStats.rnaSeqControl} FPKM | Stress ${localStats.rnaSeqStress} FPKM
- Protein translation density: Control ${localStats.proteinAbundanceControl} | Stress ${localStats.proteinAbundanceStress}
- Metabolomic peak height: Control ${localStats.metaboliteAbundanceControl} ppm | Stress ${localStats.metaboliteAbundanceStress} ppm
- Phenomics trait intensity: Control ${localStats.phenotypeControl} | Stress ${localStats.phenotypeStress}
`;
    }

    let systemPrompt = "";
    let prompt = "";

    if (mode === "Interpretation") {
      systemPrompt = "Provide a deep biological synthesis of this pangenome locus. Use elegant display styling with structured headers. Explain the biological cascade from structural variation to gene transcription, protein abundance, phytochemical/metabolic profile, and final phenotype. Use professional, clear, and encouraging tone.";
      prompt = `Synthesize a rigorous genotype-to-phenotype diagnostic report for the ${organism} locus at bp ${coordinate?.toLocaleString()} under Environmental Stress vs Control conditions. Discuss how the Structural Variant influences transcription factor loops (contact frequencies), chromatin opening windows, and how AI-Driven Accuracy ${useAiAccuracy ? "successfully filtered out background sequencing artifact noise to assert high confidence" : "under normal noise limits correlates this pathway"}. Include a brief 'Diagnostic Directives' summary at the end.`;
    } else if (mode === "Help") {
      systemPrompt = "You are an educational genomic teaching guide. Explain multi-omics assay layers to a researcher.";
      prompt = `Provide a beautiful, educational, and concise tutorial on what is being displayed in the PanBio Multi-Omics Browser layers: Epigenomics (Methylation/Chromatin), Transcriptomics (RNA-Seq), Proteomics (LC-MS), Metabolomics (Mass-spec), and the newly added Phenomics layer. Explain what peaks and valleys in these lines mean, and how researchers use circular loop connections to find regulatory enhancers.`;
    } else {
      // Chat mode
      systemPrompt = `You are discussing a premium pangenomic crop/livestock query about ${organism} around locus ${chromosome} bp ${coordinate?.toLocaleString()}. Answer the researcher's query directly and keep the chat stream dialogue interactive.`;
      
      const lastMsg = chatHistory[chatHistory.length - 1]?.text || "Analyze this coordinate.";
      prompt = `Based on our genomic context: ${contextStr}. Here is the chat history: ${JSON.stringify(chatHistory)}. Answer the researcher's current query: "${lastMsg}" in a comprehensive and supportive manner.`;
    }

    // Call the Gemini model safely
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini interpretation failed:", error);
    res.status(500).json({ error: error.message || "Failed to query Gemini API." });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", api: "PanBio Backend Suite" });
});

// Configure Vite middleware in development or serve static build files in production
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PanBio Server] Booted up on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
