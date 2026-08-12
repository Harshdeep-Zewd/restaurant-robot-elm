# RoboServ-X1 | Restaurant Robot Engineering Lifecycle Platform (ELM)

A Codebeamer and Jama-inspired **Systems Engineering & Engineering Lifecycle Management** application built specifically for the **Autonomous Restaurant Delivery Robot ("RoboServ-X1")** project.

---

## 🌟 Key Features & Modules

- **Project & Tracker Hierarchy**: Configurable Trackers (System Requirements, Software Requirements, Architecture, Risks, Test Cases, Test Sets, Test Configurations, Test Runs, Change Requests, Baselines, Artifacts).
- **Requirements Management**: Structured DB objects with title, text, rationale, source, verification method, version history, parent-child relations, and workflow state.
- **Traceability Engine**: Generic bidirectional relationship model with 2D Traceability Matrix, coverage analysis, and unverified requirement detection.
- **Step-by-Step Test Runner**: Test Set grouping, build under test configurations (LiDAR sensor setups, software builds), ordered test steps, and live Pass/Fail recording.
- **Risk & Hazard Management**: 5x5 Severity x Exposure x Avoidance Risk Matrix calculator and mitigation requirement mapping.
- **Change Requests & Impact Analysis**: Workflow-driven Change Requests (CRs) with transitive upstream/downstream impact graph visualization.
- **Baselines & Freezes**: Controlled baseline snapshot creation (e.g., `v1.0-safety-approved`) and version freeze audit tools.
- **File Artifacts Repository**: Separate file storage for CAD STEP/STL models, ROS 2 bag logs, CSV telemetry data, and PDFs.

---

## 🚀 How to Host & Deploy to Cloud (Access from Any Device)

### Option A: Free 1-Click Deployment on Vercel
1. Push this repository to your **GitHub** account.
2. Sign in to [Vercel.com](https://vercel.com) using GitHub.
3. Click **"New Project"** and select your `restaurant-robot-elm` GitHub repository.
4. Click **Deploy**. Vercel will build and host your web app on a live HTTPS URL (e.g., `https://roboserv-elm.vercel.app`) accessible from any laptop, tablet, or phone!

### Option B: Deploy on Render.com
1. Push your repository to **GitHub**.
2. Connect your repo on [Render.com](https://render.com) as a Web Service.
3. Render automatically reads `render.yaml` and deploys your fullstack platform.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18 or higher)

### Setup & Launch
```bash
# Install root, server, and client dependencies
npm install

# Run seed script to populate Autonomous Restaurant Robot dataset
npm run seed

# Start fullstack dev server (API on port 4000, Web UI on port 3000)
npm run dev
```

Open your browser at `http://localhost:3000` to view the platform!
