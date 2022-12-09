# synthax=docker/dockerfile:1

# Launch React App with "npm start"

FROM node:16.14.2
ENV NODE_ENV=production
WORKDIR /react_app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD ["npm", "start"]


# Serve React Application With NGINX and Docker

# FROM node:16.14.2 AS build-stage
# WORKDIR /react_app
# COPY ["package.json", "package-lock.json*", "/react_app/"]
# # COPY package*.json /react_app/
# RUN npm install
# COPY ./ /react_app/
# RUN npm run build

# FROM nginx:latest
# # WORKDIR /usr/share/nginx/html
# COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
# RUN rm -rf /usr/share/nginx/html/*
# COPY --from=build-stage /react_app/build .
# ENTRYPOINT [ "nginx", "-g", "daemon off;"]