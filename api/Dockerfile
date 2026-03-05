FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Lean production image — only compiled dist + prod deps
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force && \
    # Remove packages pulled in transitively by typeorm/ts-node but not needed at runtime
    rm -rf node_modules/typescript node_modules/ts-node node_modules/tsconfig-paths \
           node_modules/@types /tmp/* /root/.npm
EXPOSE 5000
CMD ["node", "dist/main"]
