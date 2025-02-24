# syntax = docker/dockerfile:1


# Build
# This is a separate stage to avoid copying the source code into the final image
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app
COPY --link frontend ./frontend
COPY --link src ./src
COPY --link package-lock.json ./package-lock.json
COPY --link package.json ./package.json
COPY --link tsconfig.json ./tsconfig.json

RUN npm ci
RUN cd frontend && npm ci --production=false && npm run build

# Run
# This is the final image that will be used to run the application
FROM nginx
COPY --from=build /app/frontend/dist/ /usr/share/nginx/html/
