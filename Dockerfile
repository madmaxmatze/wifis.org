# SOURCE: https://www.tomray.dev/nestjs-docker-production

######################################
# LOCAL DEVELOPMENT
######################################

FROM node:18-alpine As basic

ARG AUTH_USER_ARG=default

#ENV AUTH_USER ${gcloud auth list --filter=status:ACTIVE --format="value(account)"}
ENV AUTH_USER=$AUTH_USER_ARG

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies
RUN npm ci --cache ~/.npm

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

#########################################################

# Base image for cloud shell dev
FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=basic /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=node:node . .

RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV development

USER node

#########################################################

# Base image for development
FROM node:18-alpine As development

ARG AUTH_USER_ARG=default
ENV AUTH_USER=$AUTH_USER_ARG

ENV NODE_ENV development
# ENV HOSTNAME 8080-cs-590268403158-default.cs-europe-west4-fycr.cloudshell.dev

# Copy the bundled code to the image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Start the server using the build
CMD [ "node", "dist/main.js" ]












# TODO: merge dev and prod parts, but for now each optimal by itself

######################################
# PRODUCTION
######################################

FROM node:18-alpine As basic_prod

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

#########################################################

# Base image for production
FROM node:18-alpine As build_prod

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=basic_prod /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN npm ci --only=production && npm cache clean --force

USER node

#########################################################

# Base image for production
FROM node:18-alpine As production

ENV NODE_ENV production

# Copy the bundled code to the production image
COPY --chown=node:node --from=build_prod /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build_prod /usr/src/app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/main.js" ]