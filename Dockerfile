FROM node:16-slim
RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api
COPY . .
RUN npm install -g npm
RUN npm install
EXPOSE 3000
CMD [ "node", "./build/server.js" ]
