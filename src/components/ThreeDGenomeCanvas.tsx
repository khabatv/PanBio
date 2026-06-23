import React, { useRef, useEffect, useState } from "react";
import { 
  Orbit, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  Link2
} from "lucide-react";
import { ChromatinLoop3D, ActiveFilterConfig } from "../types";

interface ThreeDGenomeCanvasProps {
  activeLoop: ChromatinLoop3D;
  condition: "Control" | "Stress";
  onSelectNode: (nodeName: string) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
  label?: string;
  id?: string;
}

export const ThreeDGenomeCanvas: React.FC<ThreeDGenomeCanvasProps> = ({
  activeLoop,
  condition,
  onSelectNode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 3D rotation angles & settings
  const [yaw, setYaw] = useState<number>(0.8); // horizontal rotation
  const [pitch, setPitch] = useState<number>(0.4); // vertical rotation
  const [zoom, setZoom] = useState<number>(1.1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<Point3D | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const angleStart = useRef({ yaw: 0, pitch: 0 });
  
  // Active animation timeline frame ID
  const animationFrameId = useRef<number>(0);
  const pulsePhase = useRef<number>(0);

  // Generate 3D loop geometry
  // In Control state: the DNA strand stretches out loosely with low anchoring (loop is open)
  // In Stress state: the enhancer and promoter physically fold and loop close together!
  const getLoop3DPoints = (): { chromatinBackbone: Point3D[]; specialNodes: Point3D[] } => {
    const points: Point3D[] = [];
    const numPoints = 65;
    
    // Nodes anchoring positions
    let anchorDistance = condition === "Stress" ? 35 : 110; 

    // Generate a beautiful looped curve using custom sine-cos mathematics reflecting biological loops
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const angle = t * Math.PI * 2.1;

      let x = 0;
      let y = 0;
      let z = 0;

      if (condition === "Stress") {
        // High-stress active loop: creates a compact loop where anchors A & B are adjacent
        // Ribbon fold shape
        x = Math.sin(angle) * 75;
        y = Math.cos(angle * 2) * 35 + Math.sin(angle) * 15;
        z = Math.cos(angle) * 60;
      } else {
        // Control: open, relaxed chromatin curve
        x = (t - 0.5) * 220;
        y = Math.sin(angle) * 35;
        z = Math.cos(angle * 0.8) * 35;
      }

      points.push({ x, y, z });
    }

    // Special functional markers: Anchor A (Enhancer) & Anchor B (Target Gene)
    // Anchor A: roughly at 20% along the path, Anchor B: roughly at 80% along the path
    const idxA = Math.floor(numPoints * 0.22);
    const idxB = Math.floor(numPoints * 0.78);

    const posA = points[idxA];
    const posB = points[idxB];

    const specialNodes: Point3D[] = [
      {
        id: "anchor-cre",
        x: posA.x,
        y: posA.y,
        z: posA.z,
        color: "#10b981", // Emerald
        size: 9,
        label: activeLoop.cisRegulatoryElement || "Enhancer Motif",
      },
      {
        id: "anchor-gene",
        x: posB.x,
        y: posB.y,
        z: posB.z,
        color: "#c084fc", // Purple-magenta
        size: 9,
        label: activeLoop.targetGene || "Target Promoter",
      }
    ];

    return { chromatinBackbone: points, specialNodes };
  };

  // Perform pitch/yaw 3D projection
  const projectPoint = (pt: Point3D, width: number, height: number): { sx: number; sy: number; depth: number } => {
    // 1. Rotate around Y-axis (Yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x1 = pt.x * cosY - pt.z * sinY;
    const z1 = pt.x * sinY + pt.z * cosY;

    // 2. Rotate around X-axis (Pitch)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y2 = pt.y * cosP - z1 * sinP;
    const z2 = pt.y * sinP + z1 * cosP;

    // 3. Orthographic/Perspective projection
    const perspectiveFactor = 300 / Math.max(10, 300 + z2); // perspective depth compression
    const sx = width / 2 + x1 * zoom * perspectiveFactor;
    const sy = height / 2 + y2 * zoom * perspectiveFactor;

    return { sx, sy, depth: z2 };
  };

  // Drag handlers to spin the 3D model
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    angleStart.current = { yaw, pitch };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      setYaw(angleStart.current.yaw + deltaX * 0.007);
      setPitch(Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, angleStart.current.pitch + deltaY * 0.007)));
    } else {
      // Mouse move hover selection collision check
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      const { specialNodes } = getLoop3DPoints();
      let matchedNode: Point3D | null = null;

      for (const node of specialNodes) {
        const { sx, sy } = projectPoint(node, logicalWidth, logicalHeight);
        const dist = Math.hypot(mx - sx, my - sy);
        if (dist < 15) {
          matchedNode = node;
          break;
        }
      }

      setHoveredNode(matchedNode);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      onSelectNode(hoveredNode.label || "");
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high density displays (retina precision scaling)
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const draw = () => {
      pulsePhase.current += 0.04;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.clearRect(0, 0, width, height);

      // Grid helper on bottom plane (TAD depth field)
      ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      const gridRange = 3;
      for (let i = -gridRange; i <= gridRange; i++) {
        // Horizontal gridlines
        const p1 = projectPoint({ x: -120, y: 70, z: i * gridSpacing }, width, height);
        const p2 = projectPoint({ x: 120, y: 70, z: i * gridSpacing }, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.strokeStyle = "rgba(30, 41, 59, 0.3)";
        ctx.stroke();

        // Vertical gridlines
        const p3 = projectPoint({ x: i * gridSpacing, y: 70, z: -120 }, width, height);
        const p4 = projectPoint({ x: i * gridSpacing, y: 70, z: 120 }, width, height);
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.stroke();
      }

      const { chromatinBackbone, specialNodes } = getLoop3DPoints();

      // 1. Draw glowing background haze for stress contact point
      if (condition === "Stress") {
        const center = projectPoint({ x: 0, y: 0, z: 0 }, width, height);
        const radialGrad = ctx.createRadialGradient(
          center.sx, center.sy, 2,
          center.sx, center.sy, 110 * zoom
        );
        radialGrad.addColorStop(0, "rgba(16, 185, 129, 0.09)"); // emerald
        radialGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.04)"); // cyan
        radialGrad.addColorStop(1, "transparent");
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(center.sx, center.sy, 120 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Project and sort backbone points for appropriate depth drawing
      const projectedBackbone = chromatinBackbone.map((pt, index) => {
        return { ...projectPoint(pt, width, height), originalIndex: index };
      });

      // Draw chromatin skeleton line (3D tape)
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      // Multi-colored biological tracking gradient
      for (let i = 0; i < projectedBackbone.length - 1; i++) {
        const pt1 = projectedBackbone[i];
        const pt2 = projectedBackbone[i + 1];

        ctx.beginPath();
        ctx.moveTo(pt1.sx, pt1.sy);
        ctx.lineTo(pt2.sx, pt2.sy);

        // Gradient shifting along the chromosomal sequence
        const progress = i / projectedBackbone.length;
        if (condition === "Stress") {
          // Glow and flow high stress response colors
          ctx.strokeStyle = `hsla(${140 + progress * 100}, 85%, 60%, ${0.5 + Math.sin(pulsePhase.current + progress * 6) * 0.15})`;
          ctx.lineWidth = 3.5;
        } else {
          // Low activity structural chromatin (calm slate blue)
          ctx.strokeStyle = `hsla(${210 + progress * 40}, 50%, 50%, 0.45)`;
          ctx.lineWidth = 2.5;
        }
        ctx.stroke();
      }

      // 3. Draw flowing energy particles under Stress to denote physical regulatory transcription currents!
      if (condition === "Stress") {
        ctx.fillStyle = "#34d399";
        const particleCount = 4;
        for (let p = 0; p < particleCount; p++) {
          const particleOffset = (pulsePhase.current * 0.15 + p / particleCount) % 1;
          const index = Math.floor(particleOffset * (projectedBackbone.length - 1));
          const pt = projectedBackbone[index];
          const pulseSize = 3 + Math.sin(pulsePhase.current * 2 + p) * 1;
          
          ctx.beginPath();
          ctx.arc(pt.sx, pt.sy, pulseSize, 0, Math.PI * 2);
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      // 4. Draw Hi-C loop interactions (bridge arc indicating 3D contact)
      // Connect special Anchor A and Anchor B visually if looping occurs
      const ptA = projectPoint(specialNodes[0], width, height);
      const ptB = projectPoint(specialNodes[1], width, height);

      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.moveTo(ptA.sx, ptA.sy);
      ctx.bezierCurveTo(
        (ptA.sx + ptB.sx) / 2, (ptA.sy + ptB.sy) / 2 - 40 * zoom,
        (ptA.sx + ptB.sx) / 2, (ptA.sy + ptB.sy) / 2 - 10 * zoom,
        ptB.sx, ptB.sy
      );
      
      if (condition === "Stress") {
        ctx.strokeStyle = "rgba(52, 211, 153, 0.8)"; // Highlight green
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw loop label "Hi-C loop contact"
        ctx.setLineDash([]);
        ctx.fillStyle = "#34d399";
        ctx.font = "italic Bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `ACTIVE DI-LOOP (Freq: ${activeLoop.contactFrequencyStress}%)`,
          (ptA.sx + ptB.sx) / 2,
          (ptA.sy + ptB.sy) / 2 - 30 * zoom
        );
      } else {
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)"; // Faded control grey
        ctx.lineWidth = 0.8;
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.fillStyle = "#64748b";
        ctx.font = "italic 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(
          `RELAXED TETHER (Freq: ${activeLoop.contactFrequencyControl || 12}%)`,
          (ptA.sx + ptB.sx) / 2,
          (ptA.sy + ptB.sy) / 2 - 25 * zoom
        );
      }

      // 5. Render Special Anchors as spheres with depth sorting
      const sortedSpecialNodes = specialNodes.map(pt => ({
        ...pt,
        proj: projectPoint(pt, width, height)
      })).sort((a, b) => b.proj.depth - a.proj.depth); // sort back-to-front

      sortedSpecialNodes.forEach((node) => {
        const { sx, sy } = node.proj;
        const radius = node.size || 8;

        // Visual outer selection ring for hover effect
        const isHovered = hoveredNode && hoveredNode.label === node.label;
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(sx, sy, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = node.color || "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw radial highlights (make it look 3D)
        const radGrad = ctx.createRadialGradient(
          sx - radius/3, sy - radius/3, radius/6,
          sx, sy, radius
        );
        radGrad.addColorStop(0, "#ffffff");
        radGrad.addColorStop(0.3, node.color || "#06b6d4");
        radGrad.addColorStop(1, "#030712");

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Node outline
        ctx.strokeStyle = "rgba(15, 23, 42, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw node labels slightly offset
        ctx.fillStyle = isHovered ? "#ffffff" : "#cbd5e1";
        ctx.font = isHovered ? "bold 11px sans-serif" : "500 10px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(` ${node.label}`, sx + radius + 3, sy + 3);

        // Small coordinate trace tag
        ctx.fillStyle = "rgba(100, 116, 139, 0.8)";
        ctx.font = "8px monospace";
        const coordinateLabel = node.id === "anchor-cre" ? "SV Dup Site" : "Target Promoter";
        ctx.fillText(coordinateLabel, sx + radius + 4, sy + 13);
      });

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [yaw, pitch, zoom, activeLoop, condition, hoveredNode]);

  return (
    <div 
      id="3d-architecture-card"
      ref={containerRef}
      className="relative flex-1 bg-[#141416] border border-white/5 rounded-xl overflow-hidden flex flex-col h-[380px]"
    >
      {/* Visual Title / Meta Header */}
      <div id="3d-canvas-header" className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${condition === "Stress" ? "bg-emerald-400" : "bg-cyan-400"}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${condition === "Stress" ? "bg-emerald-500" : "bg-cyan-500"}`}></span>
          </span>
          <span className="font-mono text-[10px] text-slate-500 tracking-wider font-semibold uppercase">3D Hi-C Spatial Topology</span>
        </div>
        <h3 id="3d-active-loop-title" className="font-sans font-bold text-slate-200 mt-1 flex items-center gap-1.5 text-md">
          {activeLoop.chromosome} Topological Domains (TAD)
        </h3>
        <p className="font-sans text-[11px] text-slate-400">
          Anchor range: {activeLoop.anchorAStart.toLocaleString()} - {activeLoop.anchorBEnd.toLocaleString()} bp
        </p>
      </div>

      {/* Orbit Toolbar */}
      <div id="3d-orbit-toolbar" className="absolute top-4 right-4 z-20 flex bg-[#111112]/90 border border-white/10 p-1.5 rounded-lg gap-1.5 text-slate-400 font-semibold text-xs">
        <button
          id="zoom-in-btn"
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-1 hover:text-white hover:bg-slate-800 rounded transition shadow-sm cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          id="zoom-out-btn"
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
          className="p-1 hover:text-white hover:bg-slate-800 rounded transition shadow-sm cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          id="reset-angle-btn"
          onClick={() => { setYaw(0.8); setPitch(0.4); setZoom(1.1); }}
          className="p-1 hover:text-white hover:bg-slate-800 rounded transition shadow-sm cursor-pointer"
          title="Reset Camera viewport"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Actual canvas */}
      <canvas
        id="3d-topology-canvas"
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        className={`w-full h-full cursor-grab active:cursor-grabbing`}
      />

      {/* Interactive Bottom Guide panel */}
      <div id="3d-interaction-footer" className="absolute bottom-4 left-4 right-4 z-10 bg-[#0F0F10]/95 border border-white/10 text-gray-300 p-2 text-[10px] rounded-lg flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 font-mono">
          <Orbit size={12} className="text-emerald-400 animate-spin" />
          <span>DRAG TO RE-ORBIT ACCESSIBILITY PLANE (3D)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Enhancer Site
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Downstream Promoter
          </span>
        </div>
      </div>
    </div>
  );
};
