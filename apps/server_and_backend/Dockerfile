# syntax=docker/dockerfile:1

FROM node:16-slim
ENV NODE_ENV=production RUNNING_IN_DOCKER_CONTAINER=true

RUN apt-get update && apt-get -yq upgrade
#  && apt-get install \
#     && apt-get autoremove && apt-get autoclean

RUN apt-get update && apt-get install -y gnupg2
RUN apt-get update && apt-get install -y wget --no-install-recommends
RUN wget --no-check-certificate -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
RUN apt-get update
RUN apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst \
      --no-install-recommends
RUN apt update \
    && apt install fonts-freefont-ttf
RUN rm -rf /var/lib/apt/lists/*
# RUN apt-get purge --auto-remove -y curl
RUN rm -rf /src/*.deb

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

WORKDIR /server_and_backend
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

ARG CACHEBUST=1
RUN npm i puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /server_and_backend

USER pptruser

RUN mkdir /keys_folder

COPY . .

# ENTRYPOINT ["dumb-init", "--"]
# ENTRYPOINT ["google-chrome"]
CMD ["node", "index.js"]