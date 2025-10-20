# mcp/Dockerfile
FROM node:20-bullseye-slim
WORKDIR /srv
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p /data && chown -R node:node /data
USER node
EXPOSE 8080
CMD ["node","server.mjs"]
