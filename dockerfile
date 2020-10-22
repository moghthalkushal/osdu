FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY . .

EXPOSE 8080
RUN npm install
RUN set NODE_ENV=production
CMD ["node", "server.js",">" ,"output.log" ]