FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY backend/package.json backend/
COPY web/package.json web/
COPY shared/package.json shared/
COPY mobile/package.json mobile/
RUN npm install
COPY . .
RUN npx prisma generate --schema=backend/prisma/schema.prisma
RUN npm run build:web

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/web/dist ./web/dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start"]
