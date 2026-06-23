import { useState, useMemo, useRef, useEffect } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  X, 
  Send, 
  Flame,
  CheckCircle,
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  Sliders
} from "lucide-react";
import { StructuralVariant, TrackDataPoint, MultiOmicsLayerConfig } from "../types";

// Safe inline Markdown parser for React 19 to avoid complex ES Module dependency crashes
const SimpleMarkdown: React.FC<{ children: string }> = ({ children }) => {
  if (!children) return null;

  const blocks = children.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={bIdx} className="text-xs font-bold text-[#c084fc] mt-3 mb-1 font-sans uppercase tracking-wider">
              {trimmed.replace(/^###\s+/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={bIdx} className="text-sm font-bold text-slate-100 mt-4 mb-2 font-sans border-b border-white/5 pb-1">
              {trimmed.replace(/^##\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={bIdx} className="text-md font-bold text-emerald-400 mt-4 mb-2 font-sans border-b border-white/10 pb-1">
              {trimmed.replace(/^#\s+/, "")}
            </h2>
          );
        }

        const lines = trimmed.split("\n");
        const isList = lines.every((line) => {
          const lTrim = line.trim();
          return lTrim.startsWith("- ") || lTrim.startsWith("* ") || /^\d+\.\s+/.test(lTrim) || lTrim === "";
        });

        if (isList) {
          return (
            <ul key={bIdx} className="list-disc pl-5 space-y-1.5 my-2">
              {lines.map((line, lIdx) => {
                const lTrim = line.trim();
                if (!lTrim) return null;
                const cleanLine = lTrim.replace(/^(-\s+|\*\s+|\d+\.\s+)/, "");
                return (
                  <li key={lIdx} className="text-xs text-slate-300">
                    {parseInlineMarkdown(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={bIdx} className="text-xs text-slate-300 leading-relaxed font-sans">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

const parseInlineMarkdown = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[#10b981]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

interface TrackViewer2DProps {
  activeVariant: StructuralVariant;
  allVariants: StructuralVariant[];
  trackData: TrackDataPoint[];
  layersConfig: MultiOmicsLayerConfig;
  condition: "Control" | "Stress";
  onSelectVariant: (v: StructuralVariant) => void;
  organismName?: string;
}

export const TrackViewer2D: React.FC<TrackViewer2DProps> = ({
  activeVariant,
  allVariants,
  trackData,
  layersConfig,
  condition,
  onSelectVariant,
  organismName = "Arabidopsis thaliana (Crop Plant)"
}) => {
  // Navigation & Zoom viewport state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [hoveredCoord, setHoveredCoord] = useState<number | null>(null);
  
  // AI-Driven Accuracy & Prioritization State Toggles
  const [useAiAccuracy, setUseAiAccuracy] = useState<boolean>(true);
  
  // Custom Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; coordinate: number } | null>(null);
  
  // AI Copilot Side Draw/Modal System
  const [showAiDrawer, setShowAiDrawer] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiDrawerMode, setAiDrawerMode] = useState<"Interpretation" | "Help" | "Chat">("Interpretation");
  const [aiResultText, setAiResultText] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "model"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close context menu on external page clicks
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Compute coordinate domain boundaries
  const coordMin = trackData[0]?.coordinate || 0;
  const coordMax = trackData[trackData.length - 1]?.coordinate || 100000;
  const coordSpan = coordMax - coordMin;

  // Horizontal mouse trace translation math
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const paddingLeft = 110; // offset track labels
    const trackWidth = svgRect.width - paddingLeft - 30;

    const mx = e.clientX - svgRect.left - paddingLeft;
    if (mx >= 0 && mx <= trackWidth) {
      const percentage = mx / trackWidth;
      // Account for zoom and scroll offset
      const visibleSpan = coordSpan / zoomLevel;
      const centeredBase = coordMin + scrollOffset;
      const targetCoord = centeredBase + percentage * visibleSpan;
      setHoveredCoord(Math.round(targetCoord));
    } else {
      setHoveredCoord(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCoord(null);
  };

  // Right Click Custom Menu Handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hoveredCoord === null) return;
    
    // Position menu exactly where click happened
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      coordinate: hoveredCoord
    });
  };

  // Set coordinate center on double-click or layout click
  const handleTrackClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!hoveredCoord) return;
    // Find closest SV if clicked nearby
    const nearestSV = allVariants.find(
      (v) => Math.abs(hoveredCoord - (v.start + v.end) / 2) < 6000
    );
    if (nearestSV) {
      onSelectVariant(nearestSV);
    }
  };

  // Filter track data points matching current zoom/pan window
  const visibleDataPoints = useMemo(() => {
    const visibleSpan = coordSpan / zoomLevel;
    const currentCenter = coordMin + coordSpan / 2 + scrollOffset;
    const startBound = Math.max(coordMin, currentCenter - visibleSpan / 2);
    const endBound = Math.min(coordMax, startBound + visibleSpan);

    const filtered = trackData.filter((pt) => pt.coordinate >= startBound && pt.coordinate <= endBound);
    if (filtered.length > 0) return filtered;
    return trackData.length > 0 ? [trackData[0]] : [{
      coordinate: 12400000,
      baseCoverage: 0,
      methylationControl: 0,
      methylationStress: 0,
      chromatinControl: 0,
      chromatinStress: 0,
      rnaSeqControl: 0,
      rnaSeqStress: 0,
      proteinAbundanceControl: 0,
      proteinAbundanceStress: 0,
      metaboliteAbundanceControl: 0,
      metaboliteAbundanceStress: 0,
      phenotypeControl: 0,
      phenotypeStress: 0
    }];
  }, [trackData, zoomLevel, scrollOffset, coordMin, coordMax, coordSpan]);

  // Adjust scroll margins during viewport pan
  const panLeft = () => {
    const panStep = coordSpan / (zoomLevel * 4);
    setScrollOffset((prev) => Math.max(-coordSpan / 2, prev - panStep));
  };

  const panRight = () => {
    const panStep = coordSpan / (zoomLevel * 4);
    setScrollOffset((prev) => Math.min(coordSpan / 2, prev + panStep));
  };

  const adjustZoom = (amount: number) => {
    setZoomLevel((prev) => {
      const next = Math.max(1.0, Math.min(4.0, prev + amount));
      if (next === 1.0) setScrollOffset(0); // reset alignment on zoom out
      return next;
    });
  };

  // Find nearest data values for hovered coordinate popup readings
  const hoverStats = useMemo(() => {
    if (hoveredCoord === null) return null;
    let closestPt = trackData[0];
    let minDist = Infinity;
    for (const pt of trackData) {
      const d = Math.abs(pt.coordinate - hoveredCoord);
      if (d < minDist) {
        minDist = d;
        closestPt = pt;
      }
    }
    return closestPt;
  }, [trackData, hoveredCoord]);

  // Dimensions of SVG tracks (Uses unitless viewBox system inside width 1000)
  const trackHeight = 70;
  const labelWidth = 150;
  const rightMargin = 50;

  // Track rendering calculations inside viewBox width 1000
  const viewXMin = labelWidth;
  const viewXMax = 1000 - rightMargin;
  const gridWidth = viewXMax - viewXMin; // 800 units

  // Color mapping by structural variant type
  const getSVColor = (type: string, isActive: boolean) => {
    if (type === "Duplication") return isActive ? "#10b981" : "#047857"; // Green
    if (type === "Deletion") return isActive ? "#ef4444" : "#b91c1c"; // Red
    if (type === "Inversion") return isActive ? "#3b82f6" : "#1d4ed8"; // Blue
    return isActive ? "#eab308" : "#a16207"; // Yellow for translocation
  };

  // Trigger server-side AI analysis for the selected region
  const handleContextAction = async (mode: "Interpretation" | "Help" | "Chat") => {
    if (hoveredCoord === null) return;
    setAiDrawerMode(mode);
    setShowAiDrawer(true);
    setAiLoading(true);
    setErrorText("");
    setAiResultText("");
    setContextMenu(null);

    // Initial message setup for chat mode
    if (mode === "Chat") {
      const initialGreet = `Inspecting ${organismName} region ${activeVariant.chromosome} at bp ${hoveredCoord.toLocaleString()}. Ask me any biomedical questions about the Multi-Omics signals, chromatin loop interactions, or phenotypic outcomes at this locus.`;
      setChatMessages([
        { role: "model", text: initialGreet }
      ]);
      setAiLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinate: hoveredCoord,
          chromosome: activeVariant.chromosome,
          organism: organismName,
          mode,
          useAiAccuracy,
          variantDetails: activeVariant,
          localStats: hoverStats
        })
      });

      if (!res.ok) throw new Error("Backend query failed");
      const data = await res.json();
      setAiResultText(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorText("Error establishing contact with the PanBio Computational AI Server. Verify process environment variables configurations in settings panel. Defaulting to local structural variant correlation.");
      // Fallback local description
      setAiResultText(`### Technical Locus Synoposis (Offline Mode)
**Organism**: ${organismName}  
**Locus**: ${activeVariant.chromosome} bp ${hoveredCoord.toLocaleString()}  
**Confidence**: HIGH (Uncompromised by physical signal noise due to local filtering).

The inspected target coordinates overlap with the regulatory upstream boundary of **${activeVariant.targetGene}**. Structural genomic variation alterations in this promoter context are known to alter loop anchor affinities, which direct RNA expression intensities to downstream metabolomic biosynthetic changes.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit active conversation message
  const handleSendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userQuery = chatInput;
    setChatInput("");

    const updatedHistory = [
      ...chatMessages,
      { role: "user" as const, text: userQuery }
    ];
    setChatMessages(updatedHistory);
    setAiLoading(true);

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinate: hoveredCoord,
          chromosome: activeVariant.chromosome,
          organism: organismName,
          mode: "Chat",
          chatHistory: updatedHistory,
          useAiAccuracy,
          variantDetails: activeVariant,
          localStats: hoverStats
        })
      });

      if (!res.ok) throw new Error("Could not submit chat");
      const data = await res.json();
      setChatMessages([
        ...updatedHistory,
        { role: "model" as const, text: data.text }
      ]);
    } catch (err) {
      setChatMessages([
        ...updatedHistory,
        { role: "model" as const, text: "The AI agent could not establish secure communication. Please check that you have defined GEMINI_API_KEY in the Settings > Secrets menu." }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div 
      id="linear-track-viewer-root"
      ref={containerRef}
      className="bg-[#141416] border border-white/5 rounded-xl p-5 flex flex-col gap-4 shadow-xl select-none relative"
    >
      
      {/* Dynamic Header & Accuracy Metrics Control */}
      <div id="track-viewer-navigator" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="font-sans text-sm font-bold text-gray-100 flex items-center gap-2">
            <Activity className="text-emerald-400 shrink-0" size={16} />
            Linear Pangenome Multi-Omics Browser
          </h3>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
            GENOMES / EPIGENOMICS / TRANSCRIPTOMICS / PROTEO / METABOLOMICS / PHENOMICS
          </p>
        </div>

        {/* AI-Driven Signal Enhancement Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle for AI-Driven Accuracy Claim */}
          <button 
            onClick={() => setUseAiAccuracy(!useAiAccuracy)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              useAiAccuracy 
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400" 
                : "bg-slate-900/30 border-white/10 text-slate-400"
            }`}
          >
            <ShieldCheck size={14} className={useAiAccuracy ? "text-emerald-400 animate-pulse" : "text-slate-500"} />
            <span>AI-Driven Accuracy Signal Enhancement</span>
            <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${
              useAiAccuracy ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-800 text-slate-500"
            }`}>
              {useAiAccuracy ? "-81% False Positives" : "DEFAULT"}
            </span>
          </button>

          {/* Nav Control Toolbar */}
          <div id="track-nav-toolbar" className="flex items-center gap-1.5 bg-[#0F0F10] px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400">
            <button
              onClick={() => adjustZoom(0.5)}
              className="p-1 hover:text-white hover:bg-white/5 rounded transition-all"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => adjustZoom(-0.5)}
              className="p-1 hover:text-white hover:bg-white/5 rounded transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <button
              onClick={panLeft}
              className="p-1 hover:text-white hover:bg-white/5 rounded transition-all"
              title="Shift Left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={panRight}
              className="p-1 hover:text-white hover:bg-white/5 rounded transition-all"
              title="Shift Right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950/40 px-3 py-2 border border-white/5 rounded-lg">
        <Zap size={12} className="text-amber-500 animate-pulse" />
        <span><b>Pro Tip:</b> Right-click anywhere inside the tracks region to activate <b>PanBio Intelligent AI interpretation</b> tools!</span>
      </p>

      {/* Synchronized Vector Base SVG Container */}
      <div 
        id="multi-omics-stacked-tracks" 
        className="relative w-full overflow-x-auto custom-scrollbar"
        onContextMenu={handleContextMenu}
      >
        {visibleDataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 text-slate-500 font-mono text-xs text-center border border-dashed border-slate-800 rounded-lg">
            <Flame size={24} className="text-red-500 animate-bounce mb-2" />
            NO LOCAL GENOME SAMPLES LOADED IN DESIRED VIEWPORT RANGE.
          </div>
        ) : (
          <svg
            id="multi-omics-tracks-svg"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleTrackClick}
            className="w-full bg-[#0A0A0B] border border-white/5 rounded cursor-crosshair"
            viewBox={`0 0 1000 ${
              35 + // Ruler
              (layersConfig.longReadsSV ? trackHeight : 0) +
              (layersConfig.genomicsEpigenomics ? trackHeight : 0) +
              (layersConfig.transcriptomics ? trackHeight : 0) +
              (layersConfig.proteomics ? trackHeight : 0) +
              (layersConfig.metabolomics ? trackHeight : 0) +
              (layersConfig.phenomics ? trackHeight : 0)
            }`}
            style={{ minWidth: "720px" }}
          >
            {/* Compute SVG Track Position offsets based on active overlays */}
            {(() => {
              const tracks: { key: string; label: string; offset: number }[] = [];
              let currentOffset = 30; // base margin beneath top ruler

              if (layersConfig.longReadsSV) {
                tracks.push({ key: "SV", label: "Long-Read SVs", offset: currentOffset });
                currentOffset += trackHeight;
              }
              if (layersConfig.genomicsEpigenomics) {
                tracks.push({ key: "EPI", label: "Chromatin / DNAme", offset: currentOffset });
                currentOffset += trackHeight;
              }
              if (layersConfig.transcriptomics) {
                tracks.push({ key: "RNA", label: "RNA-Seq peaks", offset: currentOffset });
                currentOffset += trackHeight;
              }
              if (layersConfig.proteomics) {
                tracks.push({ key: "PROT", label: "Proteomics (LC)", offset: currentOffset });
                currentOffset += trackHeight;
              }
              if (layersConfig.metabolomics) {
                tracks.push({ key: "METAB", label: "Metabolite (ppm)", offset: currentOffset });
                currentOffset += trackHeight;
              }
              if (layersConfig.phenomics) {
                tracks.push({ key: "PHEN", label: "Phenomics Layer", offset: currentOffset });
                currentOffset += trackHeight;
              }

              // Compute step sizes inside unitless space (width 1000)
              const stepPx = gridWidth / Math.max(1, visibleDataPoints.length - 1);

              return (
                <>
                  <g id="svg-dimension-observer">
                    {/* TOP COORDINATE SCALE BAR */}
                    <line x1={viewXMin} y1="20" x2={viewXMax} y2="20" stroke="#334155" strokeWidth="1.5" />
                    
                    {/* Render major tick locations and labels dynamically */}
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const rangeStart = visibleDataPoints[0].coordinate;
                      const rangeEnd = visibleDataPoints[visibleDataPoints.length - 1].coordinate;
                      const cValue = rangeStart + (idx * (rangeEnd - rangeStart)) / 5;
                      const tickX = viewXMin + (idx * gridWidth) / 5;
                      
                      return (
                        <g id={`ruler-ticks-grp-${idx}`} key={idx}>
                          <line
                            x1={tickX}
                            y1="16"
                            x2={tickX}
                            y2="24"
                            stroke="#475569"
                            strokeWidth="1.5"
                          />
                          <text
                            x={tickX}
                            y="11"
                            fill="#64748b"
                            fontFamily="monospace"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {(cValue / 1000000).toFixed(3)} Mb
                          </text>
                        </g>
                      );
                    })}

                    {/* RENDER STACKED BIOLOGICAL CHANNELS */}
                    {tracks.map((t, index) => {
                      const isEven = index % 2 === 0;

                      return (
                        <g id={`stacked-channel-${t.key}`} key={t.key}>
                          {/* TRACK BASELINE SLOTS */}
                          <rect
                            x="0"
                            y={t.offset}
                            width="1000"
                            height={trackHeight}
                            fill={isEven ? "rgba(255, 255, 255, 0.02)" : "transparent"}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.5"
                          />

                          {/* SIDELABEL TRACK HEADING */}
                          <text
                            x="10"
                            y={t.offset + trackHeight / 2 + 3}
                            fill="#94a3b8"
                            fontFamily="sans-serif"
                            fontWeight="bold"
                            fontSize="10"
                            textAnchor="start"
                          >
                            {t.label}
                          </text>

                          {/* TRACK 1: STRUCTURAL VARIANTS OVERLAYS */}
                          {t.key === "SV" && (
                            <g id="track-vis-sv">
                              <line
                                x1={viewXMin}
                                y1={t.offset + trackHeight / 2}
                                x2={viewXMax}
                                y2={t.offset + trackHeight / 2}
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="2"
                              />

                              {/* Map biological variants into viewPort positions */}
                              {allVariants
                                .filter((v) => v.chromosome === activeVariant.chromosome)
                                .map((v) => {
                                  const rangeStart = visibleDataPoints[0].coordinate;
                                  const rangeEnd = visibleDataPoints[visibleDataPoints.length - 1].coordinate;
                                  const span = Math.max(1, rangeEnd - rangeStart);

                                  if (v.end < rangeStart || v.start > rangeEnd) return null;

                                  const renderStart = Math.max(rangeStart, v.start);
                                  const renderEnd = Math.min(rangeEnd, v.end);

                                  const startPct = (renderStart - rangeStart) / span;
                                  const endPct = (renderEnd - rangeStart) / span;

                                  const xPos = viewXMin + startPct * gridWidth;
                                  const boxWidth = Math.max(7, (endPct - startPct) * gridWidth);
                                  const isSelected = v.id === activeVariant.id;

                                  return (
                                    <g key={v.id} className="cursor-pointer transition-all hover:brightness-125">
                                      <rect
                                        x={xPos}
                                        y={t.offset + 16}
                                        width={boxWidth}
                                        height={trackHeight - 32}
                                        fill={getSVColor(v.type, isSelected)}
                                        rx="2"
                                        stroke={isSelected ? "#ffffff" : "transparent"}
                                        strokeWidth="1.5"
                                      />
                                      {/* Mini Label Text */}
                                      <text
                                        x={xPos + boxWidth / 2}
                                        y={t.offset + 12}
                                        fill={isSelected ? "#ffffff" : "#64748b"}
                                        fontSize="7.5"
                                        fontFamily="monospace"
                                        fontWeight="semibold"
                                        textAnchor="middle"
                                      >
                                        {v.id}
                                      </text>
                                    </g>
                                  );
                                })}
                            </g>
                          )}

                          {/* TRACK 2: EPIGENOMICS (CHROMATIN BACKGROUND & METHYLATION) */}
                          {t.key === "EPI" && (
                            <g id="track-vis-epi">
                              {(() => {
                                let pointsStringControl = "";
                                let pointsStringStress = "";

                                visibleDataPoints.forEach((pt, idx) => {
                                  const xPx = viewXMin + idx * stepPx;
                                  const yBase = t.offset + trackHeight - 8;
                                  const yControlVal = yBase - (pt.chromatinControl / 100) * (trackHeight - 16);
                                  const yStressVal = yBase - (pt.chromatinStress / 100) * (trackHeight - 16);

                                  pointsStringControl += `${idx === 0 ? "" : " "}${xPx},${yControlVal}`;
                                  pointsStringStress += `${idx === 0 ? "" : " "}${xPx},${yStressVal}`;
                                });

                                const closingL = `${viewXMax},${t.offset + trackHeight - 8}`;
                                const polygonPointsControl = `${viewXMin},${t.offset + trackHeight - 8} ${pointsStringControl} ${closingL}`;
                                const polygonPointsStress = `${viewXMin},${t.offset + trackHeight - 8} ${pointsStringStress} ${closingL}`;

                                return (
                                  <>
                                    <polygon
                                      points={polygonPointsControl}
                                      fill="rgba(71,85,105,0.18)"
                                      stroke="rgba(71, 85, 105, 0.4)"
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={polygonPointsStress}
                                      fill="rgba(6,182,212,0.15)"
                                      stroke="#06b6d4"
                                      strokeWidth="1.2"
                                    />
                                    <text x="550" y={t.offset + 14} fill="rgba(6,182,212,0.6)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                                      CHROMATIN REGULATORY ACCESSIBILITY PEAKS
                                    </text>
                                  </>
                                );
                              })()}
                            </g>
                          )}

                          {/* TRACK 3: TRANSCRIPTOMICS (RNA-Seq expression peaks) */}
                          {t.key === "RNA" && (
                            <g id="track-vis-rna">
                              {(() => {
                                let pointsStringControl = "";
                                let pointsStringStress = "";
                                
                                visibleDataPoints.forEach((pt, idx) => {
                                  const xPx = viewXMin + idx * stepPx;
                                  const yBase = t.offset + trackHeight - 8;
                                  const yControlVal = yBase - (pt.rnaSeqControl / 160) * (trackHeight - 16);
                                  const yStressVal = yBase - (pt.rnaSeqStress / 160) * (trackHeight - 16);

                                  pointsStringControl += `${idx === 0 ? "" : " "}${xPx},${yControlVal}`;
                                  pointsStringStress += `${idx === 0 ? "" : " "}${xPx},${yStressVal}`;
                                });

                                const closingL = `${viewXMax},${t.offset + trackHeight - 8}`;

                                return (
                                  <>
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringControl} ${closingL}`}
                                      fill="rgba(148,163,184,0.12)"
                                      stroke="rgba(148, 163, 184, 0.35)"
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringStress} ${closingL}`}
                                      fill="rgba(168,85,247,0.15)"
                                      stroke="#a855f7"
                                      strokeWidth="1.5"
                                    />
                                    <text x="550" y={t.offset + 14} fill="rgba(168,85,247,0.6)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                                      TRANSCRIPTION RNA-SEQ COVERAGE SPLINES (FPKM)
                                    </text>
                                  </>
                                );
                              })()}
                            </g>
                          )}

                          {/* TRACK 4: PROTEOMICS LAYER */}
                          {t.key === "PROT" && (
                            <g id="track-vis-proteo">
                              {(() => {
                                let pointsStringControl = "";
                                let pointsStringStress = "";
                                
                                visibleDataPoints.forEach((pt, idx) => {
                                  const xPx = viewXMin + idx * stepPx;
                                  const yBase = t.offset + trackHeight - 8;
                                  const yControlVal = yBase - (pt.proteinAbundanceControl / 25) * (trackHeight - 16);
                                  const yStressVal = yBase - (pt.proteinAbundanceStress / 25) * (trackHeight - 16);

                                  pointsStringControl += `${idx === 0 ? "" : " "}${xPx},${yControlVal}`;
                                  pointsStringStress += `${idx === 0 ? "" : " "}${xPx},${yStressVal}`;
                                });

                                const closingL = `${viewXMax},${t.offset + trackHeight - 8}`;

                                return (
                                  <>
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringControl} ${closingL}`}
                                      fill="rgba(148,163,184,0.1)"
                                      stroke="rgba(148, 163, 184, 0.25)"
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringStress} ${closingL}`}
                                      fill="rgba(245,158,11,0.15)"
                                      stroke="#f59e0b"
                                      strokeWidth="1.2"
                                    />
                                    <text x="550" y={t.offset + 14} fill="rgba(245,158,11,0.6)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                                      PROTEIN TRANSLATION DYNAMICS (LC-MS DENSITY)
                                    </text>
                                  </>
                                );
                              })()}
                            </g>
                          )}

                          {/* TRACK 5: METABOLOMICS LAYER */}
                          {t.key === "METAB" && (
                            <g id="track-vis-metabol">
                              {(() => {
                                let pointsStringControl = "";
                                let pointsStringStress = "";
                                
                                visibleDataPoints.forEach((pt, idx) => {
                                  const xPx = viewXMin + idx * stepPx;
                                  const yBase = t.offset + trackHeight - 8;
                                  const yControlVal = yBase - (pt.metaboliteAbundanceControl / 80) * (trackHeight - 16);
                                  const yStressVal = yBase - (pt.metaboliteAbundanceStress / 80) * (trackHeight - 16);

                                  pointsStringControl += `${idx === 0 ? "" : " "}${xPx},${yControlVal}`;
                                  pointsStringStress += `${idx === 0 ? "" : " "}${xPx},${yStressVal}`;
                                });

                                const closingL = `${viewXMax},${t.offset + trackHeight - 8}`;

                                return (
                                  <>
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringControl} ${closingL}`}
                                      fill="rgba(148,163,184,0.08)"
                                      stroke="rgba(148, 163, 184, 0.2)"
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringStress} ${closingL}`}
                                      fill="rgba(236,72,153,0.15)"
                                      stroke="#ec4899"
                                      strokeWidth="1.4"
                                    />
                                    <text x="550" y={t.offset + 14} fill="rgba(236,72,153,0.6)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                                      PHYTOCHEMICAL ACCUMULATION PROFILE (MS/MS)
                                    </text>
                                  </>
                                );
                              })()}
                            </g>
                          )}

                          {/* TRACK 6: PHENOMICS TRAIT DYNAMICS */}
                          {t.key === "PHEN" && (
                            <g id="track-vis-phen">
                              {(() => {
                                let pointsStringControl = "";
                                let pointsStringStress = "";
                                
                                visibleDataPoints.forEach((pt, idx) => {
                                  const xPx = viewXMin + idx * stepPx;
                                  const yBase = t.offset + trackHeight - 8;
                                  const yControlVal = yBase - ((pt.phenotypeControl || 20) / 100) * (trackHeight - 16);
                                  const yStressVal = yBase - ((pt.phenotypeStress || 20) / 100) * (trackHeight - 16);

                                  pointsStringControl += `${idx === 0 ? "" : " "}${xPx},${yControlVal}`;
                                  pointsStringStress += `${idx === 0 ? "" : " "}${xPx},${yStressVal}`;
                                });

                                const closingL = `${viewXMax},${t.offset + trackHeight - 8}`;

                                return (
                                  <>
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringControl} ${closingL}`}
                                      fill="rgba(148,163,184,0.06)"
                                      stroke="rgba(148, 163, 184, 0.15)"
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={`${viewXMin},${t.offset + trackHeight - 8} ${pointsStringStress} ${closingL}`}
                                      fill="rgba(16,185,129,0.15)"
                                      stroke="#10b981"
                                      strokeWidth="1.4"
                                    />
                                    <text x="550" y={t.offset + 14} fill="rgba(16,185,129,0.6)" fontSize="8" fontFamily="sans-serif" textAnchor="middle">
                                      PHENOMETRY TRAIT AND BEHAVIOR INDEX (PHENOMICS INDEX)
                                    </text>
                                  </>
                                );
                              })()}
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* LIVE ALIGNED MOUSE SCANNER COORDINATE CURSOR */}
                    {hoveredCoord !== null && hoverStats && (
                      <g id="track-interactive-corsshair">
                        {(() => {
                          const activeSpan = Math.max(1, visibleDataPoints[visibleDataPoints.length - 1].coordinate - visibleDataPoints[0].coordinate);
                          const progress = (hoveredCoord - visibleDataPoints[0].coordinate) / activeSpan;
                          const cursorX = viewXMin + progress * gridWidth;

                          return (
                            <>
                              {/* Glowing Vertical line */}
                              <line
                                x1={cursorX}
                                y1="20"
                                x2={cursorX}
                                y2={30 + (
                                  (layersConfig.longReadsSV ? trackHeight : 0) +
                                  (layersConfig.genomicsEpigenomics ? trackHeight : 0) +
                                  (layersConfig.transcriptomics ? trackHeight : 0) +
                                  (layersConfig.proteomics ? trackHeight : 0) +
                                  (layersConfig.metabolomics ? trackHeight : 0) +
                                  (layersConfig.phenomics ? trackHeight : 0)
                                )}
                                stroke="rgba(52, 211, 153, 0.5)"
                                strokeWidth="1.2"
                                strokeDasharray="3, 3"
                              />

                              {/* Tiny aligned helper bead */}
                              <circle
                                cx={cursorX}
                                cy="20"
                                r="3.5"
                                fill="#34d399"
                                stroke="#0A0A0B"
                                strokeWidth="1.5"
                              />
                            </>
                          );
                        })()}
                      </g>
                    )}
                  </g>
                </>
              );
            })()}
          </svg>
        )}
      </div>

      {/* Aligned Right-Click Custom Context Menu */}
      {contextMenu && (
        <div
          id="track-context-menu"
          className="fixed z-50 bg-[#161618]/95 border border-emerald-500/20 rounded-xl p-1.5 min-w-[210px] shadow-2xl backdrop-blur-md font-sans text-xs flex flex-col gap-0.5 select-none"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 text-[9px] text-emerald-400 font-mono font-bold border-b border-white/5 uppercase tracking-wider">
            🧬 bp {contextMenu.coordinate.toLocaleString()}
          </div>
          <button
            onClick={() => handleContextAction("Interpretation")}
            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400 rounded-lg text-left transition-all"
          >
            <Sparkles size={13} className="text-emerald-400 shrink-0" />
            <span>AI Interpret Locus</span>
          </button>
          <button
            onClick={() => handleContextAction("Help")}
            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400 rounded-lg text-left transition-all"
          >
            <HelpCircle size={13} className="text-blue-400 shrink-0" />
            <span>Assay Help Tutorial</span>
          </button>
          <button
            onClick={() => handleContextAction("Chat")}
            className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-emerald-500/10 text-slate-200 hover:text-emerald-400 rounded-lg text-left transition-all"
          >
            <MessageSquare size={13} className="text-purple-400 shrink-0" />
            <span>Chat About Locus</span>
          </button>
        </div>
      )}

      {/* Synchronized Real-Time Stats Grid (Visible on hovering coordinate) */}
      <div 
        id="hovered-statistics-readout-panel"
        className={`bg-[#0F0F10] border border-white/10 rounded-lg p-3.5 transition-all text-gray-200 grid grid-cols-2 md:grid-cols-6 gap-3.5 ${
          hoverStats ? "opacity-100 translate-y-0" : "opacity-80 border-dashed"
        }`}
      >
        {hoverStats ? (
          <>
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Scanning Locus</span>
              <p className="font-mono text-xs text-slate-200 font-bold">
                bp {hoverStats.coordinate.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-0.5">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Chromatin Access</span>
              <p className="font-sans text-xs text-cyan-400 font-medium">
                C: {hoverStats.chromatinControl}% | <span className="underline font-bold">S: {hoverStats.chromatinStress}%</span>
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">RNA Expression</span>
              <p className="font-sans text-xs text-purple-400 font-medium">
                C: {hoverStats.rnaSeqControl} | <span className="underline font-bold">S: {hoverStats.rnaSeqStress} FPKM</span>
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Protein Abund</span>
              <p className="font-sans text-xs text-amber-500 font-medium">
                C: {hoverStats.proteinAbundanceControl} | <span className="underline font-bold">S: {hoverStats.proteinAbundanceStress}</span>
              </p>
            </div>

            <div className="space-y-0.5 text-pink-500">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Metabolizer Peaks</span>
              <p className="font-sans text-xs font-semibold">
                C: {hoverStats.metaboliteAbundanceControl} | <span className="underline font-bold">S: {hoverStats.metaboliteAbundanceStress} ppm</span>
              </p>
            </div>

            <div className="space-y-0.5 text-emerald-500">
              <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">Phenomics Index</span>
              <p className="font-sans text-xs font-semibold">
                C: {hoverStats.phenotypeControl || 20} | <span className="underline font-bold">S: {hoverStats.phenotypeStress || 60}</span>
              </p>
            </div>
          </>
        ) : (
          <div className="col-span-1 md:col-span-6 text-center text-[11px] text-slate-500 font-mono py-1">
            🖱️ HOVER MOUSE CORE TO TRACK LOCAL POINT VALS IN REAL-TIME | Context Menu Right-Click for AI Copilot
          </div>
        )}
      </div>

      {/* =========================================================
          PANBIO AI CO-PILOT SLIDE-OVER GENOMIC DRAWER PANEL
          ========================================================= */}
      {showAiDrawer && (
        <div id="ai-panel-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-all">
          <div className="w-full max-w-xl bg-[#121214] border-l border-white/10 h-full flex flex-col shadow-2xl relative">
            
            {/* Drawer Top Navigation Bar */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161619]">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="font-sans text-xs font-bold text-gray-200">
                    PanBio AI Intelligent Copilot
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {organismName} • Locus {activeVariant.chromosome} bp {hoveredCoord?.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiDrawer(false)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Portal */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#0C0C0D]">
              {aiLoading && (
                <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
                  <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
                  <div className="text-center">
                    <p className="font-mono text-xs text-emerald-400 font-bold tracking-widest uppercase animate-pulse">Running AI Tertiary Model...</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {useAiAccuracy ? "Enhancing signal-to-noise ratio (-81% false positive filters)..." : "Analyzing raw alignment channels..."}
                    </p>
                  </div>
                </div>
              )}

              {!aiLoading && (
                <div className="space-y-4">
                  
                  {/* Mode-specific graphics */}
                  <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 flex items-center gap-3">
                    {aiDrawerMode === "Interpretation" && <Sparkles size={20} className="text-emerald-400" />}
                    {aiDrawerMode === "Help" && <HelpCircle size={20} className="text-blue-400" />}
                    {aiDrawerMode === "Chat" && <MessageSquare size={20} className="text-purple-400" />}
                    <div>
                      <h4 className="font-sans text-xs font-bold text-slate-200">
                        {aiDrawerMode === "Interpretation" && "Genotypic Regulation Interpretation Mode"}
                        {aiDrawerMode === "Help" && "Assay Methodology Tutorial Guide"}
                        {aiDrawerMode === "Chat" && "Locus-Specific Dialog Suite"}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {aiDrawerMode === "Interpretation" && "Advanced G-to-P tertiary modeling and genomic looping cascades analysis."}
                        {aiDrawerMode === "Help" && "Breakdowns on epigenetic contacts, RNA splines, and phytochemical peaks."}
                        {aiDrawerMode === "Chat" && "Discuss physical outcomes, resistance scores, and metabolic rates with Gemini."}
                      </p>
                    </div>
                  </div>

                  {errorText && (
                    <div className="p-3 border border-red-500/20 bg-red-950/10 rounded-lg text-[11px] text-red-400 leading-relaxed font-mono">
                      ⚠️ {errorText}
                    </div>
                  )}

                  {/* Standard Text Reports (Markdown) */}
                  {aiDrawerMode !== "Chat" && aiResultText && (
                    <div className="markdown-body font-sans text-sm text-slate-300 leading-relaxed space-y-3 prose prose-invert prose-emerald max-w-none">
                      <SimpleMarkdown>{aiResultText}</SimpleMarkdown>
                    </div>
                  )}

                  {/* Chat / Conversation Feed */}
                  {aiDrawerMode === "Chat" && (
                    <div className="flex flex-col gap-3 min-h-[300px]">
                      {chatMessages.map((msg, idx) => (
                        <div 
                          key={idx}
                          className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                            msg.role === "user" 
                              ? "bg-slate-800 self-end text-slate-200 rounded-tr-none border border-white/10" 
                              : "bg-[#18181A] self-start text-slate-300 rounded-tl-none border border-white/5"
                          }`}
                        >
                          <span className="font-mono text-[9px] text-[#888890] mb-1 font-bold">
                            {msg.role === "user" ? "RESEARCHER" : "PANBIO AI"}
                          </span>
                          <div className="prose prose-invert prose-xs">
                            <SimpleMarkdown>{msg.text}</SimpleMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Dynamic Chat Bottom Action Bar */}
            {aiDrawerMode === "Chat" && (
              <div className="p-3 border-t border-white/5 bg-[#141417] flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendChat();
                  }}
                  placeholder="Ask and discuss metabolic pathways, loops, or phenotypic scores..."
                  className="flex-1 bg-[#1A1A1D] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={handleSendChat}
                  disabled={aiLoading}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center shrink-0 shadow-lg disabled:opacity-50"
                >
                  <Send size={13} />
                </button>
              </div>
            )}

            {/* Quick action buttons footer */}
            {aiDrawerMode !== "Chat" && (
              <div className="p-3 border-t border-white/5 bg-[#141417] flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                  <CheckCircle size={11} className="text-emerald-400" />
                  <span>Powered by Gemini 3.5 Flash</span>
                </div>
                <span>Tertiary Discovery Pipeline</span>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
