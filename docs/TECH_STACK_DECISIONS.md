# Imazy — Technology Stack & Architectural Decisions

**Document Version:** 1.0.0  
**Target Domain:** `imazy.zorquelz.com`  
**Evaluation Scope:** Complete Technical Evaluation, Trade-off Matrices, and Ground-Truth Reality Checks  
**Status:** Approved Architectural Document  

---

## 1. Frontend Framework & Language

### Evaluation Matrix

| Framework / Engine | Core Advantages | Major Drawbacks / Risks | Recommendation |
| :--- | :--- | :--- | :--- |
| **Vite + React 19 + TypeScript** | Static SPA export; trivial zero-server hosting; first-class Web Worker bundling (`new Worker(new URL(..., import.meta.url), { type: 'module' })`); huge ecosystem for touch/canvas controls; React 19 Actions reduce state boilerplate. | Larger runtime bundle than Svelte (~45KB base); requires disciplined re-render isolation for high-frequency slider events. | **SELECTED (Primary)** |
| **Next.js (App Router)** | Powerful SSR and API routes; built-in image optimization. | Server-heavy paradigm clashes with zero-knowledge, 100% static client-side PWA architecture; complex worker bundling; cold starts on serverless routes. | *Rejected* |
| **Svelte 5 / SvelteKit** | Ultra-lean bundle size; reactive runes; fast DOM updates. | Smaller third-party ecosystem for specialized canvas viewports and interactive image manipulation packages; WASM/WebGPU tooling less battle-tested. | *Rejected (Viable Alternative)* |
| **SolidJS** | Fine-grained reactivity; exceptional performance; low memory overhead. | Ecosystem friction with specialized React-based image cropping and color-manipulation libraries. | *Rejected* |

### Architectural Decision
**Vite 6 + React 19 + TypeScript (Strict Mode)**.  
The platform will be built and deployed as a **Pure Static Single-Page Application (SPA)** with zero server-side rendering dependencies. This allows Imazy to be served from any global edge CDN with zero server cost, infinite horizontal scalability, and inherent privacy guarantees.

---

## 2. UI Styling & Component System

### Evaluation Matrix

| System | Capabilities & Benefits | Trade-offs & Limitations | Recommendation |
| :--- | :--- | :--- | :--- |
| **Tailwind CSS v4 + Radix UI Primitives** | Zero runtime CSS; utility-first precision; unstyled accessible primitives (sliders, dialogs, dropdowns, tooltips); micro-bundle size via Tailwind Oxide engine. | Requires bespoke styling for custom canvas controls; needs strict design token governance. | **SELECTED (Primary)** |
| **shadcn/ui Component Pattern** | Copy-paste source code ownership; built on Radix; clean light-theme aesthetic out of the box. | Can accumulate redundant styling if not customized; needs adaptation for high-density tool racks. | **SELECTED (Component Foundation)** |
| **Chakra UI / Material UI** | Pre-packaged full component libraries. | Heavy JavaScript runtime overhead; opinionated themes; significant bundle size bloat ($> 150\text{ KB}$ runtime JS). | *Rejected* |

### Architectural Decision
**Tailwind CSS v4 + Radix UI Primitives (via shadcn/ui pattern)**.  
The UI requires a high-density, minimal light theme with zero distraction. Radix primitives provide fully accessible, keyboard-navigable sliders, dialogs, split-buttons, and popovers with zero runtime styling overhead.

---

## 3. Core 2D Image Processing & Canvas Manipulation

### Evaluation Matrix

| Library / Engine | Performance & Fidelity | Memory & Size Overhead | Capabilities & Limitations | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Native Canvas2D / OffscreenCanvas API** | Near-zero overhead; hardware accelerated by OS GPU compositor; native browser capability. | $0\text{ KB}$ bundle size. | Only supports basic bilinear/bicubic resampling. Lacks Lanczos3, unsharp masking, and fine-grained quantization. | **SELECTED (Real-time Viewport & Compositing)** |
| **`wasm-vips` (libvips WASM)** | Highest processing speed; streaming pipeline; Lanczos3 resampling; full ICC color management. | ~3.8 MB WASM binary (gzipped ~1.4 MB). | Full feature set matching desktop libvips. Can be code-split and loaded only on export. | **SELECTED (Export Pipeline Engine)** |
| **`photon-web` (Rust WASM)** | Extremely fast pixel manipulation (contrast, saturation, sharpen, monochrome). | Lightweight (~400 KB WASM). | Great for 2D filter operations; lacks advanced codec encoders (WebP, MozJPEG). | **SELECTED (Secondary Filter Worker)** |
| **ImageMagick WASM (`magick-wasm`)** | Universal format support. | Very heavy ($> 10\text{ MB}$ WASM binary); high memory consumption. | Overkill for browser execution; prone to WASM linear memory allocation failures. | *Rejected* |

### Architectural Decision
**Hybrid Pipeline: Native Canvas2D / WebGL for Interactive Viewport + `wasm-vips` for High-Fidelity Export**.  
- **Interactive Editing:** Sliders, crop bounding boxes, watermark positioning, and real-time filters run on the main thread / dedicated UI worker via hardware-accelerated `OffscreenCanvas` and WebGL fragment shaders at 60fps.  
- **Batch & Final Export:** High-fidelity rasterization, Lanczos3 downscaling, and multi-format encoding execute in background Web Workers powered by `wasm-vips` and dedicated codec WASM binaries.

---

## 4. Compression Engines

### Evaluation Matrix

| Engine | Algorithm & Quality | Binary Footprint | Verified Capabilities | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **MozJPEG WASM** | Arithmetic entropy coding, trellis quantization, chroma subsampling control. | ~280 KB WASM | Produces 15–25% smaller JPEGs than standard browser `toBlob('image/jpeg')` at identical visual quality. | **SELECTED (JPEG Engine)** |
| **OxiPNG WASM** | Rust-based lossless PNG optimizer (deflate, zlib filtering, IDAT chunk reduction). | ~450 KB WASM | Lossless PNG size reduction of 10–35% without altering a single pixel value. | **SELECTED (PNG Lossless Engine)** |
| **libwebp WASM** | Official Google libwebp encoder port. | ~220 KB WASM | Full control over lossy/lossless, compression effort ($0\text{--}6$), and alpha quality. | **SELECTED (WebP Engine)** |
| **Native `canvas.toBlob()`** | Native browser C++ implementation. | 0 KB | Inconsistent results across browsers; Safari and Chrome yield different sizes/qualities; no chroma tuning. | *Rejected for Compression Tool (Used only as fast fallback)* |

### Architectural Decision
**Dedicated Codec Web Workers compiling MozJPEG, OxiPNG, and libwebp to WebAssembly via Emscripten and Rust**.  
This guarantees deterministic, platform-independent compression results regardless of the user's OS or browser version.

---

## 5. Specialized Format Parsers & Codecs

### 5.1 HEIC / HEIF Decoding
- **Selected Engine:** `libheif-js` (compiled with `libde265` HEVC decoder).
- **Ground Truth & Limitations:**  
  The native browser `ImageDecoder` API can only decode HEIC on macOS/iOS or Windows machines where the operating system has installed proprietary HEVC codecs. On Linux and unconfigured Windows machines, native decoding completely fails.  
  `libheif-js` runs a pure software WASM decoder that works uniformly on every browser.
- **Trade-off:** Software decoding of a 48 MP iPhone HEIC file takes ~800ms–1500ms in WASM. We mitigate this by extracting and displaying the embedded fast preview thumbnail first while the full decode completes asynchronously.

### 5.2 SVG Rasterization & Vectorization
- **SVG to High-Res PNG:** `@resvg/resvg-wasm` (Rust-based Resvg engine).  
  *Why not Canvas `drawImage(svg)`?* Native browser Canvas SVG rasterization frequently fails on embedded CSS fonts, complex text elements, and cross-origin security restrictions (tainted canvas). `resvg-wasm` guarantees pixel-perfect, deterministic vector rendering up to $16\times$ resolution ($16,000 \times 16,000\text{ px}$) with full text rendering.
- **PNG to SVG (Vectorization):** `vtracer` (Rust WASM).  
  *Why not Potrace?* Potrace only supports monochrome black-and-white silhouettes. `vtracer` uses Vision Tracer curve fitting with full color clustering and path simplification, producing production-grade SVG artwork from raster inputs.

### 5.3 Camera RAW Parsing (CR2, NEF, ARW, DNG)
- **Selected Strategy:** **Two-Stage Hybrid Decoding Architecture**.
  - **Stage 1 (Fast Extraction - 100% Local):** Parse TIFF/CIFF binary structures in `< 30 ms` using an optimized binary reader (`exifr` / custom parser) to extract the camera-embedded full-resolution JPEG preview. This provides immediate previews for 95% of consumer editing workflows without heavy computation.
  - **Stage 2 (Sensor Demosaicing):** For true 14-bit/16-bit raw sensor data processing, utilize a lightweight `libraw` WASM build for files under 35 MB.
- **Ground-Truth Prototype Gate:** Files exceeding 50 MB can push 32-bit WASM memory allocations over safe limits during Bayer demosaicing (which requires multiple 16-bit float channels). Files exceeding client capacity trigger the **Opt-In Ephemeral Cloud Worker**.

### 5.4 EXIF Metadata Handling
- **Selected Engine:** `exifr` for read operations; custom binary marker mutator for lossless stripping.
- **Lossless Stripping Rationale:** Most web tools re-encode JPEGs to remove metadata, causing generational quality loss. Imazy uses a zero-copy binary parser that scans JPEG byte markers, locates `APP1` (`0xFFE1`), `APP2`, and `APP13` chunks, and slices them out of the byte array directly. The raw image DCT bitstream remains 100% untouched, executing in $< 5\text{ ms}$ with zero quality degradation.

---

## 6. AI Inference & Model Deployment

### Model Selection & Footprint Analysis

| Utility | Selected Model Architecture | Format & Quantization | Disk / Network Size | Runtime Provider |
| :--- | :--- | :--- | :--- | :--- |
| **09. AI Background Removal** | **RMBG-1.4** (BRIA AI) | ONNX INT8 / FP16 | ~24 MB (INT8) / 44 MB (FP16) | `onnxruntime-web` (WebGPU) |
| **08. 4x Super-Resolution** | **Real-ESRGAN Compact** | ONNX FP16 | ~16 MB | `onnxruntime-web` (WebGPU) |
| **18. AI Object Inpainting** | **LaMa** (Large Mask Inpainting) | ONNX FP16 | ~48 MB | `onnxruntime-web` (WebGPU) |
| **17. B&W Colorization** | **DDColor (Tiny)** | ONNX FP16 | ~32 MB | `onnxruntime-web` (WebGPU) |

### Technical Trade-offs & Limitations:
1. **GPU VRAM Limitations & Tiled Inference:**  
   Passing an uncompressed 50 MB photo ($8000 \times 6000$) directly into an AI model in WebGPU will crash the browser tab immediately with an `Out of Memory` or `Device Lost` error.  
   *Mandatory Implementation:* The engine must implement a **Tiling Inference Processor** that subdivides the image into $512 \times 512$ patches with a 32 px overlap window, processes tiles sequentially or in dual-batches, and re-blends the output using Hann-window feathered alpha weights.
2. **WebGPU Availability:**  
   As of 2026, WebGPU is supported in Chrome, Edge, Safari 18+, and Firefox. When WebGPU is disabled or hardware-blocked, `onnxruntime-web` falls back to **WASM SIMD**.
3. **WASM SIMD Fallback Latency:**  
   On WASM SIMD, background removal takes 8–15 seconds (compared to 0.8–2.0 seconds on WebGPU). The UI will display a hardware notice indicating that WebGPU acceleration is unavailable and provide the user with the option to use the high-speed Ephemeral Cloud Worker.

---

## 7. Backend Requirements (Ephemeral Cloud Worker)

### Cloud Worker Specification
The backend exists **solely** as an opt-in compute accelerator for devices unable to run heavy AI models or 50 MB+ RAW demosaicing locally.

- **Edge Router:** Cloudflare Workers (TypeScript).  
  - Responsibilities: Validates request parameters, inspects user consent token, enforces rate limits (e.g., 20 cloud conversions per hour per IP to prevent DDoS abuse), and proxies request to the compute container.
- **Compute Container:** Python 3.11 + PyTorch / TensorRT runtime hosted on stateless serverless GPU infrastructure (e.g., Cloudflare Containers / RunPod Serverless / AWS ECS Fargate with NVIDIA T4/A10G).
- **Zero-Storage Enforcement:**  
  - No database connection (Postgres, DynamoDB, MongoDB are completely absent).
  - No object storage write permissions (S3 / R2 keys do not exist in the worker environment).
  - Processing is performed in volatile RAM buffers (`io.BytesIO`) and piped directly to the output stream.

---

## 8. Authentication & Entitlement Architecture

### Evaluation Matrix

| Solution | Strengths & Privacy Profile | Limitations & Trade-offs | Recommendation |
| :--- | :--- | :--- | :--- |
| **Supabase Auth (PKCE OAuth + Magic Link)** | Open-source foundation; generous free tier (50,000 MAU); zero credit card requirement; standards-compliant JWTs easily verified via JWKS in Cloudflare Workers in $< 2\text{ ms}$; passwordless magic links minimize credential risk. | Requires Supabase project configuration; lightweight SDK dependency (~18KB gzip). | **SELECTED (Primary Auth Provider)** |
| **Clerk / Auth0** | Turnkey hosted UI; extensive integrations. | Proprietary vendor lock-in; intrusive tracking cookies; expensive scaling tiers; unaligned with Zorquelz zero-cost/privacy ethos. | *Rejected* |
| **Bespoke Cloudflare D1 + Ed25519 JWT Auth** | 100% self-hosted under Zorquelz; zero third-party data touchpoints; extreme micro-latency. | Requires authoring bespoke passwordless email delivery, rate limiting, and session rotation infrastructure. | *Viable Future Evolution (Phase 6+)* |

### Architectural Decision
**Supabase Auth with PKCE (OAuth for Google/GitHub + Passwordless Magic Link)**.  
Users can sign up in 5 seconds without credit cards, passwords, or intrusive data collection. The client issues a signed JWT stored in secure session storage, which unlocks:
1. File drops up to 50 MB (evaluated client-side before buffer allocation).
2. Concurrency queues up to 50 batch images.
3. Access to all 7 competitor-paid utilities (AI tools, vectorization, RAW studio, 16x SVG).
4. Direct entitlement verification header (`Authorization: Bearer <token>`) passed to `api.imazy.zorquelz.com` if using ephemeral cloud fallback.

---

## 9. File Handling & Memory Management

### Technology: Origin Private File System (OPFS) + Transferable Objects
- **The Problem:** Storing 50 MB files and their transformed variants in standard JavaScript memory (`Blob` or `ArrayBuffer`) quickly causes the browser tab to crash.
- **The Solution:**  
  Imazy uses **OPFS** (Origin Private File System) via `navigator.storage.getDirectory()`. OPFS provides an isolated, sandboxed virtual filesystem on the user's local disk that operates with near-native I/O throughput.
  - Large incoming files and intermediate batch outputs are streamed directly to OPFS files.
  - Web Workers access OPFS handles using `createSyncAccessHandle()` in worker contexts, bypassing main-thread serialization completely.
  - Memory consumption on the JavaScript heap remains constant ($< 150\text{ MB}$) regardless of whether the user processes 1 or 50 images.

---

## 10. Privacy & Security Architecture

### Key Security Implementations:
1. **SVG Sanitization (DOMPurify & XML Depth Checks):**  
   SVG files are vectors for Cross-Site Scripting (XSS) and XML Entity Expansion attacks. Imazy runs a dual-layer sanitization pipeline:
   - Rejects any SVG containing entity definitions (`<!ENTITY>`) or external doctypes.
   - Strips all `<script>`, `<foreignObject>`, inline event handlers (`onload`, `onerror`), and external URL references before rendering.
2. **Strict Content Security Policy (CSP):**
   ```http
   default-src 'self';
   script-src 'self' 'wasm-unsafe-eval';
   style-src 'self' 'unsafe-inline';
   img-src 'self' blob: data: https://*.tile.openstreetmap.org;
   connect-src 'self' https://api.imazy.zorquelz.com;
   worker-src 'self' blob:;
   object-src 'none';
   base-uri 'none';
   ```
3. **Cross-Origin Isolation:**  
   `COOP: same-origin` and `COEP: require-corp` headers are enforced across all routes to unlock high-precision timers and `SharedArrayBuffer` for Web Workers.

---

## 11. Testing Infrastructure

### Testing Stack
- **Unit & Logic Tests:** `Vitest` (ultra-fast ESM testing of color quantization algorithms, EXIF marker splicing, aspect ratio math, and session DAG states).
- **Component & UI Tests:** `Playwright` component testing with real browser engines (Chromium, WebKit, Firefox).
- **Visual Regression & Fidelity Verification:** `pixelmatch` / Playwright visual snapshot testing. Compares reference images against WASM/WebGPU renders across resizing, sharpening, and colorization to detect pixel regressions.
- **Memory Leak & OOM Harness:** Custom Playwright automated test suite that repeatedly loads 50 MB RAW and PNG files through a 5-step pipeline, asserting that the browser tab heap usage returns to baseline after session disposal.

---

## 12. Hosting & Deployment under `imazy.zorquelz.com`

### Deployment Topology
- **Primary Static Host:** **Cloudflare Pages**.
  - Global edge CDN with $> 300$ Points of Presence.
  - Zero-latency asset delivery for `.wasm` and `.onnx` model files.
  - Native support for custom HTTP headers via `_headers` configuration file (`COOP`, `COEP`, `Cache-Control`).
- **Domain Configuration:**
  - `imazy.zorquelz.com` &rarr; CNAME to Cloudflare Pages deployment.
  - `api.imazy.zorquelz.com` &rarr; Route to Cloudflare Worker edge router (for optional ephemeral cloud fallback).
- **Caching Headers:**
  - HTML documents: `Cache-Control: public, max-age=0, must-revalidate`
  - JavaScript / CSS bundles (hashed): `Cache-Control: public, max-age=31536000, immutable`
  - WASM and ONNX model binaries: `Cache-Control: public, max-age=31536000, immutable` with pre-compressed Brotli (`.br`) assets.

---

## 13. Confirmed Capabilities vs. Prototype Validation Gates

To ensure technical integrity, we explicitly distinguish confirmed capabilities from components requiring an engineering prototype before final implementation:

| Architectural Component | Validation Status | Evidence / Prototype Requirement |
| :--- | :--- | :--- |
| **MozJPEG / OxiPNG / WebP WASM** | **Confirmed** | Battle-tested in Squoosh and production environments; deterministic encoding verified. |
| **Resvg & VTracer WASM** | **Confirmed** | Rust-to-WASM builds are production-ready; reliable SVG rendering and vectorization verified. |
| **RMBG-1.4 Background Removal (WebGPU)** | **Confirmed** | Verified in ONNX Runtime Web with INT8 quantization on WebGPU. |
| **Fast RAW Embedded Preview Extraction** | **Confirmed** | Binary TIFF/EXIF tag extraction of embedded JPEGs executes reliably in $< 50\text{ ms}$. |
| **50 MB File OPFS Virtual Disk Swap** | **Prototype Required** | Must validate cross-browser OPFS write performance and Safari storage quota handling under 50 MB batch loads. |
| **Client-Side Real-ESRGAN Tiling on Low-VRAM GPUs** | **Prototype Required** | Must validate tile boundary feathering algorithms to ensure zero visible seam artifacts across varied image textures. |
| **Pure WASM LibRaw Sensor Demosaicing (50 MB RAWs)** | **Prototype Required** | Must benchmark memory peak during 16-bit CFA demosaicing in 32-bit WASM linear memory to establish the exact file size cutoff for cloud fallback. |

