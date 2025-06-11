# 1. Use official Node.js image
FROM node:20-alpine AS builder

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# 4. Copy the rest of your code
COPY . .

# 5. Build the Next.js app
RUN npm run build

# 6. Production image, copy build artifacts
FROM node:20-alpine AS runner
WORKDIR /app

# 7. Only copy necessary files for production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 8. Set environment variables
ENV NODE_ENV=production

# 9. Expose port (default Next.js port)
EXPOSE 3000

# 10. Start the Next.js app
CMD ["npm", "start"]
