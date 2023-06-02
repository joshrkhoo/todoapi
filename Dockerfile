FROM node:18
WORKDIR /app
COPY package*.json ./
COPY . . 
ENV PORT=8080
EXPOSE 8080
CMD ["npm", "run", "dev"]