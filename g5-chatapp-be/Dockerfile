FROM node:20 AS development

WORKDIR /lean1123/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# PRODUCTION
FROM node:20 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /lean1123/src/app

COPY --from=development /lean1123/src/app/ .

EXPOSE 8080

CMD ["node", "dist/main"]