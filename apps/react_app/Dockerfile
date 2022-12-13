# synthax=docker/dockerfile:1

# Launch React App with "npm start"

# FROM node:16.14.2
# ENV NODE_ENV=production
# WORKDIR /react_app
# COPY ["package.json", "package-lock.json*", "./"]
# RUN npm install --production
# COPY . .
# CMD ["npm", "start"]


# Serve React Application With NGINX and Docker

FROM node:16.14.2 AS build-stage
WORKDIR /react_app
COPY ["package.json", "package-lock.json*", "/react_app/"]
# COPY package*.json /react_app/
RUN npm install
COPY ./ /react_app/
RUN npm run build

FROM nginx:latest
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /react_app/build /usr/share/nginx/html
COPY ./env.sh /usr/share/nginx/html
COPY .env /usr/share/nginx/html
RUN chmod +x /usr/share/nginx/html/env.sh
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]

# WORKDIR /usr/share/nginx/html
# RUN rm -rf /etc/nginx/nginx.conf
# RUN mkdir -p /var/www/votethenews.com/html
# RUN chown -R $USER:$USER /var/www/votethenews.com/html
# RUN chmod -R 755 /var/www/votethenews.com
# RUN rm -rf /var/www/votethenews.com/html/*
# EXPOSE 3000 80

# COPY ./.nginx/nginx.conf /etc/nginx/sites-available/votethenews.com
# RUN ln -s /etc/nginx/sites-available/votethenews.com /etc/nginx/sites-enabled/
# RUN rm -rf /usr/share/nginx/html/*

# ENTRYPOINT [ "nginx", "-g", "daemon off;"]