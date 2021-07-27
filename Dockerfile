FROM node:alpine

RUN mkdir -p /usr/src/hagglex && chown -R node:node /usr/src/hagglex

WORKDIR /usr/src/hagglex

COPY package.json yarn.lock ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 8000