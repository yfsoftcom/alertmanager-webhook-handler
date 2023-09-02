# Base image
FROM node:18-alpine As build
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./
# Install app dependencies
RUN yarn
# Bundle app source
COPY . .

FROM node:18-alpine As production

USER node
WORKDIR /usr/src/app
RUN mkdir src
# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/index.js ./index.js
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json

# Start the server using the production build
ENTRYPOINT ["npm"]
CMD ["run", "start"]