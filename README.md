# 🎓 Digital Learning Mentor (DLM) — Enterprise AI Learning Platform

> **A Cloud-Native, 10-Microservice AI-Powered Learning Experience Ecosystem featuring Multi-Domain RAG, Autonomous Tool-Calling Agents, Model Context Protocol (MCP) JSON-RPC 2.0 Servers, Socratic Debate Arena, and Explainable Multi-Agent Observability.**

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2025.1.3-green.svg)](https://spring.io/projects/spring-cloud)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?logo=mysql)](https://www.mysql.com/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-JSON--RPC_2.0-purple.svg)](https://modelcontextprotocol.io/)

---

## 📑 Table of Contents
1. [Platform Overview & Rubric Phases](#-platform-overview--rubric-phases)
2. [Prerequisites](#-prerequisites)
3. [Folder-by-Folder Dependency Installation Guide](#-folder-by-folder-dependency-installation-guide)
4. [How to Run the Entire System](#-how-to-run-the-entire-system)
5. [Microservices Port Mapping & Topology](#-microservices-port-mapping--topology)
6. [Key Enterprise Features](#-key-enterprise-features)
7. [Default Roles & Credentials](#-default-roles--credentials)

---

## 🏛️ Platform Overview & Rubric Phases

The **Digital Learning Mentor (DLM)** platform is built from the ground up across all 5 evaluation rubric tiers:

```
                                  ┌────────────────────────┐
                                  │   React 19 Frontend    │
                                  │ (Vite @ localhost:5173)│
                                  └───────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                  ┌────────────────────────┐
                                  │   Spring Cloud Gateway │
                                  │     (Port 8080)        │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         ┌────────────────────────┐                      ┌────────────────────────┐
         │ Config Server (8888)   │                      │ Eureka Registry (8761) │
         └────────────────────────┘                      └────────────────────────┘
                      │                                               │
         ┌────────────┴───────────────────────────────────────────────┴────────────┐
         ▼                 ▼                ▼                 ▼                  ▼
  ┌─────────────┐   ┌─────────────┐  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐
  │  Identity   │   │   Catalog   │  │  Progress   │   │ Assessment  │    │Certification│
  │ (Port 8081) │   │ (Port 8082) │  │ (Port 8083) │   │ (Port 8084) │    │ (Port 8085) │
  └─────────────┘   └─────────────┘  └─────────────┘   └─────────────┘    └─────────────┘
         ▼                 ▼
  ┌─────────────┐   ┌─────────────┐
  │ Assignment  │   │Notification │
  │ (Port 8086) │   │ (Port 8087) │
  └─────────────┘   └─────────────┘
```

- **Phase 1: Full-Stack Enterprise Platform**: 10 Spring Boot microservices, Eureka discovery, dynamic real-time catalog, instant multi-party notification system, and student PDF homework grading console.
- **Phase 2: Multi-Domain RAG Assistant & Anti-Skip Player**: 4-domain semantic retrieval knowledge hub, strict non-skip video lecture tracking, and AI-generated spaced-repetition flashcards.
- **Phase 3: Autonomous Agent Studio & Socratic Arena**: 4 context-aware autonomous agents with tool-calling sandbox and adversarial Socratic debate engine.
- **Phase 4: Model Context Protocol (MCP) Integration**: 4 JSON-RPC 2.0 servers (`LMS`, `Content`, `Cert`, `Collab`) with interactive protocol inspector.
- **Phase 5: Multi-Agent Collaboration & Observability**: 5-agent supervisor orchestrator with trace waterfall and interactive learning path decision tree.

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

1. **Java JDK 17** (Required for Spring Boot microservices):
   - Verified path: `C:\Program Files\Java\jdk-17`
2. **Node.js (v18.x or v20.x+) & npm** (Required for React frontend)
3. **MySQL Server 8.0+** (Default port `3306`, user `root`)
4. **PowerShell / Terminal** (Windows / macOS / Linux)
5. **Git**

---

## 📦 Folder-by-Folder Dependency Installation Guide

### 1️⃣ Frontend (`frontend/learner-portal/`)
The frontend is a high-performance React 19 + Vite single-page application.

```bash
# Navigate to the frontend directory
cd frontend/learner-portal

# Install all npm dependencies
npm install
```

#### Dependencies installed in `frontend/learner-portal/package.json`:
- `react` & `react-dom` (v19)
- `react-router-dom` (v7) — Enterprise client-side routing
- `lucide-react` — Modern vector icon library
- `tailwindcss` & `@tailwindcss/vite` (v4) — Design system styling
- `axios` — HTTP client with interceptors
- `framer-motion` — Micro-animations & UI transitions
- `canvas-confetti` — Milestone & celebration rewards
- `jspdf` — Client-side verifiable certificate rendering

---

### 2️⃣ Backend Microservices (`backend/`)
The backend consists of 10 microservices equipped with Maven wrappers (`mvnw.cmd` on Windows / `mvnw` on Linux).

You do **not** need a separate global Maven installation; each service uses its included Maven wrapper.

#### Set your Java 17 environment variable:
```powershell
# In PowerShell:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

```bash
# In Bash (macOS/Linux):
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH
```

#### Compiling each backend service (Optional test):
```bash
# Example: Compile Config Server
cd backend/config-server
./mvnw clean compile

# Example: Compile Eureka Discovery Server
cd backend/discovery-server
./mvnw clean compile
```

---

### 3️⃣ Database Configuration (`MySQL`)
All database schemas are configured with `createDatabaseIfNotExist=true` in `backend/config-repo/*.yml`. Ensure your MySQL server is running on `localhost:3306` with credentials matching your local environment (default configured: `root` / `Prakhar@321`).

---

## 🚀 How to Run the Entire System

### Step 1: Start All 10 Backend Microservices (Automated)

Run the included automated PowerShell launcher which boots all services in their optimal dependency order:

```powershell
# From the project root:
powershell -ExecutionPolicy Bypass -File backend\start-all-microservices.ps1
```

*This script initializes:*
1. **Config Server** (Port `8888`) &mdash; *waits 12 seconds*
2. **Discovery Server (Eureka)** (Port `8761`) &mdash; *waits 12 seconds*
3. **API Gateway** (Port `8080`)
4. **Identity Service** (Port `8081`)
5. **Catalog Service** (Port `8082`)
6. **Progress Service** (Port `8083`)
7. **Assessment Service** (Port `8084`)
8. **Certification Service** (Port `8085`)
9. **Assignment Service** (Port `8086`)
10. **Notification Service** (Port `8087`)

---

### Step 2: Start the Frontend Portal

Open a new terminal window:

```bash
cd frontend/learner-portal
npm run dev
```

The portal will be live at: **`http://localhost:5173/`**

---

## 🌐 Microservices Port Mapping & Topology

| Service Name | Port | Health / Registry Endpoint | Description |
|---|---|---|---|
| **Frontend Portal** | `5173` | `http://localhost:5173` | React 19 UI with RAG, MCP, Observability & Streak |
| **API Gateway** | `8080` | `http://localhost:8080/actuator/health` | Central routing, rate limiting, and CORS security |
| **Eureka Registry** | `8761` | `http://localhost:8761` | Service discovery & live node registration dashboard |
| **Config Server** | `8888` | `http://localhost:8888/actuator/health` | Centralized Spring Cloud configuration repository |
| **Identity Service** | `8081` | `http://localhost:8080/api/auth` | JWT Auth, RBAC (Learner, Instructor, Admin) |
| **Catalog Service** | `8082` | `http://localhost:8080/api/courses` | Curricula, modules, lessons, and tech categories |
| **Progress Service** | `8083` | `http://localhost:8080/api/progress` | Lecture progress tracking, video time clamp |
| **Assessment Service**| `8084` | `http://localhost:8080/api/assessments` | Graded quizzes, test submissions & rubric score |
| **Certification** | `8085` | `http://localhost:8080/api/certificates` | Verifiable credentials & SHA-256 certificate hashes |
| **Assignment** | `8086` | `http://localhost:8080/api/assignments` | PDF homework submissions & instructor grading |
| **Notification** | `8087` | `http://localhost:8080/api/notifications` | Real-time multi-party event alert dispatcher |

---

## 🌟 Key Enterprise Features

### 1. Dynamic Real-Time Learning Streak Engine
- **LeetCode-Style 52-Week Heatmap**: Reactive green-tier activity grid computed from real user actions (`LESSON_COMPLETED`, `COURSE_ENROLLED`, `ASSIGNMENT_SUBMITTED`, logins).
- **Interactive Avatar Modal**: Click the top-header circular avatar button or streak flame to inspect active streaks, consistency scores, and activity breakdowns.

### 2. Streamlined Course Catalog & Direct Enrollment
- **High-Impact 3D Course Cards**: Auto-generated tech thumbnails, live views counters, and dynamic bestseller badges.
- **Direct "Enroll Now" Action**: Zero cart clutter; clicking **"Enroll Now"** dispatches instant notifications to the course instructor (`🎓 New Student Enrolled`) and system admin, updating live student rosters in real time.

### 3. Model Context Protocol (MCP) JSON-RPC 2.0 Inspector (`/mcp-explorer`)
- **LMS Server** (`mcp://dlm-lms-service`)
- **Content Server** (`mcp://dlm-content-service`)
- **Certification Server** (`mcp://dlm-cert-service`)
- **Collaboration Server** (`mcp://dlm-collab-service`)
- Interactive JSON-RPC 2.0 protocol testing sandbox with real-time response payload formatting.

### 4. Multi-Agent Collaboration & Observability (`/agent-observability`)
- 5-Agent swarm decomposition waterfall with token usage analytics and latency metrics.
- Interactive SVG Learning Path Decision Tree with visual reason node inspection.

---

## 🔑 Default Roles & Credentials

You can log in or register under any of the 3 supported platform roles:

| Role | Default Email | Portal Access |
|---|---|---|
| **Learner / Student** | `student@dlm.edu` | `/dashboard`, `/courses`, `/learn/:id`, `/knowledge-hub`, `/agent-studio`, `/flashcards` |
| **Instructor / Faculty** | `instructor@dlm.edu` | `/instructor/dashboard`, `/instructor/create-course`, `/instructor/submissions` |
| **System Administrator** | `admin@dlm.edu` | `/admin/dashboard`, `/admin/instructors`, `/admin/analytics`, `/admin/courses` |

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
