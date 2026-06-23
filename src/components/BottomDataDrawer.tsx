import React, { useState, useMemo } from "react";
import { 
  FileUp, 
  Search, 
  ArrowUpDown, 
  CheckCircle,
  AlertTriangle,
  Flame,
  Binary,
  Database,
  RefreshCw
} from "lucide-react";
import { StructuralVariant, VariantType } from "../types";

interface BottomDataDrawerProps {
  variants: StructuralVariant[];
  selectedVariant: StructuralVariant;
  onSelectVariant: (v: StructuralVariant) => void;
}

type SortField = "id" | "type" | "chromosome" | "start" | "functionalScore" | "qtlCorrelation" | "sizeBp";

export const BottomDataDrawer: React.FC<BottomDataDrawerProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("functionalScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Drag and Drop simulation states
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Sorting handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter and sort variants list
  const processedVariants = useMemo(() => {
    let list = [...variants];

    // Search filter
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (v) =>
          v.id.toLowerCase().includes(q) ||
          v.targetGene.toLowerCase().includes(q) ||
          v.consequence.toLowerCase().includes(q) ||
          v.type.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      } else {
        return sortDirection === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      }
    });

    return list;
  }, [variants, searchTerm, sortField, sortDirection]);

  // File Upload Simulation
  const simulateParse = (filesList: FileList) => {
    const file = filesList[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setUploadProgress(10);
    
    // Animate a professional parser loader
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      simulateParse(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      simulateParse(e.target.files);
    }
  };

  const resetUpload = () => {
    setUploadedFileName(null);
    setUploadProgress(null);
  };

  return (
    <div 
      id="workspace-variant-drawer"
      className="bg-[#141416] border border-white/5 rounded-xl p-5 flex flex-col gap-5 text-gray-200 mt-6 shadow-2xl"
    >
      {/* Drawer Section header */}
      <div id="drawer-main-header" className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="font-sans font-bold text-slate-200 text-md flex items-center gap-2">
            <Database className="text-emerald-500" size={18} />
            Tertiary Ingestion Workspace & Prioritization Engine
          </h3>
          <p className="font-sans text-[11px] text-slate-500 leading-relaxed mt-0.5">
            Identify, score, and isolate candidate high-fidelity structural variations and QTL physical contact domains.
          </p>
        </div>

        {/* Dynamic global search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
            <input
              id="prioritization-search-input"
              type="text"
              placeholder="Search variants / target genes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0B] border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-64 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unified drag-and-drop workspace column */}
        <div id="drag-drop-viewport-col" className="lg:col-span-1 flex flex-col gap-3">
          <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">A. Structural Matrix Ingest</span>
          
          <div
            id="drag-drop-target-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 h-[190.5px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all ${
              isDraggingOver 
                ? "border-emerald-400 bg-emerald-950/20" 
                : uploadProgress === 100 
                  ? "border-[#1e2ef3]/50 bg-[#0c1428]/30" 
                  : "border-white/10 hover:border-white/20 bg-[#0A0A0B]"
            }`}
          >
            {/* Logic showing state of parsing */}
            {uploadProgress === null ? (
              <label id="upload-label-trigger" className="flex flex-col items-center cursor-pointer text-center space-y-2.5">
                <div className="p-3 bg-[#111112] rounded-full border border-white/10 text-slate-400">
                  <FileUp size={24} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Drag & Drop Matrices File</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[150px] mx-auto">Supports VCF, GFF3, Peak Lists or CSV datasets</p>
                </div>
                <input
                  id="gff-vcf-file-input"
                  type="file"
                  accept=".vcf,.gff,.gff3,.csv,.tsv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-[9px] px-2.5 py-1 bg-emerald-600/20 text-emerald-400 rounded border border-emerald-500/20">Browse Sandbox File</span>
              </label>
            ) : uploadProgress < 100 ? (
              <div id="simulation-parser-spinner" className="flex flex-col items-center space-y-3 p-2 text-center">
                <RefreshCw size={24} className="text-emerald-400 animate-spin" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">Parsing Omics matrices...</p>
                  <div className="w-32 bg-[#0A0A0B] h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div id="simulation-parser-completed" className="flex flex-col items-center space-y-3 p-1.5 text-center">
                <CheckCircle size={24} className="text-emerald-400" />
                <div>
                  <p className="text-xs font-semibold text-emerald-300">Genomes Parsed Successfully</p>
                  <p className="font-mono text-[9px] text-slate-400 mt-1 truncate max-w-[160px]">
                    {uploadedFileName}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Merged <b>84</b> loci to polyploid subgenome mapping.
                  </p>
                </div>
                <button
                  id="reset-matrix-ingest-btn"
                  onClick={resetUpload}
                  className="text-[9px] underline text-slate-400 hover:text-white cursor-pointer"
                >
                  Load other genome
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dense Variant Table column */}
        <div id="variants-table-col" className="lg:col-span-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] text-slate-500 uppercase font-bold">B. Prioritized Variant Candidate Grid</span>
            <span className="font-mono text-[9px] text-slate-500">
              Showing <b>{processedVariants.length}</b> variants of {variants.length} total
            </span>
          </div>

          <div id="genome-dissection-grid-viewport" className="border border-white/5 bg-[#0A0A0B] rounded-xl overflow-hidden max-h-[190px] overflow-y-auto custom-scrollbar">
            <table id="candidate-dissection-table" className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-[#111112] text-slate-400 font-mono text-[10px] border-b border-white/5 sticky top-0 uppercase tracking-wider select-none">
                  {/* Headers */}
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5" onClick={() => handleSort("id")}>
                    Variant ID <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5" onClick={() => handleSort("type")}>
                    Biomutation Class <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5" onClick={() => handleSort("chromosome")}>
                    Locus Coordinates <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5 text-right" onClick={() => handleSort("sizeBp")}>
                    Length <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5 text-center" onClick={() => handleSort("functionalScore")}>
                    Priority Rating <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                  <th className="py-2.5 px-3 cursor-pointer hover:bg-white/5 text-center" onClick={() => handleSort("qtlCorrelation")}>
                    QTL Correlation <ArrowUpDown size={10} className="inline ml-1 text-slate-600" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedVariants.map((v) => {
                  const isSelected = v.id === selectedVariant.id;
                  
                  // Score color mapping
                  let scoreBadgeStyle = "bg-red-950/40 text-red-400 border border-red-900/30";
                  if (v.functionalScore >= 85) {
                    scoreBadgeStyle = "bg-emerald-950/40 text-emerald-400 border border-emerald-950";
                  } else if (v.functionalScore >= 70) {
                    scoreBadgeStyle = "bg-amber-950/40 text-amber-400 border border-amber-950";
                  }

                  return (
                    <tr
                      id={`genome-variant-tr-${v.id}`}
                      key={v.id}
                      onClick={() => onSelectVariant(v)}
                      className={`cursor-pointer transition-colors border-b border-white/5 hover:bg-white/5 ${
                        isSelected 
                          ? "bg-emerald-600/10 text-emerald-400 font-medium" 
                          : "text-slate-300"
                      }`}
                    >
                      {/* ID with active target dot */}
                      <td className="py-2 px-3 font-mono font-bold flex items-center gap-1.5">
                        {v.isTargetSV ? (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 relative" title="Principal Target Variant" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        )}
                        <span>{v.id}</span>
                      </td>

                      {/* Mutation Class */}
                      <td className="py-2 px-3">
                        <span className="font-semibold text-zinc-300">{v.type}</span>
                        <p className="text-[10px] text-slate-500 font-sans">{v.consequence}</p>
                      </td>

                      {/* Locus details */}
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-400">
                        <b className="text-zinc-300 font-sans text-xs">{v.chromosome}</b>: {v.start.toLocaleString()} - {v.end.toLocaleString()}
                        <p className="text-[9px] text-slate-500 font-mono italic">{v.subgenome}</p>
                      </td>

                      {/* Length Size */}
                      <td className="py-2 px-3 font-mono text-[11px] text-right text-slate-300">
                        {v.sizeBp.toLocaleString()} bp
                      </td>

                      {/* Prioritization core score */}
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block font-mono text-[10px] px-2 py-0.5 rounded font-bold ${scoreBadgeStyle}`}>
                          {v.functionalScore.toFixed(1)} / 100
                        </span>
                      </td>

                      {/* QTL correlation */}
                      <td className="py-2 px-3 text-center font-mono font-semibold">
                        <span className={v.qtlCorrelation >= 0.7 ? "text-[#34d399]" : "text-slate-400"}>
                          {(v.qtlCorrelation).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
