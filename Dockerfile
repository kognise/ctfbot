FROM node:8

WORKDIR /opt/ctfbot

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . .
CMD [ "node", "index.js" ]