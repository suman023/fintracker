# ╔══════════════════════════════════════════════════════╗
# ║            DOCKERFILE — FinTrackr App               ║
# ╚══════════════════════════════════════════════════════╝

# STEP 1 — Base image (Node.js 18, alpine = choti size)
FROM node:18-alpine

# STEP 2 — Working directory set karo container ke andar
WORKDIR /app

# STEP 3 — Pehle package.json copy karo (caching ke liye)
COPY backend/package.json ./

# STEP 4 — Dependencies install karo
RUN npm install

# STEP 5 — Backend code copy karo
COPY backend/ ./

# STEP 6 — Frontend folder copy karo /app/frontend mein
COPY frontend/ ./frontend/

# STEP 7 — Port expose karo
EXPOSE 3000

# STEP 8 — App start karo
CMD ["node", "server.js"]
