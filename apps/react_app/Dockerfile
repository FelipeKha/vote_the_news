# synthax=docker/dockerfile:1

FROM node:16.14.2 AS build-stage
WORKDIR /react_app
COPY ["package.json", "package-lock.json*", "/react_app/"]
RUN npm install
COPY ./ /react_app/
ARG REACT_APP_SERVER_URL REACT_APP_WEBSOCKET_URL_NOTIF REACT_APP_WEBSOCKET_URL_VOTES
RUN npm run build

FROM nginx:latest
# COPY ./.nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /react_app/build /usr/share/nginx/html
CMD ["/bin/sh", "-c", "nginx -g \"daemon off;\""]


# COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf
# docker pull certbot/dns-digitalocean



# RUN apt update
# RUN apt install python3 -y
# RUN apt install python3-pip -y
# RUN pip3 install pip --upgrade
# RUN pip3 install certbot-nginx
# RUN certbot --nginx -d votethenews.com -d www.votethenews.com
# RUN certbot/dns-digitalocean certonly