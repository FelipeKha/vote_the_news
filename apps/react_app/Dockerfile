# synthax=docker/dockerfile:1

FROM node:16.14.2
ENV NODE_ENV=production
WORKDIR /react_app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
CMD ["npm", "start"]