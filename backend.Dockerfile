# syntax = docker/dockerfile:1

# Base Image
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-slim AS base

ARG PORT=4000

ENV NODE_ENV=production
ENV EXPRESS_PORT=${PORT}

WORKDIR /app

# Build
# This is a separate stage to avoid copying the source code into the final image
FROM base AS build

COPY --link . .

# add dev dependencies
RUN npm ci --production=false
RUN cd backend && npm ci --production=false && npm run build

# Run
# This is the final image that will be used to run the application
FROM base

COPY --from=build /app/backend/build /app/backend/build
COPY --from=build /app/backend/node_modules /app/backend/node_modules
COPY --from=build /app/node_modules /app/node_modules

EXPOSE ${PORT}
CMD [ "node", "./backend/build/backend/index.js" ]
