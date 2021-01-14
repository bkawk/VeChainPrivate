FROM node:14
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --ignore-scripts --frozen-lockfile --non-interactive
COPY . .
RUN yarn tsc
CMD ["node", "./dist/index.js"]