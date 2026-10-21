# FireChain AI 🔥
### Real-Time Peatland Wildfire Surveillance, AI Early Warning & Decentralized Climate Ledger
**Built for the IEEE ClimateChain Global Hackathon 2026**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Production-emerald?style=for-the-badge&logo=vercel)](https://frontend-iota-smoky-20.vercel.app)
[![Polygon Amoy](https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20(80002)-8247E5?style=for-the-badge&logo=polygon)](https://amoy.polygonscan.com)
[![NASA FIRMS](https://img.shields.io/badge/Satellite%20Data-NASA%20LANCE%20FIRMS-E03C31?style=for-the-badge&logo=nasa)](https://firms.modaps.eosdis.nasa.gov)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Deployments
* **Production Web Application**: [https://frontend-iota-smoky-20.vercel.app](https://frontend-iota-smoky-20.vercel.app)
* **GitHub Repository**: [https://github.com/ArrafiNurHafiz/FireChain-AI](https://github.com/ArrafiNurHafiz/FireChain-AI)
* **Polygon Amoy Smart Contract Explorer**: [Polygonscan Amoy Testnet](https://amoy.polygonscan.com)
* **Video Presentation & Operational Demo**: `final_presentation_firechain.mp4` (Full HD 1080p 60fps with English neural voiceover and Remotion motion graphics)

---

## 📌 Executive Summary

Tropical peatland wildfires across Kalimantan (Borneo) are among the most catastrophic climate feedback loops on Earth. Peat fires burn deep underground (*smoldering combustion*), emitting up to 10 times more methane ($CH_4$) and toxic carbon monoxide ($CO$) than standard forest canopy fires, defying traditional optical satellite detection and standard emergency response.

**FireChain AI** bridges real-time orbital intelligence, machine learning early warning, and immutable blockchain auditing into an end-to-end operational platform:
1. **Zero Mock Data — Pure Orbital Telemetry**: Real-time integration with **NASA FIRMS (Suomi-NPP VIIRS 375m NRT)**, monitoring 2,991 verified active thermal anomalies across all 5 Kalimantan provinces.
2. **AI PeatNet Neural Engine (v2.4 MLP)**: Multi-variate deep neural network estimating subterranean smoldering probability, elliptical wind vector perimeter spread velocity ($m/h$), Shapley-style feature attributions, and tactical fire suppression directives.
3. **Canadian Forest Fire Weather Index (FWI)**: Real-time Canadian FWI physics engine (FFMC, ISI) coupled with live **Open-Meteo** provincial weather stations.
4. **Hardware-Accelerated 60 FPS GPU Canvas Map**: Custom Leaflet 2D HTML5 Canvas engine smoothly plotting thousands of satellite coordinates and official KLHK Peatland Hydrological Unit (KHG) polygons with zero frame drops.
5. **Decentralized MRV & Blockchain Audit Trail**: Native Web Crypto **SHA-256** canonical block linking with live RPC anchoring and ECDSA signatures on the **Polygon Amoy Testnet (Chain ID: 80002)**, fully verifiable on Polygonscan.
6. **IPCC Tier 2 Carbon Accounting**: Wooster (2005) Fire Radiative Energy ($C_{rad} = 0.368\text{ kg/MJ}$) and 2013 IPCC Wetlands Supplement methodology, quantifying avoided greenhouse gas emissions ($CO_2$, $CH_4$, $CO$, $N_2O$) into Verified Carbon Units (VCUs).

---

## 🏗 System Architecture

```
                                  [ ORBITAL TELEMETRY ]
                           NASA LANCE FIRMS (VIIRS 375m NRT)
                           Live CSV: 2,991 Thermal Anomalies
                                          │
                                          ▼
                               [ DATA & SENSING ENGINE ]
                   ┌──────────────────────┴──────────────────────┐
                   ▼                                             ▼
          [ Open-Meteo API ]                            [ KLHK Geospatial ]
      5 Provincial Weather Hubs                     Peatland Hydrological Units
   (Temp, RH, Wind, Rain, Pressure)                 (KHG Deep Peat Polygons)
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          ▼
                               [ COMPUTATIONAL CORE ]
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
 [ Canadian FWI Engine ]         [ AI PeatNet (MLP) ]           [ IPCC Tier 2 MRV ]
  • Fine Fuel Moisture (FFMC)     • Smoldering Ignition %        • Wooster FRE Biomass
  • Initial Spread Index (ISI)    • Perimeter Spread Rate (m/h)  • CO₂, CH₄, CO, N₂O
  • Peatland Risk Score (0-100)   • Shapley Attribution Factors  • Avoided Emissions (VCUs)
       └──────────────────────────────────┬──────────────────────────────────┘
                                          ▼
                         [ CLIENT-SIDE REACTION LAYER ]
                                TanStack Start (SSR)
                        60 FPS Leaflet HTML5 Canvas Map
                                          │
                                          ▼
                        [ DECENTRALIZED TRUST LAYER ]
                     Immutable SHA-256 Merkle Audit Chain
                 Live RPC Anchoring: Polygon Amoy (Chain 80002)
                   ECDSA secp256k1 Validator Node Signatures
                       Public Verification on Polygonscan
```

---

## 🚀 Key Modules & Capabilities

### 1. Operations Dashboard (`/`)
* **Live KPI Telemetry**: 2,991 NASA satellite hotspots, 12,562 ha vulnerable peat area, verified field incidents, and 14,130+ $tCO_2e$ avoided emissions.
* **Instant NASA Sync**: Manual and 15-minute background polling synchronization with NASA EOSDIS servers.
* **Real-Time Weather Widget**: Dynamic atmospheric readings from the Palangka Raya meteorological station.
* **AI Neural Model Snapshot**: Live PeatNet risk badge, smoldering probability, and tactical guidance.

### 2. Live Spatial Map (`/map`)
* **GPU Canvas Engine**: Eliminates DOM bloat by rendering 2,991 points on a single HTML5 2D Canvas context with hardware acceleration.
* **High-Res Basemaps**: ESRI World Imagery Satellite basemap with OpenStreetMap vector toggle.
* **Smart Filter & Drone Recenter**: Quick filtering for *Critical (> 20 MW)* hotspots and sub-second inertial `flyTo` transitions across Central, West, South, East, and North Kalimantan.
* **Hotspot Inspector**: Detailed readout of Fire Radiative Power (FRP), Brightness Temperature (TI4), acquisition timestamp, and single-click field reporting.

### 3. Peatland Fire Risk Analysis (`/risk`)
* **Canadian FWI Standard**: Mathematical modeling of moisture depletion in superficial peat moss and duff layers.
* **Interactive Neural Simulator**: Real-time interactive sliders allowing operators to simulate the impact of rising ambient temperatures, dropping humidity, high wind speeds, and deep peat horizons on subterranean smoldering risk and perimeter spread.

### 4. Field Incident Management (`/reports`)
* **Standardized Incident Registry**: Ground verification logging with one-tap device GPS coordinate capture.
* **Cryptographic Block Anchoring**: Every created report and status change (`Draft Created` $\rightarrow$ `Under Verification` $\rightarrow$ `Verified` $\rightarrow$ `Response Active` $\rightarrow$ `Resolved`) is hashed and minted to the ledger.
* **CSV Export**: Direct export of field data and block hashes for government and NGO reporting.

### 5. Blockchain Audit Trail (`/audit`)
* **Live Polygon Amoy RPC**: Real-time EVM node connectivity, displaying current block height, gas prices, and validator addresses.
* **Browser-Native Web Crypto SHA-256 Verifier**: Independent cryptographic audit engine validating the hash of each block and linking headers (`previous_hash` $\rightarrow$ `block_hash`).
* **Polygonscan Integration**: One-click direct inspection of block anchors on the official Polygon block explorer.
* **Smart Contract Specification**: Complete Solidity implementation (`IncidentRegistry.sol`) ready for EVM testnet deployment.

### 6. Carbon Emissions Accounting (`/emissions`)
* **IPCC Wetlands Supplement (2013)**: Calculation of greenhouse gas release ($CO_2$, $CH_4$ with GWP 28, $CO$, and $N_2O$ with GWP 265).
* **Wooster (2005) FRE Conversion**: Direct conversion of satellite radiative energy to dry matter biomass consumption.
* **Avoided Emissions Simulator**: Quantifies how rapid physical suppression (water-bombing, canal blocking) yields high-integrity carbon credits (VCUs) eligible for international carbon markets.

---

## 🛠 Tech Stack

* **Framework**: [TanStack Start](https://tanstack.com/start) / React 19 / Nitro
* **Package Manager & Runtime**: [Bun](https://bun.sh)
* **Geospatial Engine**: [Leaflet](https://leafletjs.com) with HTML5 Canvas Hardware Renderer & ESRI Satellite Imagery
* **Blockchain & Web3**: [Viem](https://viem.sh), Web Crypto API, Polygon Amoy Testnet (Chain ID: 80002)
* **Styling**: Tailwind CSS, Lucide Icons, Shadcn UI primitives
* **Video Production**: [Remotion](https://remotion.dev), Playwright, FFmpeg, Neural TTS

---

## 💻 Local Development Setup

### Prerequisites
* [Bun](https://bun.sh) (v1.2+ recommended)
* Node.js v20+

### Installation & Run
```bash
# 1. Clone repository
git clone https://github.com/ArrafiNurHafiz/FireChain-AI.git
cd FireChain-AI

# 2. Enter frontend directory and install dependencies
cd frontend
bun install

# 3. Start local development server
bun run dev
```

Open `http://localhost:8080` in your browser.

### Production Build & Vercel Deployment
```bash
# Build with Vercel prebuilt preset
NITRO_PRESET=vercel bun run build

# Deploy to Vercel
bunx vercel deploy --prebuilt --prod
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

---
**FireChain AI** — Engineered for planetary resilience and decentralized climate accountability at the **IEEE ClimateChain Global Hackathon 2026**.
