# ╔══════════════════════════════════════════════════════╗
# ║            DOCKERFILE — FinTrackr App               ║
# ╚══════════════════════════════════════════════════════╝

# STEP 1 — Base image (Node.js 18, alpine)
FROM node:18-alpine

# STEP 2 — Working directory
WORKDIR /app

# STEP 3 — package.json copy 
COPY backend/package.json ./

# STEP 4 — Dependencies install 
RUN npm install

# STEP 5 — Backend code copy 
COPY backend/ ./

# STEP 6 — Frontend folder copy in /app/frontend 
COPY frontend/ ./frontend/

# STEP 7 — Port expose 
EXPOSE 3000

# STEP 8 — App start
CMD ["node", "server.js"]
