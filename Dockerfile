# Use official Node LTS slim image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies (production)
COPY package*.json ./
RUN npm ci --production

# Copy app source
COPY . .

# Ensure NODE_ENV=production
ENV NODE_ENV=production

# Expose port your app listens on
EXPOSE 3000

# Use a non-root user (optional / good practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Start the app
CMD ["node", "app.js"]

