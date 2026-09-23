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

## ⚡ COPY-PASTE READY COMMANDS CHEATSHEET

### 🎨 1. Frontend & Tailwind CSS Dependencies (Run in Terminal)

#### 📦 A. Quick Install All Frontend Dependencies:
```bash
# Navigate to the frontend portal directory
cd frontend/learner-portal

# Install all required React, TailwindCSS, Lucide icons, and animation libraries
npm install
```

#### 🎨 B. Install Tailwind CSS v4 & UI Packages Specifically:
If you are setting up or adding Tailwind CSS and supporting UI libraries individually, run:

```bash
# 1. Install Tailwind CSS v4 Core and Vite Plugin
npm install tailwindcss @tailwindcss/vite

# 2. Install Lucide Icons, Framer Motion & UI Utilities
npm install lucide-react framer-motion canvas-confetti date-fns react-router-dom axios
```

#### ⚙️ C. Tailwind CSS v4 Configuration Reference:
- **Vite Plugin** in `frontend/learner-portal/vite.config.js`:
  ```javascript
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";

  export default defineConfig({
    plugins: [
      react(),
      tailwindcss(),
    ],
  });
  ```

- **Global CSS Import** in `frontend/learner-portal/src/index.css`:
  ```css
  @import "tailwindcss";
  ```

---

### ☕ 2. Set Up Java 17 Environment (Run before compiling backend)

#### 🪟 Windows (PowerShell):
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

#### 🪟 Windows (Command Prompt - CMD):
```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%
java -version
```

#### 🍎 macOS / 🐧 Linux (Bash/Zsh):
```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home # or /usr/lib/jvm/java-17-openjdk
export PATH=$JAVA_HOME/bin:$PATH
java -version
```

---

### 🛠️ 3. Compile All 10 Backend Microservices (Copy & Paste)

#### 🪟 Windows (PowerShell):
```powershell
$services = @("config-server", "discovery-server", "api-gateway", "identity-service", "catalog-service", "progress-service", "assessment-service", "certification-service", "assignment-service", "notification-service")

foreach ($s in $services) {
    Write-Host "`n📦 Compiling $s..." -ForegroundColor Cyan
    Push-Location "backend\$s"
    .\mvnw.cmd clean compile
    Pop-Location
}
```

#### 🍎 macOS / 🐧 Linux (Bash):
```bash
services=("config-server" "discovery-server" "api-gateway" "identity-service" "catalog-service" "progress-service" "assessment-service" "certification-service" "assignment-service" "notification-service")

for s in "${services[@]}"; do
    echo "📦 Compiling $s..."
    cd "backend/$s" && ./mvnw clean compile && cd ../..
done
```

---

### 🐬 4. MySQL Database Setup (Optional — Auto-Created by Default)
If you want to manually create all databases, run this in your MySQL client (`root` / `Prakhar@321`):
```sql
CREATE DATABASE IF NOT EXISTS identity_db;
CREATE DATABASE IF NOT EXISTS catalog_db;
CREATE DATABASE IF NOT EXISTS progress_db;
CREATE DATABASE IF NOT EXISTS assessment_db;
CREATE DATABASE IF NOT EXISTS certification_db;
CREATE DATABASE IF NOT EXISTS dlm_assignment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
```

---

### ▶️ 5. Start Everything (Run Commands)

#### 🅰️ Start All 10 Backend Microservices (Single Command):
```powershell
# Run from repository root in PowerShell:
powershell -ExecutionPolicy Bypass -File backend\start-all-microservices.ps1
```

#### 🅱️ Start Frontend Portal:
```bash
# Run in a separate terminal:
cd frontend/learner-portal
npm run dev
```
👉 Open **`http://localhost:5173/`** in your browser!

---

### 📂 6. Run Individual Backend Microservices (One-by-One Commands)

| Microservice | Port | Windows (CMD) Run Command | Linux/Mac Run Command |
|---|---|---|---|
| **Config Server** | `8888` | `cd backend\config-server && .\mvnw.cmd spring-boot:run` | `cd backend/config-server && ./mvnw spring-boot:run` |
| **Discovery Server** | `8761` | `cd backend\discovery-server && .\mvnw.cmd spring-boot:run` | `cd backend/discovery-server && ./mvnw spring-boot:run` |
| **API Gateway** | `8080` | `cd backend\api-gateway && .\mvnw.cmd spring-boot:run` | `cd backend/api-gateway && ./mvnw spring-boot:run` |
| **Identity Service** | `8081` | `cd backend\identity-service && .\mvnw.cmd spring-boot:run` | `cd backend/identity-service && ./mvnw spring-boot:run` |
| **Catalog Service** | `8082` | `cd backend\catalog-service && .\mvnw.cmd spring-boot:run` | `cd backend/catalog-service && ./mvnw spring-boot:run` |
| **Progress Service** | `8083` | `cd backend\progress-service && .\mvnw.cmd spring-boot:run` | `cd backend/progress-service && ./mvnw spring-boot:run` |
| **Assessment Service** | `8084` | `cd backend\assessment-service && .\mvnw.cmd spring-boot:run` | `cd backend/assessment-service && ./mvnw spring-boot:run` |
| **Certification Service**| `8085` | `cd backend\certification-service && .\mvnw.cmd spring-boot:run`| `cd backend/certification-service && ./mvnw spring-boot:run`|
| **Assignment Service** | `8086` | `cd backend\assignment-service && .\mvnw.cmd spring-boot:run` | `cd backend/assignment-service && ./mvnw spring-boot:run` |
| **Notification Service** | `8087` | `cd backend\notification-service && .\mvnw.cmd spring-boot:run`| `cd backend/notification-service && ./mvnw spring-boot:run`|

---

### 🚀 7. Push to GitHub (Copy & Paste Commands)
```bash
# Add all files
git add -A

# Commit changes
git commit -m "feat: complete Phase 1-5 enterprise learning platform with real-time streak, direct enrollment, RAG, MCP servers, and copy-paste ready documentation"

# Ensure remote is set to your repository
git remote set-url origin https://github.com/Prakhar102/Digital_Learning.git

# Push to main branch
git push -u origin main
```

---

## 🏛️ Platform Architecture & Topology

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

| Role | Default Email | Portal Access |
|---|---|---|
| **Learner / Student** | `student@dlm.edu` | `/dashboard`, `/courses`, `/learn/:id`, `/knowledge-hub`, `/agent-studio`, `/flashcards` |
| **Instructor / Faculty** | `instructor@dlm.edu` | `/instructor/dashboard`, `/instructor/create-course`, `/instructor/submissions` |
| **System Administrator** | `admin@dlm.edu` | `/admin/dashboard`, `/admin/instructors`, `/admin/analytics`, `/admin/courses` |

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
