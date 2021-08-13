FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install\
    && npm install typescript -g

COPY . .

RUN npm run build 

ADD /src/config/*.json ./build/src/config/

RUN npm run start 
# CMD ["npm", "run", "start"]