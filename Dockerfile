# Stage 1: Build the React app
FROM node:16 AS builder
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first, improving caching
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy the built React app to the NGINX html folder
COPY --from=builder /app/build /usr/share/nginx/html

# Add custom nginx configuration file to listen on port 8080 for Cloud Run
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
