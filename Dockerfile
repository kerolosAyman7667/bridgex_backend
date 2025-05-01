FROM node:22.8.0-alpine AS stage

WORKDIR /app/temp

COPY ./package*.json ./
RUN npm install 
RUN npm install -g @nestjs/cli --save
RUN npx typedoc --entryPoints src --entryPointStrategy expand --out docs

COPY . .

RUN npm run build

FROM node:22.8.0-alpine AS build

WORKDIR /app

COPY --from=stage /app/temp/dist ./dist
COPY --from=stage /app/temp/docs ./docs
COPY --from=stage /app/temp/package*.json .
RUN npm install --omit=dev

ENV NODE_ENV=production

CMD ["sh", "-c", "npm run start:prod"]