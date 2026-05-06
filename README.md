# 💸 Expensio — Full Stack Expense Tracker

> **CV Project** | Full-Stack Web App with Complete DevOps CI/CD Pipeline

[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![Jenkins](https://img.shields.io/badge/CI/CD-Jenkins-red)](https://jenkins.io)
[![SonarQube](https://img.shields.io/badge/Code_Quality-SonarQube-orange)](https://sonarqube.org)
[![Trivy](https://img.shields.io/badge/Security-Trivy-purple)](https://trivy.dev)

---

## 🎯 Project Overview

Expensio is a full-stack expense tracking web application with a complete DevOps CI/CD pipeline. Built as a portfolio project to demonstrate DevOps skills including containerization, automated testing, code quality analysis, security scanning, and continuous deployment.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | Redis (Cache) |
| Reverse Proxy | Nginx |
| Containerization | Docker, Docker Compose |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security Scan | Trivy |
| Registry | Docker Hub |
| Notifications | Email (SMTP) |

---

## 📁 Project Structure

```
expensio/
├── frontend/
│   └── index.html              # Single page expense tracker app
├── backend/
│   ├── server.js               # Express REST API
│   ├── server.test.js          # Jest unit tests
│   └── package.json
├── nginx/
│   └── nginx.conf              # Reverse proxy configuration
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Multi-container orchestration
├── Jenkinsfile                 # 10-stage CI/CD pipeline
├── sonar-project.properties    # SonarQube configuration
├── .env.example                # Environment variables template
└── README.md
```

---

## 🔄 CI/CD Pipeline (Jenkins — 10 Stages)

```
Push to GitHub
      │
      ▼
┌─────────────────┐
│ 1. Git Clone    │  → Checkout source code
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. npm Install  │  → Install dependencies
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. Run Tests    │  → Jest unit tests + coverage report
└────────┬────────┘
         │
┌────────▼────────┐
│ 4. SonarQube    │  → Code quality + bug detection
└────────┬────────┘
         │
┌────────▼────────┐
│ 5. Quality Gate │  → Fail if code quality is below threshold
└────────┬────────┘
         │
┌────────▼────────┐
│ 6. Docker Build │  → Build production Docker image
└────────┬────────┘
         │
┌────────▼────────┐
│ 7. Trivy Scan   │  → Scan image for CVE vulnerabilities
└────────┬────────┘
         │
┌────────▼────────┐
│ 8. Docker Login │  → Authenticate with Docker Hub
└────────┬────────┘
         │
┌────────▼────────┐
│ 9. Docker Push  │  → Push image to Docker Hub registry
└────────┬────────┘
         │
┌────────▼────────┐
│ 10. Deploy      │  → docker compose up (live deployment)
└────────┬────────┘
         │
         ▼
   📧 Email Alert (Success/Failure)
```

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/expensio.git
cd expensio
```

### 2. Run locally (without Docker)
```bash
cd backend
npm install
npm start
# Open: http://localhost:3000
```

### 3. Run with Docker
```bash
docker build -t expensio .
docker run -p 3000:3000 expensio
```

### 4. Run full stack (Docker Compose)
```bash
cp .env.example .env
docker compose up -d
# Open: http://localhost
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Add new transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/stats` | Summary statistics |

---

## 🔒 DevOps & Security Features

- **Multi-stage Docker build** — small, secure production image
- **Non-root container user** — runs as `appuser` for security
- **Trivy vulnerability scanning** — CVE detection on every build
- **SonarQube analysis** — code quality gates before deployment
- **Nginx rate limiting** — 30 requests/min per IP
- **Security headers** — Helmet.js HTTP security headers
- **Health checks** — Docker and Jenkins verify app liveness

---

## 📊 Jenkins Prerequisites

Install these plugins in Jenkins:
- Docker Pipeline
- SonarQube Scanner
- Email Extension (emailext)
- HTML Publisher
- AnsiColor

Add these credentials in Jenkins (Manage Jenkins → Credentials):
- `dockerhub-credentials` — Docker Hub username + password
- `sonar-token` — SonarQube authentication token

---

## 👨‍💻 Author

Built as a DevOps portfolio project demonstrating:
- Full-stack development (Frontend + Backend)
- Docker containerization
- CI/CD pipeline automation
- Code quality and security scanning
- Infrastructure as Code
