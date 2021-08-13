FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install\
    && npm install typescript -g

COPY . .
EXPOSE 5000

RUN npm run build 

ADD /src/config/*.json ./build/src/config/

CMD ["npm", "run", "start"]