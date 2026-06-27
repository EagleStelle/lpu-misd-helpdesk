# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS frontend-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM frontend-deps AS frontend-build
WORKDIR /app
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM ${NODE_IMAGE} AS backend-deps
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

FROM ${NODE_IMAGE} AS app
WORKDIR /app
ENV NODE_ENV=production \
    PORT=5000 \
    FRONTEND_DIST_DIR=/app/public
COPY --from=backend-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=frontend-build --chown=node:node /app/dist ./public
COPY --chown=node:node backend/package.json backend/package-lock.json ./
COPY --chown=node:node backend/server.js ./server.js
COPY --chown=node:node backend/config ./config
COPY --chown=node:node backend/middleware ./middleware
COPY --chown=node:node backend/routes ./routes
COPY --chown=node:node backend/services ./services
COPY --chown=node:node backend/utils ./utils
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "const port=process.env.PORT||5000; fetch('http://127.0.0.1:'+port+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
