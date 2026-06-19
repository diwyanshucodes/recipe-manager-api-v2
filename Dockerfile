# ============================================
# Stage 1: BUILDER
# Purpose: install ALL dependencies (including devDependencies
# like typescript) and compile our TypeScript source into
# plain JavaScript (dist/). This stage is "thrown away" later —
# none of its bulk ends up in the final image.
# ============================================
FROM node:24-alpine AS builder

# Set working directory inside the container.
# All following instructions run relative to /app.
WORKDIR /app

# Copy only the dependency manifests first (not source code).
# This lets Docker cache the npm install step — as long as
# package.json/package-lock.json don't change, Docker reuses
# the cached node_modules instead of reinstalling on every build.
COPY package*.json ./

# Copy the Prisma schema before npm install, because our
# package.json has a "postinstall": "prisma generate" script —
# Prisma needs schema.prisma to exist at install time, or it fails.
COPY prisma ./prisma

# Install all dependencies, including devDependencies
# (typescript, ts-node, etc.) — needed to compile the project.
# This also triggers "prisma generate" via postinstall.
RUN npm install

# Now copy actual source code — done AFTER npm install so that
# editing source files doesn't invalidate the npm install cache.
COPY src ./src
COPY tsconfig.json ./

# Compile TypeScript -> JavaScript. Output goes to dist/,
# matching our tsconfig.json's outDir setting.
RUN npm run build


# ============================================
# Stage 2: PRODUCTION
# Purpose: a clean, minimal image that only contains what's
# needed to RUN the app — no TypeScript, no dev tools, no
# source code. Smaller image, smaller attack surface.
# ============================================
FROM node:24-alpine

WORKDIR /app

# Same manifests again — this is a fresh stage, nothing
# carries over automatically from Stage 1.
COPY package*.json ./

# Needed again here because Prisma Client is regenerated
# fresh in THIS stage (generated client binaries are tied
# to the environment they're generated in).
COPY prisma ./prisma

# Install ONLY production dependencies (--omit=dev skips
# typescript, jest, nodemon, etc. — not needed at runtime).
# "npm ci" (not "npm install") does a strict, reproducible
# install based exactly on package-lock.json.
RUN npm ci --omit=dev

# Copy ONLY the compiled output from Stage 1 — this is the
# key multi-stage trick: none of Stage 1's devDependencies,
# raw TypeScript source, or build tools make it into this image.
COPY --from=builder /app/dist ./dist

# Documentation only — does NOT actually publish the port.
# Real port publishing happens later via `docker run -p`.
EXPOSE 3000

# Command that runs when a CONTAINER starts (not during build).
# Written in exec form (JSON array) — the recommended style.
CMD ["node", "dist/index.js"]