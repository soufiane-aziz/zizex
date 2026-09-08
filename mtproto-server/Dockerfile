FROM node:20-alpine

WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Install dependencies (only production)
RUN npm install --omit=dev

# Copy application files and session credentials
COPY telegram-mtproto.js ./
COPY telegram.config.json ./
COPY telegram-session.txt ./
COPY telegram-mapping.json ./

EXPOSE 5001

ENV PORT=5001
ENV MTPROTO_PORT=5001

CMD ["node", "telegram-mtproto.js"]
