import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Activity,
  Globe,
  Leaf
} from "lucide-react";

import { organismsData, generateTrackData } from "./data/mockData";
import { ActiveFilterConfig, MultiOmicsLayerConfig, StructuralVariant, VariantType } from "./types";
import { ControlPanel } from "./components/ControlPanel";
import { ThreeDGenomeCanvas } from "./components/ThreeDGenomeCanvas";
import { TrackViewer2D } from "./components/TrackViewer2D";
import { PhenotypicNetwork } from "./components/PhenotypicNetwork";
import { BottomDataDrawer } from "./components/BottomDataDrawer";

export default function App() {
  // 1. Organism select target state ("Plant", "Animal", or "Model")
  const [selectedOrganism, setSelectedOrganism] = useState<string>("Arabidopsis thaliana (Crop Plant)");

  const currentDataset = useMemo(() => {
    return organismsData[selectedOrganism] || organismsData["Arabidopsis thaliana (Crop Plant)"];
  }, [selectedOrganism]);

  // Core control states
  const [controlPanelCollapsed, setControlPanelCollapsed] = useState<boolean>(false);
  const [layersConfig, setLayersConfig] = useState<MultiOmicsLayerConfig>({
    longReadsSV: true,
    genomicsEpigenomics: true,
    transcriptomics: true,
    proteomics: true,
    metabolomics: true,
    phenomics: true, // Activated by default
  });

  const [filterConfig, setFilterConfig] = useState<ActiveFilterConfig>({
    variantTypes: ["Duplication", "Deletion", "Inversion", "Translocation"],
    subgenome: "All",
    minFunctionalScore: 70,
    maxFdr: 0.05,
    experimentCondition: "Stress", // default active stress for maximum visual fidelity initially
    stressType: "Drought",
    selectedLayer: "longReadsSV",
  });

  // Selected Variant state (Defaults to first variant in chosen organism's dataset)
  const defaultVariantId = useMemo(() => {
    return currentDataset.variants[0]?.id || "SV-CHR3-DUP42";
  }, [currentDataset]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>("SV-CHR3-DUP42");

  // Keep variant selection aligned when the user updates the organism
  const currentVariant = useMemo(() => {
    const found = currentDataset.variants.find((v) => v.id === selectedVariantId);
    if (found) return found;
    return currentDataset.variants[0] || {
      id: "SV-N/A",
      type: "Duplication" as VariantType,
      chromosome: "Chr 1",
      start: 1000,
      end: 2000,
      sizeBp: 1000,
      targetGene: "N/A",
      functionalScore: 50,
      proximityToOpenChromatin: 1000,
      qtlCorrelation: 0.1,
      subgenome: "All",
      consequence: "N/A",
      isTargetSV: false,
      expressionLFC: 0.1,
      methylationLevelControl: 0.5,
      methylationLevelStress: 0.5,
    };
  }, [currentDataset, selectedVariantId]);

  // Handle organism shift securely
  const handleOrganismChange = (orgName: string) => {
    setSelectedOrganism(orgName);
    const dataset = organismsData[orgName];
    if (dataset && dataset.variants.length > 0) {
      setSelectedVariantId(dataset.variants[0].id);
      
      // Map suitable stress types automatically
      setFilterConfig((prev) => {
        let type = prev.stressType;
        if (orgName.includes("Arabi")) type = "Drought";
        if (orgName.includes("Bos")) type = "Heat";
        if (orgName.includes("Mus")) type = "Heat";
        return { ...prev, stressType: type };
      });
    }
  };

  // Synchronize environmental state to variant shifts
  const handleSelectVariant = (variant: StructuralVariant) => {
    setSelectedVariantId(variant.id);
    
    // Automatically match stress model type of selected variant
    setFilterConfig((prev) => {
      let nextType = prev.stressType;
      if (variant.id === "SV-CHR3-DUP42" || variant.id === "SV-CHR3-DEL08") nextType = "Drought";
      if (variant.id === "SV-CHR1-DEL15") nextType = "Salinity";
      if (variant.id === "SV-CHR5-INV89") nextType = "Heat";
      if (variant.id === "SV-CHR4-TRA12") nextType = "Pathogen";
      
      // Autosome livestock mapping
      if (variant.id === "SV-CHR14-DUP08") nextType = "Heat";
      if (variant.id === "SV-CHR8-DEL22") nextType = "Heat";
      if (variant.id === "SV-CHR21-INV04") nextType = "Heat";
      
      return { ...prev, stressType: nextType };
    });
  };

  // Compute active loop based on current variant's chromosome
  const currentLoop = useMemo(() => {
    return currentDataset.chromatinLoops.find((l) => l.chromosome === currentVariant.chromosome) || currentDataset.chromatinLoops[0];
  }, [currentDataset, currentVariant]);

  // Compute active pathway cascade based on active variant
  const currentPathway = useMemo(() => {
    return currentDataset.pathwayCascades[currentVariant.id] || Object.values(currentDataset.pathwayCascades)[0];
  }, [currentDataset, currentVariant]);

  // Generate dense multi-omics track coordinates for corresponding chromosome
  const currentTrackData = useMemo(() => {
    return generateTrackData(currentVariant.chromosome);
  }, [currentVariant]);

  // Node selection triggers active variant focal synchronization
  const handleSelectNode = (nodeLabel: string) => {
    if (nodeLabel.includes("SV-")) {
      const match = currentDataset.variants.find((v) => v.id === nodeLabel);
      if (match) handleSelectVariant(match);
    }
  };

  // Count active layers inside config
  const activeLayersCount = useMemo(() => {
    return Object.values(layersConfig).filter(Boolean).length;
  }, [layersConfig]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-black antialiased custom-scrollbar">
      {/* 1. ENTERPRISE MAIN TOP SHELL BAR */}
      <header className="h-14 border-b border-white/10 bg-[#111112] px-6 flex items-center justify-between gap-4 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Glowing biological launcher emblem */}
          <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center rounded-md font-bold text-black text-sm shadow-md">
            PB
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-sans font-semibold text-md tracking-tight text-slate-100">
                PanBio
              </h1>
              <span className="font-mono text-[9px] ml-2 text-white/40 font-bold tracking-wider">
                v4.2.1-PRO
              </span>
            </div>
            <p className="font-sans text-[10px] text-white/40 font-medium font-semibold">
              Multi-Omics Trait Discovery & Analysis Ecosystem
            </p>
          </div>
        </div>

        {/* Global summary status widgets section */}
        <div className="flex items-center gap-6">
          
          {/* Organism Dataset Switcher */}
          <div className="flex flex-col items-end border-r border-white/10 pr-4 max-md:border-none">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-bold">Target Species / Context Selector</span>
            <div id="species-selector-container" className="flex items-center gap-1.5 mt-0.5">
              <Globe size={11} className="text-emerald-400" />
              <select
                id="organism-switcher"
                value={selectedOrganism}
                onChange={(e) => handleOrganismChange(e.target.value)}
                className="bg-[#1C1C1E] border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-sans"
              >
                <option value="Arabidopsis thaliana (Crop Plant)">Arabidopsis thaliana (Crop Plant)</option>
                <option value="Bos taurus (Livestock Animal)">Bos taurus (Livestock Animal)</option>
                <option value="Mus musculus (Mammalian Model)">Mus musculus (Mammalian Model)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col items-end border-r border-white/10 pr-4 max-md:border-none">
            <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest font-bold font-semibold">Active Assay Levels</span>
            <p className="font-sans text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
              <Layers size={11} /> {activeLayersCount} / 6 Ready
            </p>
          </div>

          <button className="px-4 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold hidden md:block hover:bg-emerald-600/30 transition-colors">
            EXPORT ANALYSIS
          </button>
        </div>
      </header>

      {/* 2. THREE-PANEL DASHBOARD INTERACTIVE VIEWPORT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Interactive Left Parameters Control Suite */}
        <ControlPanel
          config={filterConfig}
          onChangeConfig={setFilterConfig}
          layers={layersConfig}
          onChangeLayers={setLayersConfig}
          isCollapsed={controlPanelCollapsed}
          onToggleCollapsed={() => setControlPanelCollapsed(!controlPanelCollapsed)}
        />

        {/* Main Workspaces Layout Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 bg-[#0A0A0B]">
          
          {/* Dynamic alerts for drought stress mapping */}
          {currentVariant?.id === "SV-CHR3-DUP42" && filterConfig.experimentCondition === "Stress" && (
            <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-xl px-4 py-3 text-xs text-slate-300 leading-relaxed flex items-center gap-3 shadow-sm">
              <Leaf size={18} className="text-emerald-400 shrink-0" />
              <div>
                <b className="text-emerald-300">Drought Stress Cascade Activated:</b> Upstream tandem duplication <span className="underline font-mono font-semibold">{currentVariant.id}</span> alters chromatin folding loop contact, sparking expression of transcription factor <span className="underline font-sans font-semibold text-teal-300">TF-ERF071</span> and enzyme translation to boost drought protective antioxidant flavonoids.
              </div>
            </div>
          )}

          {/* Dynamic alerts for livestock heat stress mapping */}
          {currentVariant?.id === "SV-CHR14-DUP08" && filterConfig.experimentCondition === "Stress" && (
            <div className="border border-amber-500/20 bg-amber-950/10 rounded-xl px-4 py-3 text-xs text-slate-300 leading-relaxed flex items-center gap-3 shadow-sm">
              <Leaf size={18} className="text-amber-400 shrink-0" />
              <div>
                <b className="text-amber-300">Livestock Thermal Resistance Active:</b> Autosomic duplication <span className="underline font-mono font-semibold">{currentVariant.id}</span> next to DGAT1 mRNA alters chromatin contacts, boosting lipid translation response during chronic heat cycles.
              </div>
            </div>
          )}

          {/* Interactive Dual Row: Left TAD Chromatin Visualizer vs Right Pathway Graph */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* 3D Hi-C Chromatin contact view */}
            <ThreeDGenomeCanvas
              activeLoop={currentLoop}
              condition={filterConfig.experimentCondition}
              onSelectNode={handleSelectNode}
            />

            {/* Phenotypic flow node-link cascade diagram */}
            <PhenotypicNetwork
              id={currentVariant.id}
              pathway={currentPathway}
              condition={filterConfig.experimentCondition}
            />
          </div>

          {/* Smooth Scroll Multi-Layer Genome Tracks browser */}
          <TrackViewer2D
            activeVariant={currentVariant}
            allVariants={currentDataset.variants}
            trackData={currentTrackData}
            layersConfig={layersConfig}
            condition={filterConfig.experimentCondition}
            onSelectVariant={handleSelectVariant}
            organismName={selectedOrganism}
          />

          {/* Bottom Data Grid drawer containing full tables and upload targets */}
          <BottomDataDrawer
            variants={currentDataset.variants}
            selectedVariant={currentVariant}
            onSelectVariant={handleSelectVariant}
          />
        </main>
      </div>

      {/* FOOTER */}
      <footer className="h-8 bg-[#0F0F10] border-t border-white/10 px-4 flex items-center justify-between text-[10px] text-white/30 font-mono z-40">
        <div className="flex gap-4">
          <span>Session: <span className="text-white/60">DROUGHT_STRESS_004</span></span>
          <span>Memory: <span className="text-white/60">4.2GB / 12GB</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>COMPUTATIONAL ENGINE: ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
