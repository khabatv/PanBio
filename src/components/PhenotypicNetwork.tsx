import React, { useState, useEffect } from "react";
import { 
  GitCommit, 
  HelpCircle, 
  ChevronRight, 
  ArrowRight, 
  Leaf, 
  Compass, 
  Activity,
  Globe
} from "lucide-react";
import { PathwayStructure, PhenotypicNode, PhenotypicLink } from "../types";

interface PhenotypicNetworkProps {
  id: string; // Active variant ID determining which cascade to render
  pathway: PathwayStructure;
  condition: "Control" | "Stress";
}

export const PhenotypicNetwork: React.FC<PhenotypicNetworkProps> = ({
  id,
  pathway,
  condition,
}) => {
  const [selectedNode, setSelectedNode] = useState<PhenotypicNode | null>(null);
  const [pulseTime, setPulseTime] = useState<number>(0);

  // Set default selection when pathway changes
  useEffect(() => {
    if (pathway?.nodes?.length > 0) {
      setSelectedNode(pathway.nodes[0]);
    }
  }, [pathway]);

  // Floating particles loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseTime((t) => (t + 0.05) % 1.0);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  if (!pathway) return null;

  const { nodes, links } = pathway;

  // Static horizontal positions for high-fidelity alignment
  const getNodePos = (type: PhenotypicNode["type"]) => {
    if (type === "Variant") return { x: 70, y: 150 };
    if (type === "Transcript") return { x: 230, y: 150 };
    if (type === "Protein") return { x: 390, y: 150 };
    if (type === "Metabolite") return { x: 550, y: 150 };
    return { x: 710, y: 150 }; // Phenotype
  };

  const getNodeColor = (type: PhenotypicNode["type"]) => {
    if (type === "Variant") return "#10b981"; // Emerald
    if (type === "Transcript") return "#8b5cf6"; // Violet
    if (type === "Protein") return "#f59e0b"; // Amber
    if (type === "Metabolite") return "#ec4899"; // Pink
    return "#3b82f6"; // Blue
  };

  return (
    <div 
      id="phenotypic-network-projection-card"
      className="bg-[#141416] border border-white/5 rounded-xl p-5 flex flex-col h-[380px] relative overflow-hidden"
    >
      {/* Detail Panel Title Header */}
      <div id="pathway-network-header" className="flex items-center justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
            </span>
            <span className="font-mono text-[10px] text-slate-500 tracking-wider font-semibold uppercase">Trans-Omics Biological Cascade</span>
          </div>
          <h3 className="font-sans font-bold text-slate-200 mt-1 text-md">
            Phenotypic Pathway Projection Map
          </h3>
        </div>
        
        <span className="font-mono text-[10px] uppercase bg-[#111112] border border-white/10 text-slate-400 px-2 py-1 rounded">
          {condition === "Stress" ? "🔥 Drought/Stress Loaded" : "🧬 Baseline State"}
        </span>
      </div>

      {/* Main SVG workspace mapping biological flowing nodes */}
      <div id="pathway-network-svg-container" className="flex-1 min-h-[180px] relative mt-1 overflow-x-auto custom-scrollbar flex items-center">
        <svg 
          id="pathway-vector-canvas"
          className="w-full min-w-[760px] h-[230px]"
          viewBox="0 0 780 250"
        >
          <defs>
            {/* Soft linear gradient fills for connecting links */}
            <linearGradient id="variant-to-transcript" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="transcript-to-protein" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="protein-to-metabolite" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="metabolite-to-pheno" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
            </linearGradient>

            {/* Glowing marker dots */}
            <filter id="network-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* RENDER BIOLOGICAL LINK CHANNELS WITH FLOATING GLOW PARTICLES */}
          {links.map((link, idx) => {
            const pSource = getNodePos(nodes.find(n => n.id === link.source)?.type || "Variant");
            const pTarget = getNodePos(nodes.find(n => n.id === link.target)?.type || "Transcript");
            
            // Connect coordinates
            const pathD = `M ${pSource.x} ${pSource.y} C ${(pSource.x + pTarget.x)/2} ${pSource.y - 12}, ${(pSource.x + pTarget.x)/2} ${pTarget.y + 12}, ${pTarget.x} ${pTarget.y}`;
            let gradId = "variant-to-transcript";
            if (idx === 1) gradId = "transcript-to-protein";
            if (idx === 2) gradId = "protein-to-metabolite";
            if (idx === 3) gradId = "metabolite-to-pheno";

            const isActiveFlow = condition === "Stress";

            return (
              <g id={`link-segment-group-${idx}`} key={`link-${idx}`}>
                {/* Thick shadow pathway backing */}
                <path
                  d={pathD}
                  stroke={`url(#${gradId})`}
                  strokeWidth={isActiveFlow ? "4.5" : "2.2"}
                  fill="none"
                  opacity={isActiveFlow ? 0.85 : 0.4}
                />

                {/* Sparkling signal traveling from source to target inside stress */}
                {isActiveFlow && (
                  <circle
                    r="4.5"
                    fill={getNodeColor(nodes.find(n => n.id === link.target)?.type || "Transcript")}
                    filter="url(#network-glow)"
                  >
                    <animateMotion
                      path={pathD}
                      dur="2.5s"
                      repeatCount="indefinite"
                      rotate="auto"
                    />
                  </circle>
                )}
                
                {/* Correlation coefficient indicator bubble */}
                <g transform={`translate(${(pSource.x + pTarget.x) / 2}, ${(pSource.y + pTarget.y) / 2 - 12})`}>
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="16"
                    rx="3"
                    fill="#0A0A0B"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.8"
                  />
                  <text
                    y="2"
                    fill={link.correlation > 0.8 ? "#34d399" : "#94a3b8"}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="semibold"
                    textAnchor="middle"
                  >
                    r={link.correlation.toFixed(2)}
                  </text>
                </g>
              </g>
            );
          })}

          {/* RENDER INTERACTIVE SIGNAL BIOLOGICAL NODES */}
          {nodes.map((node) => {
            const pos = getNodePos(node.type);
            const isSelected = selectedNode && selectedNode.id === node.id;
            const nColor = getNodeColor(node.type);

            // Compute value difference based on current environmental condition
            const hasStressUpregulation = node.valueStress > node.valueControl;
            const valueRatio = node.valueControl > 0 ? (node.valueStress / node.valueControl).toFixed(1) : "0";
            
            // Render shapes depending on bio levels
            let shapeElement = null;
            if (node.type === "Variant") {
              shapeElement = (
                <rect
                  x="-20" y="-20" width="40" height="40" rx="6"
                  fill="#061619" stroke={nColor} strokeWidth={isSelected ? "2.5" : "1.2"}
                  filter={isSelected ? "url(#network-glow)" : ""}
                />
              );
            } else if (node.type === "Phenotype") {
              shapeElement = (
                <polygon
                  points="0,-24 22,12 -22,12"
                  fill="#03132c" stroke={nColor} strokeWidth={isSelected ? "2.5" : "1.2"}
                  filter={isSelected ? "url(#network-glow)" : ""}
                />
              );
            } else {
              shapeElement = (
                <circle
                  r="20"
                  fill="#0a051c" stroke={nColor} strokeWidth={isSelected ? "2.5" : "1.2"}
                  filter={isSelected ? "url(#network-glow)" : ""}
                />
              );
            }

            return (
              <g
                id={`network-node-grp-${node.id}`}
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer"
              >
                {/* Visual back glow for stress state */}
                {condition === "Stress" && (
                  <circle
                    r="25"
                    fill={nColor}
                    opacity="0.12"
                    filter="url(#network-glow)"
                  />
                )}

                {/* Primary Geometry */}
                {shapeElement}

                {/* Tiny type identifier icon inside shape */}
                <text
                  y="4"
                  fill={nColor}
                  fontWeight="bold"
                  fontSize="9"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {node.type.substring(0, 1)}
                </text>

                {/* Main Label text centered below nodes */}
                <text
                  y="34"
                  fill={isSelected ? "#ffffff" : "#cbd5e1"}
                  fontWeight={isSelected ? "bold" : "600"}
                  fontSize="9"
                  textAnchor="middle"
                >
                  {node.label}
                </text>

                {/* Environmental Stress Dynamic Tag directly on nodes */}
                <g transform="translate(0, -28)">
                  <rect
                    x="-24"
                    y="-7"
                    width="48"
                    height="13"
                    rx="3"
                    fill={condition === "Stress" ? "#111112" : "#0F0F10"}
                    stroke={condition === "Stress" ? nColor : "rgba(255,255,255,0.1)"}
                    strokeWidth="0.8"
                  />
                  <text
                    y="2"
                    fill={condition === "Stress" ? nColor : "#94a3b8"}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="semibold"
                    textAnchor="middle"
                  >
                    {condition === "Stress" ? `${node.valueStress} ${node.unit.substring(0,3)}` : `${node.valueControl} ${node.unit.substring(0,3)}`}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Linked Detail Badges Overlays (Displays annotation details of selected Node inline) */}
      {selectedNode && (
        <div 
          id="pathway-selected-node-detail-pnl"
          className="p-3.5 bg-[#111112] border border-white/10 rounded-lg text-slate-300 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {/* Node Category label badge */}
          <div className="md:col-span-1 border-r border-white/10 pr-3 flex flex-col justify-center">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">Selected Node Layer</span>
            <span 
              className="text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded text-left self-start"
              style={{ 
                color: getNodeColor(selectedNode.type),
                backgroundColor: `${getNodeColor(selectedNode.type)}20`
              }}
            >
              • {selectedNode.type.toUpperCase()}: {selectedNode.label}
            </span>
          </div>

          {/* Description details */}
          <div className="md:col-span-2 space-y-1">
            <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Functional Biomutant Annotation</span>
            <p className="text-xs text-slate-300 leading-normal font-sans">
              {selectedNode.description}
            </p>
          </div>

          {/* Value comparator */}
          <div className="md:col-span-1 pl-3 bg-white/5 border-l border-white/10 flex flex-col justify-center">
            <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Magnitude Comparison</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="text-center">
                <p className="font-mono text-[10px] text-slate-400">Control</p>
                <p className="font-bold text-slate-300 font-sans text-xs">
                  {selectedNode.valueControl} <span className="text-[9px] text-slate-500 font-normal">{selectedNode.unit}</span>
                </p>
              </div>
              <ArrowRight size={12} className="text-slate-600 mt-3" />
              <div className="text-center">
                <p className="font-mono text-[10px] text-emerald-400">Stress</p>
                <p className="font-bold text-emerald-400 font-sans text-xs">
                  {selectedNode.valueStress} <span className="text-[9px] text-emerald-500 font-normal">{selectedNode.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
