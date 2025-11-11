# Use official Node.js LTS image
FROM node:18-alpine
# Set working directory
WORKDIR /app
# Copy package files first (for layer caching)
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy rest of the project
COPY . .
# Fake DB URL just for Prisma client generation
ENV DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
# Generate Prisma client
RUN npx prisma generate
# Build TypeScript and show output
RUN npm run build && ls -la dist || (echo "❌ dist missing" && exit 1)
# Expose the port your app uses
EXPOSE 3000
# Start with migrations + app launch
CMD sh -c "npx prisma migrate deploy && npx prisma generate && npm run start"
