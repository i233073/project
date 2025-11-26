FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Create backups folder with correct permissions
RUN mkdir -p /usr/src/app/backups && chmod -R 777 /usr/src/app/backups

EXPOSE 3000

CMD ["npm", "start"]

