# Stage 1: Build the Next.js application
# Using a specific Node.js version (e.g., 20-alpine) is recommended for stability
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker layer caching.
# This ensures npm install is only re-run if dependencies change.
COPY package.json package-lock.json ./

# Install production and development dependencies using npm ci for deterministic builds
RUN npm ci

# Copy the rest of the application files
COPY . .

# Enable Next.js standalone output tracing (important for next.config.js output: 'standalone')
ENV NEXT_PRIVATE_STANDALONE=true

# Build the Next.js application for production
RUN npm run build

# Stage 2: Create the production-ready image
# Use a minimal Node.js image for the final runtime
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create a non-root user and group for security best practices
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files from the builder stage.
# The 'standalone' output in .next/standalone includes all necessary code and node_modules.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create cache directory with proper permissions for nextjs user
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next/cache

# Ensure correct permissions for the runtime files (especially server.js)
# The Next.js standalone server needs execute permissions on some files.
RUN chmod -R a-w+x . && chmod -R a+x .next node_modules

# Set the non-root user to run the application
USER nextjs

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000
# Bind to all network interfaces for container accessibility
ENV HOSTNAME="0.0.0.0"

# Expose the port Next.js will listen on
EXPOSE 3000

# Command to start the Next.js application in production mode
# With 'output: standalone', Next.js generates a server.js file that starts the app.
CMD ["node", "server.js"]