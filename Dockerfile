# ==========================================
# Stage 1 — Dependencies
# ==========================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


# ==========================================
# Stage 2 — Build
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_Backend_Url
ARG NEXT_PUBLIC_Images_Url
ARG NEXT_PUBLIC_Environment
ARG NEXT_PUBLIC_Socket_Url
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_DESCRIPTION
ARG NEXT_PUBLIC_FACEBOOK_PAGE
ARG NEXT_PUBLIC_TWITTER_HANDLE
ARG NEXT_PUBLIC_INSTAGRAM_PAGE

ENV NEXT_PUBLIC_Backend_Url=$NEXT_PUBLIC_Backend_Url
ENV NEXT_PUBLIC_Images_Url=$NEXT_PUBLIC_Images_Url
ENV NEXT_PUBLIC_Environment=$NEXT_PUBLIC_Environment
ENV NEXT_PUBLIC_Socket_Url=$NEXT_PUBLIC_Socket_Url
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_DESCRIPTION=$NEXT_PUBLIC_SITE_DESCRIPTION
ENV NEXT_PUBLIC_FACEBOOK_PAGE=$NEXT_PUBLIC_FACEBOOK_PAGE
ENV NEXT_PUBLIC_TWITTER_HANDLE=$NEXT_PUBLIC_TWITTER_HANDLE
ENV NEXT_PUBLIC_INSTAGRAM_PAGE=$NEXT_PUBLIC_INSTAGRAM_PAGE

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ==========================================
# Stage 3 — Production
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
