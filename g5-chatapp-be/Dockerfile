FROM node:20 AS development

WORKDIR /g5-chatapp-be/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# PRODUCTION
FROM node:20 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /g5-chatapp-be/src/app

COPY --from=development /g5-chatapp-be/src/app/ .

EXPOSE 8080

CMD ["node", "dist/main"]

