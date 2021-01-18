# Build with: docker build -t thesis-frontend . 
# Start with: docker run --name frontend -d -p 8080:80 thesis-frontend 


### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build
### STAGE 2: Run ###
FROM nginx
COPY --from=build /usr/src/app/dist/frontend /usr/share/nginx/html