###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development_build

# https://btholt.github.io/complete-intro-to-containers/build-a-nodejs-app
USER node

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Bundle app source
COPY --chown=node:node . .

# Install app dependencies
RUN npm ci

###################
# BUILD FOR PRODUCTION
###################

# Base image for production
FROM node:18-alpine As prod_build

USER node

# Create app directory
WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development_build /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=node:node . .

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

###################
# PRODUCTION
###################

# Base image for production
FROM node:18-alpine As production

ENV NODE_ENV production

# Copy the bundled code to the production image
COPY --chown=node:node --from=prod_build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=prod_build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]


###################
# DEVELOPMENT
###################

# Base image for production
FROM node:18-alpine As development

ENV NODE_ENV development
ENV HOSTNAME 8080-cs-590268403158-default.cs-europe-west4-fycr.cloudshell.dev

# Copy the bundled code to the production image
COPY --chown=node:node --from=prod_build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=prod_build /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]