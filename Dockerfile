FROM keymetrics/pm2:latest-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

# Install app dependencies
COPY package.json .
COPY package-lock.json .
ENV NODE_ENV production
RUN npm install --only=production

COPY . .

CMD [ "pm2-runtime", "start", "pm2.json" ]

EXPOSE 8000