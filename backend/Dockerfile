FROM node:18-alpine

# Install Docker CLI for managing containers
RUN apk add --no-cache docker-cli git

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]