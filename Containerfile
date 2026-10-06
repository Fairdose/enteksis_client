ARG NODE_VERSION=24.12.0-alpine
ARG NGINX_VERSION=alpine3.22

FROM docker.io/library/node:${NODE_VERSION} AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.3.4 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

FROM docker.io/nginxinc/nginx-unprivileged:${NGINX_VERSION} AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html

USER nginx
EXPOSE 8080
ENTRYPOINT ["nginx", "-g", "daemon off;"]
