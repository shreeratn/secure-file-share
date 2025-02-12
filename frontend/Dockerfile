FROM node:20-alpine

WORKDIR /app

# Copy package files from the nested structure
COPY frontend/src/package*.json ./

RUN npm install

# Copy the frontend files from nested structure
COPY frontend/src/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
