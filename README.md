# FinTrackr — Expense Tracker App

A full-stack expense tracking web app with a complete DevSecOps CI/CD pipeline.

---

## What This Project Does

- Track your income and expenses
- View spending by category with charts
- Light and Dark mode support
- Fully automated build and deploy pipeline

---

## Tech Stack

| Part | Technology |
|------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| Database | Redis |
| Server | Nginx |
| Container | Docker, Docker Compose |
| CI/CD | Jenkins |
| Code Quality | SonarCloud |
| Security Scan | Trivy |
| Registry | Docker Hub |

---

## Project Structure

```
fintrackr/
├── frontend/
│   └── index.html
├── backend/
│   ├── server.js
│   ├── server.test.js
│   └── package.json
├── nginx/
│   └── nginx.conf
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
└── sonar-project.properties
```

---

## Jenkins Pipeline — 11 Stages

```
Stage 1  →  Code Download      (git clone)
Stage 2  →  Verify NodeJS      (node -v)
Stage 3  →  Install Packages   (npm install)
Stage 4  →  Run Tests          (jest)
Stage 5  →  SonarCloud Scan    (code quality)
Stage 6  →  Docker Build       (create image)
Stage 7  →  Verify Trivy       (trivy version)
Stage 8  →  Trivy Scan         (security check)
Stage 9  →  Docker Login       (dockerhub)
Stage 10 →  Docker Push        (upload image)
Stage 11 →  Deploy             (docker compose up)
```

---

## How to Run Locally

```bash
# Clone the repo
git clone https://github.com/suman023/fintracker.git
cd fintracker

# Start with Docker
docker compose up -d

# Open in browser
http://localhost:3000
```

---

## API Endpoints

| Method | URL | What it does |
|--------|-----|-------------|
| GET | /api/health | Check if app is running |
| GET | /api/transactions | Get all transactions |
| POST | /api/transactions | Add new transaction |
| DELETE | /api/transactions/:id | Delete a transaction |
| GET | /api/stats | Get summary stats |

---

## Jenkins Setup

1. Add credentials in Jenkins:
   - `dockerhub-credentials` — Docker Hub username and password
   - `sonar-token` — SonarCloud token

2. Configure SonarCloud:
   - Manage Jenkins → Configure System → SonarQube Servers
   - Name: `SonarCloud`
   - URL: `https://sonarcloud.io`

3. Configure Email:
   - SMTP: `smtp.gmail.com`
   - Port: `465`
   - Use SSL: Yes
