FROM node:alpine

# App setup

ADD docker-bundle.tgz /

ADD package.json /tmp/package.json
RUN cd /tmp && yarn --prod
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app

# Configuration
ENV PORT 80
EXPOSE 80
VOLUME /RedditRaven

CMD yarn start -p ${PORT}
