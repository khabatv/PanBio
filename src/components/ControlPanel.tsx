import React from "react";
import { 
  Dna, 
  Settings, 
  Cpu, 
  Layers, 
  Filter, 
  TrendingUp, 
  Activity, 
  Sliders, 
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MultiOmicsLayerConfig, ActiveFilterConfig, VariantType } from "../types";

interface ControlPanelProps {
  config: ActiveFilterConfig;
  onChangeConfig: (updater: (prev: ActiveFilterConfig) => ActiveFilterConfig) => void;
  layers: MultiOmicsLayerConfig;
  onChangeLayers: (updater: (prev: MultiOmicsLayerConfig) => MultiOmicsLayerConfig) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  layers,
  onChangeLayers,
  isCollapsed,
  onToggleCollapsed,
}) => {
  const toggleVariantType = (type: VariantType) => {
    onChangeConfig((prev) => {
      const active = prev.variantTypes.includes(type)
        ? prev.variantTypes.filter((t) => t !== type)
        : [...prev.variantTypes, type];
      return { ...prev, variantTypes: active };
    });
  };

  const toggleLayer = (layerKey: keyof MultiOmicsLayerConfig) => {
    onChangeLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const setCondition = (cond: "Control" | "Stress") => {
    onChangeConfig((prev) => ({ ...prev, experimentCondition: cond }));
  };

  const setStressType = (type: ActiveFilterConfig["stressType"]) => {
    onChangeConfig((prev) => {
      // Connect stress type to variant selections to keep simulation clean
      let correspondingSV = "SV-CHR3-DUP42";
      if (type === "Salinity") correspondingSV = "SV-CHR1-DEL15";
      if (type === "Heat") correspondingSV = "SV-CHR5-INV89";
      if (type === "Pathogen") correspondingSV = "SV-CHR4-TRA12";
      return { ...prev, stressType: type };
    });
  };

  return (
    <div 
      id="control-panel-container"
      className={`relative transition-all duration-300 ease-in-out border-r border-white/10 bg-[#0F0F10] text-gray-200 select-none ${
        isCollapsed ? "w-12" : "w-80"
      } flex flex-col h-full`}
    >
      {/* Collapse/Expand Pull Tab */}
      <button
        id="control-panel-toggle-btn"
        onClick={onToggleCollapsed}
        className="absolute top-4 -right-3 z-30 bg-[#141416] border border-white/10 rounded-full p-1 cursor-pointer hover:bg-emerald-600/20 text-emerald-400 transition-colors"
        title={isCollapsed ? "Expand Parameters" : "Collapse Panel"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* When Collapsed: Minimal Vertical Icon bar */}
      {isCollapsed ? (
        <div id="collapsed-icons-strip" className="flex flex-col items-center gap-6 py-6 h-full">
          <Settings className="text-emerald-500 animate-pulse" size={20} />
          <div className="h-[1px] w-6 bg-white/10" />
          <Activity className="text-cyan-400" size={18} />
          <Layers className="text-[#10b981]" size={18} />
          <Filter className="text-blue-400" size={18} />
          <Sliders className="text-amber-400" size={18} />
        </div>
      ) : (
        <div id="expanded-control-viewport" className="flex flex-col h-full overflow-y-auto custom-scrollbar p-5 gap-6">
          {/* Header Title */}
          <div id="control-panel-header" className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-emerald-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="font-sans font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 tracking-tight text-md">
                PanBio Control
              </h2>
              <p className="font-mono text-[10px] text-slate-500">SYSTEM PARAMETER SUITE</p>
            </div>
          </div>

          {/* Condition & Stressor Switch */}
          <div id="environment-config-section" className="space-y-3">
            <h3 className="font-mono text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Activity size={14} className="text-cyan-400" />
              1. Environmental State
            </h3>
            
            <div className="grid grid-cols-2 gap-2 bg-[#0A0A0B] p-1 rounded border border-white/10">
              <button
                id="condition-control-btn"
                onClick={() => setCondition("Control")}
                className={`py-1.5 px-3 rounded text-xs font-semibold cursor-pointer transition-all ${
                  config.experimentCondition === "Control"
                    ? "bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 shadow-none"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Control
              </button>
              <button
                id="condition-stress-btn"
                onClick={() => setCondition("Stress")}
                className={`py-1.5 px-3 rounded text-xs font-semibold cursor-pointer transition-all ${
                  config.experimentCondition === "Stress"
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-none"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Stress Activated
              </button>
            </div>

            {/* Stressor Select (Dropdown under stress condition) */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-slate-500">Target Plant Stress Model</label>
              <select
                id="stress-type-dropdown"
                value={config.stressType}
                onChange={(e) => setStressType(e.target.value as any)}
                className="w-full bg-[#0A0A0B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Drought">Drought Stress Tolerance (Chr 3)</option>
                <option value="Salinity">Soil Salinity hyper-osmosis (Chr 1)</option>
                <option value="Heat">Thermal Shock Chaperones (Chr 5)</option>
                <option value="Pathogen">Fungal Pathogen Blight (Chr 4)</option>
              </select>
            </div>
          </div>

          {/* Multi-Omics Matrix Ingestion Core */}
          <div id="multi-omics-layers-section" className="space-y-3">
            <h3 className="font-mono text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Layers size={14} className="text-teal-400" />
              2. Matrix Layers Ingestion
            </h3>
            <p className="font-sans text-[11px] text-slate-500 -mt-1 leading-relaxed">
              Dynamically parse, reference and stack biological layers concurrently.
            </p>
            
            <div className="space-y-2 bg-[#0F0F10] p-3 rounded-lg border border-white/5">
              {/* Layer 1: SV */}
              <label id="cfg-layer-sv-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-sv-checkbox"
                    type="checkbox"
                    checked={layers.longReadsSV}
                    onChange={() => toggleLayer("longReadsSV")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">Long-Reads / SV Loci</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">VCF</span>
              </label>

              {/* Layer 2: Epigenetics */}
              <label id="cfg-layer-genomics-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-genomics-checkbox"
                    type="checkbox"
                    checked={layers.genomicsEpigenomics}
                    onChange={() => toggleLayer("genomicsEpigenomics")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">Epigenomics (DNAme/Open)</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/20">M-Array</span>
              </label>

              {/* Layer 3: Transcriptomics */}
              <label id="cfg-layer-transcript-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-transcript-checkbox"
                    type="checkbox"
                    checked={layers.transcriptomics}
                    onChange={() => toggleLayer("transcriptomics")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">RNA-Seq Expression</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-600/20 text-purple-400 border border-purple-500/20">FPKM</span>
              </label>

              {/* Layer 4: Proteomics */}
              <label id="cfg-layer-proteo-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-proteo-checkbox"
                    type="checkbox"
                    checked={layers.proteomics}
                    onChange={() => toggleLayer("proteomics")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">Proteomics Translation</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-600/20 text-amber-400 border border-amber-500/20">LC-MS</span>
              </label>

              {/* Layer 5: Metabolomics */}
              <label id="cfg-layer-metabol-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-metabol-checkbox"
                    type="checkbox"
                    checked={layers.metabolomics}
                    onChange={() => toggleLayer("metabolomics")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">Phytochemical Profiles</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-purple-600/20 text-pink-400 border border-purple-500/20">MS-MS</span>
              </label>

              {/* Layer 6: Phenomics */}
              <label id="cfg-layer-phen-label" className="flex items-center justify-between p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    id="cfg-layer-phen-checkbox"
                    type="checkbox"
                    checked={layers.phenomics}
                    onChange={() => toggleLayer("phenomics")}
                    className="rounded border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-[#141416] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-300">Phenomics Trait Dynamics</span>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/20">PHEN</span>
              </label>
            </div>
          </div>

          {/* Significance filtering controls */}
          <div id="significance-filters-section" className="space-y-4">
            <h3 className="font-mono text-xs text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Sliders size={14} className="text-amber-400" />
              3. Filter Thresholds
            </h3>

            {/* Threshold 1: Min Prioritization / Functional Score */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[11px] text-slate-400">
                <span>Min Variant Functional Score</span>
                <span className="text-emerald-400 font-bold">{config.minFunctionalScore}%</span>
              </div>
              <input
                id="min-func-score-range"
                type="range"
                min="50"
                max="95"
                step="5"
                value={config.minFunctionalScore}
                onChange={(e) => onChangeConfig((prev) => ({ ...prev, minFunctionalScore: Number(e.target.value) }))}
                className="w-full accent-emerald-500 bg-white/10 h-1 rounded-lg border-none outline-none cursor-ew-resize"
              />
            </div>

            {/* Threshold 2: False Discovery Rate (FDR) */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-[11px] text-slate-400">
                <span>False Discovery Rate (FDR)</span>
                <span className="text-cyan-400 font-bold font-semibold">p &lt; {config.maxFdr}</span>
              </div>
              <input
                id="fdr-range"
                type="range"
                min="0.01"
                max="0.1"
                step="0.01"
                value={config.maxFdr}
                onChange={(e) => onChangeConfig((prev) => ({ ...prev, maxFdr: Number(e.target.value) }))}
                className="w-full accent-cyan-500 bg-white/10 h-1 rounded-lg border-none outline-none cursor-ew-resize"
              />
            </div>

            {/* Subgenome selection */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
                <Filter size={10} /> Subgenome Target (Polyploid Matrix)
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#0A0A0B] p-1 rounded border border-white/10">
                {["All", "Subgenome A", "Subgenome B"].map((sg) => (
                  <button
                    id={`subgenome-select-btn-${sg.replace(/\s+/g, '-')}`}
                    key={sg}
                    onClick={() => onChangeConfig((prev) => ({ ...prev, subgenome: sg }))}
                    className={`py-1 text-[10px] rounded font-semibold cursor-pointer transition-all ${
                      config.subgenome === sg
                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {sg === "All" ? "All Genomes" : sg.replace("Subgenome ", "Sub-")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Diagnostic Context Note Box */}
          <div id="diagnostic-infobox" className="mt-auto border border-white/10 bg-white/5 rounded-lg p-3 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
            <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-300">Omics-Coupled Cascade:</span> Under drought stress, 3D Hi-C topology changes at Chromosome 3 trigger the up-regulation of transcription factor <span className="text-zinc-200 underline font-mono">TF-ERF071</span>, translating <span className="text-zinc-200 underline font-mono">GST-U19 protein</span> to boost defensive protective flavonoid levels.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
