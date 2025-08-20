# Используем официальный образ Node.js
FROM node:20-alpine

# Устанавливаем dockerize для ожидания готовности сервисов
RUN apk add --no-cache wget \
    && wget https://github.com/jwilder/dockerize/releases/download/v0.7.0/dockerize-alpine-linux-amd64-v0.7.0.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.7.0.tar.gz \
    && rm dockerize-alpine-linux-amd64-v0.7.0.tar.gz

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем TypeScript в JavaScript
RUN npm run build

# Event worker не открывает порты, только слушает Kafka
EXPOSE 3002

# Команда для запуска приложения с ожиданием Kafka и БД
CMD dockerize -wait tcp://kafka:9092 -wait tcp://db:5432 -timeout 60s node dist/main.js
