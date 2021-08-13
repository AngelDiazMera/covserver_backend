FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install\
    && npm install typescript -g

COPY . .
EXPOSE 5000

RUN npm run build 

CMD ["npm", "run", "start"]