# syntax=docker/dockerfile:1

FROM node:16.14.2
ENV NODE_ENV=production
WORKDIR /server_and_backend
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD ["node", "index.js"]