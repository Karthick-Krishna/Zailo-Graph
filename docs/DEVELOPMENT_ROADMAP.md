# Zailo Graph — Engineering Roadmap & Implementation Plan

**Document Version:** 1.0.0  
**Target Domain:** `zailograph.zorquelz.com`  
**Execution Philosophy:** Multi-Phase Modular Delivery with Explicit Prototype Validation Gates  
**Status:** Approved Roadmap  

---

## 1. Roadmap Overview & Phasing Strategy

To ensure absolute software reliability and prevent architectural regressions, Zailo Graph is structured into **seven sequential phases**. Each phase produces independently testable modules with concrete acceptance gates before proceeding to subsequent utilities.

```mermaid
gantt
    title Zailo Graph Engineering Delivery Pipeline
    dateFormat  YYYY-MM-DD
    section Architecture & Spikes
    Phase 0: Technical Spikes & Validation Gates       :active, p0, 2026-11-10, 14d
    section Core Infrastructure
    Phase 1: Foundation Shell & Worker Pool            :p1, after p0, 14d
    section Utility Implementation
    Phase 2: Essential Raster & Compression Suite      :p2, after p1, 21d
    Phase 3: Vector, Metadata & Specialized Formats    :p3, after p2, 21d
    Phase 4: HEIC & Camera RAW Pipeline                :p4, after p3, 14d
    Phase 5: Client-Side WebGPU AI Suite               :p5, after p4, 21d
    section Cloud & Hardening
    Phase 6: Ephemeral Cloud Fallback Engine           :p6, after p5, 14d
    Phase 7: Hardening, Memory Audits & Launch         :p7, after p6, 14d
```

---

## 2. Phase-by-Phase Execution Plan

### Phase 0: Technical Spikes & Prototype Validation Gates
*Objective: De-risk highest-uncertainty browser capabilities before writing application code.*

- **Spike 0.1: 50 MB File Handling in OPFS (Origin Private File System)**
  - *Task:* Build a standalone harness streaming 50 MB image payloads to OPFS, reading chunks in a dedicated Web Worker via `createSyncAccessHandle()`.
  - *Pass Gate:* Sustained memory heap remains $< 150\text{ MB}$ during 20 consecutive file read/write operations without tab crash.
- **Spike 0.2: WebGPU ONNX Tiled Inference & Seam Feathering**
  - *Task:* Implement a prototype tiling engine subdividing an $8000 \times 6000$ image into $512 \times 512$ tiles with 32 px overlap, processing through Real-ESRGAN in WebGPU and blending back with Hann-window weighting.
  - *Pass Gate:* Zero visible boundary seams; zero WebGPU `device lost` errors on mid-tier integrated graphics (e.g. Intel Iris Xe / Apple M1).
- **Spike 0.3: LibRaw WASM Sensor Demosaicing Memory Footprint**
  - *Task:* Benchmark peak 32-bit WASM linear memory consumption during 14-bit Bayer CFA demosaicing of Canon CR2 and Nikon NEF files.
  - *Pass Gate:* Establish the exact file size threshold (e.g., 35 MB) at which local WASM demosaicing becomes unstable and requires cloud fallback.

---

### Phase 1: Core Foundation, UI Shell, Entitlements & Session Workflow Bus
*Objective: Build the responsive light-theme workspace, worker pool, entitlements engine, and session DAG.*

- **Deliverables:**
  - Vite 6 + React 19 + TypeScript base architecture with strict ESLint / Prettier.
  - Minimalist light-theme design system using Tailwind CSS v4 and Radix UI primitives (`#FAFAFA` canvas, high-contrast borders, accessible sliders, dialogs).
  - **Entitlements & Authentication Engine (`AuthContext`):**
    - Seamless Anonymous Guest vs. Free Registered User state management.
    - Passwordless Magic Link & PKCE OAuth (Google/GitHub) via Supabase Auth.
    - Client-side quota guards (10 MB file drop limit for guests, 3-item batch queue limit, FHD resolution cap on exports).
    - Competitor-Paid Feature Showcase & Unlock modals for the 7 gated tools.
  - Multi-threaded **Worker Pool Manager** with Comlink RPC and `Transferable` zero-copy messaging.
  - **Session Virtual File System (VFS)**: In-memory Directed Acyclic Graph (DAG) tracking image nodes, parameters, parent-child links, and OPFS handles.
  - Responsive layout: Dynamic canvas viewport with 60fps pan/zoom and split-screen comparison slider.
- **Independent Testing Criteria:**
  - Unit tests verifying guest quota enforcement: file drops $>10\text{ MB}$ rejected; queue capped at 3; gated utilities display unlock modal.
  - Automated worker pool test verifying tasks abort properly upon user interruption (`AbortSignal`).
  - Unit tests for session DAG verifying node addition, branch creation, history rollback, and memory cleanup.

---

### Phase 2: Essential Raster & Compression Suite (Utilities 01, 02, 04, 05, 10, 11, 12, 13, 23, 24)
*Objective: Deliver the core high-frequency client-side image manipulation tools.*

- **Utilities Implemented:**
  - `01. Batch Resizing` (Lanczos3, Mitchell, Bilinear resampling via `wasm-vips`).
  - `02. Image Compression` (MozJPEG, OxiPNG, libwebp WASM engines with live preview slider).
  - `04. WebP to PNG/JPG Conversion` & `05. PNG/JPG to WebP Conversion`.
  - `10. Image Sharpening & Enhancement` (WebGL fragment shader viewport preview + WASM export).
  - `11. Circular Avatar & Cropper` (Touch/drag crop box with aspect locks and PNG export).
  - `12. Social Media Presets` (1-click sizing for IG, X, LinkedIn, YouTube with smart padding).
  - `13. Image Watermarking` (Text typography and logo positioning with 9-point grid).
  - `23. Image to Base64 URI` & `24. Base64 to Image Decoder`.
- **Independent Testing Criteria:**
  - Compression benchmark asserting MozJPEG output is 15–25% smaller than native browser `canvas.toBlob()`.
  - Batch resize verification with 50 images executing concurrently across CPU cores without UI thread stutter.

---

### Phase 3: Vector, Metadata & Specialized Formats (Utilities 06, 07, 14, 15, 16, 19, 20, 21, 22)
*Objective: Expand into vector graphics, metadata governance, privacy redaction, and generative studios.*

- **Utilities Implemented:**
  - `06. SVG to High-Resolution PNG` (Resvg WASM engine with 16x scaling and print DPI controls).
  - `07. PNG to SVG Vectorization` (VTracer WASM engine with color quantization and path simplification).
  - `14. Photo Grids and Collage Maker` (Dynamic grid layouts with drag-drop cell swapping).
  - `15. Color Palette Generator` (K-Means / Median Cut palette extractor with CSS/ASE/JSON export).
  - `16. Passport and ID Photo Maker` (Biometric guideline overlays and printable multi-sheet layout).
  - `19. EXIF Metadata Viewer` (Chunked binary parsing of EXIF, IPTC, XMP with GPS map preview).
  - `20. EXIF Metadata Removal` (Lossless binary marker splicing without re-encoding DCT coefficients).
  - `21. Privacy Blur and Redaction` (Destructive pixelation and black-bar redaction tool).
  - `22. Favicon and App Icon Studio` (Multi-size `.ico` binary generation and web app icon pack).
- **Independent Testing Criteria:**
  - Security test: SVG sanitizer blocks malicious XML entity attacks and XSS payloads.
  - Lossless EXIF test: Verify JPEG bitstream remains byte-for-byte identical after stripping `APP1` markers.

---

### Phase 4: HEIC & Camera RAW Pipeline (Utilities 03, 25)
*Objective: Build robust decoders for modern mobile and DSLR/mirrorless photography formats.*

- **Utilities Implemented:**
  - `03. HEIC to JPG/PNG Conversion` (`libheif-js` WASM with multi-frame extraction and Display P3 color space handling).
  - `25. Camera RAW to JPG Conversion`:
    - Fast Mode: Instant binary extraction of embedded camera preview JPEGs ($< 50\text{ ms}$).
    - High-Fidelity Mode: `libraw` WASM demosaicing for CR2, NEF, ARW, DNG files.
- **Independent Testing Criteria:**
  - Decode verified on iPhone 15/16 HEIC files (including 48 MP burst shots).
  - RAW parsing tested across Canon CR2, Nikon NEF, Sony ARW, and Adobe DNG sample libraries.

---

### Phase 5: Client-Side WebGPU AI Suite (Utilities 08, 09, 17, 18)
*Objective: Integrate quantized neural network models running directly in client hardware.*

- **Utilities Implemented:**
  - `09. AI Background Removal` (RMBG-1.4 INT8/FP16 on ONNX Runtime Web).
  - `08. AI Super-Resolution and 4x Upscaling` (Real-ESRGAN Compact with tiled inference).
  - `18. AI Object Removal and Inpainting` (LaMa ONNX model with freehand brush mask).
  - `17. Black-and-White Photo Colorization` (DDColor Tiny ONNX model).
- **Independent Testing Criteria:**
  - WebGPU execution benchmark: RMBG-1.4 completes in $< 2.5\text{ s}$ on Apple Silicon / modern discrete GPU.
  - Graceful degradation: Systems without WebGPU automatically fall back to multi-threaded WASM SIMD with progress toast.

---

### Phase 6: Ephemeral Cloud Fallback Engine (Opt-In Fallback)
*Objective: Provide a secure, zero-retention compute accelerator for low-spec devices and heavy workloads.*

- **Deliverables:**
  - Ephemeral Cloud Consent Dialog (explains exact reason for fallback, data transmission details, and guarantees).
  - Cloudflare Edge Router (`api.Zailo Graph.zorquelz.com`) enforcing IP rate limits, payload validation, and ephemeral JWT signatures.
  - Stateless GPU Compute Worker (PyTorch / TensorRT in Docker) with read-only filesystem and volatile memory pipeline.
  - End-to-end stream piping with automatic client-side download/injection into the session DAG.
- **Independent Testing Criteria:**
  - Automated network audit asserting zero network egress during local mode operations.
  - Ephemeral worker security verification asserting zero temporary files created on disk (`/tmp` read-only mount).

---

### Phase 7: Hardening, Performance Profiling, PWA & Production Launch
*Objective: Perform deep memory audits, cross-browser verification, and deploy to production.*

- **Deliverables:**
  - PWA configuration: Offline Service Worker caching all static assets and WASM binaries; manifest with OS file handler support.
  - Full automated visual regression suite running on Chromium, Firefox, and WebKit via Playwright.
  - Tab crash stress test: Continuous 50 MB batch processing for 30 minutes without memory leaks.
  - Production deployment to Cloudflare Pages on `Zailo Graph.zorquelz.com` with strict `COOP`, `COEP`, and `CSP` headers.
- **Independent Testing Criteria:**
  - Lighthouse score: $\ge 95$ across Performance, Accessibility, Best Practices, and SEO.
  - Zero memory growth over 10 consecutive image workflow cycles (verified via Chrome DevTools Protocol heap snapshots).

