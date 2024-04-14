FROM node:18

WORKDIR /app/server

COPY package*.json ./

RUN npm install --force

COPY . .

CMD ["npm", "start"]