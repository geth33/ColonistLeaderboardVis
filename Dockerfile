# Dockerfile
FROM node:16 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve the React app with a lightweight server
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]