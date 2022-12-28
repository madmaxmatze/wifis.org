# https://www.tomray.dev/nestjs-docker-production

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18-alpine As development_build

# CMD [ "npm", "run", "test" ]

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


###################
# BUILD FOR PRODUCTION
###################

# Base image for production
FROM node:18-alpine As prod_build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development_build /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=node:node . .

RUN npm run build


RUN npm ci --only=production && npm cache clean --force

USER node


###################
# PRODUCTION
###################

# Base image for production
FROM node:18-alpine As production

# Copy the bundled code to the production image
COPY --chown=node:node --from=prod_build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=prod_build /usr/src/app/dist ./dist


# Start the server using the production build
CMD [ "node", "dist/main.js" ]










###################
# BUILD FOR DEVELOPMENT
###################

# Base image for production
FROM node:18-alpine As development_build1

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development_build /usr/src/app/node_modules ./node_modules

# Bundle app source
COPY --chown=node:node . .

RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV development

USER node






###################
# DEVELOPMENT
###################

# Base image for production
FROM node:18-alpine As development

ARG AUTH_USER_ARG=default
ENV AUTH_USER=$AUTH_USER_ARG

ENV NODE_ENV development
# ENV HOSTNAME 8080-cs-590268403158-default.cs-europe-west4-fycr.cloudshell.dev

# Copy the bundled code to the production image
COPY --chown=node:node --from=development_build1 /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development_build1 /usr/src/app/dist ./dist


# Start the server using the production build
CMD [ "node", "dist/main.js" ]