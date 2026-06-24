# PanBio

PanBio is a state-of-the-art Agrigenomics Multi-Omics Trait Discovery and Tertiary Analysis Ecosystem designed to bridge the genotype-to-phenotype gap in complex plant species. It excels at displaying 3D genomic layout coordinates, linear pangenome track views, and interactive phenotypic cascades for crops under varying stressors such as drought.

## Key Features

- **3D Genomic Canvas**: Interactive visualization of chromatin loops, structural variants, and gene loci mapped in 3D biological coordinate space. Supports orbit/auto-rotation, zooming, and direct node selection.
- **2D Track Viewer**: Comprehensive linear pangenome track view illustrating multi-omics indicators—Base Coverage, DNA Methylation, Chromatin Accessibility, rna-seq Expression, Protein Abundance, and Metabolite levels under both Control and Stress conditions. Includes an interactive coordinate crosshair, pan/zoom controls, and real-time cursor matching.
- **Phenotypic Cascades & Interactive Networks**: Dynamic visual graph linking candidate structural variants (SVs) to metabolic pathway cascades, physiological traits, and ultimate phenotypic impact of agronomic importance (e.g., drought resistance, leaf water retention, stomatal density).
- **Variant Dissection Suite**: Data-dense drawer allowing biological scientists to inspect, search, filter, and sort structural variants by coordinated locus, length, prior scoring, and QTL correlation.
- **Omics Matrix Parsing Sandbox**: Integrated live parser simulation that supports analyzing custom multi-omics variant spreadsheets or matrices directly on the client side.

> An interactive, high-fidelity biological analysis suite designed for pangenomic visual modeling.

![PanBio Animated Dashboard Demo](./assets/dashboard-walkthrough.gif)

[🔗 Launch Live Interactive Demo](https://khabatv.github.io/PanBio)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Install the application dependencies:
   ```bash
   npm install
   ```

2. Run the application in local development mode:
   ```bash
   npm run dev
   ```
   This boots the dev server and provides a URL (usually `http://localhost:3000` or `http://localhost:5173`) to view the application.

3. Build the application for production:
   ```bash
   npm run build
   ```
   The static distribution files will be output to the `dist/` directory, optimized and ready to serve.

## Contact & Research Affiliation

For inquiries, collaborations, or technical questions concerning the PanBio ecosystem, please contact:

**Khabat Vahabi**  
Leibniz Institute for Horticultural Sciences (IGZ)  
Tel: +49 3370178228  
Email: [vahabi@igzev.de](mailto:vahabi@igzev.de)  
Web: [www.igzev.de](https://www.igzev.de)
