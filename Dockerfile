FROM node:lts-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV MQTT_URI=mqtt://mqtt

CMD [ "node", "dist/tank.js" ]