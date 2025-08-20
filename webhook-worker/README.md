# Webhook Worker Service

Отдельный сервис для приема и валидации вебхуков от платежного провайдера DeCard.

## Архитектура

```
DeCard → Webhook Worker → Kafka → Event Processing Worker → Database
```

## Функциональность

- **Прием вебхуков** от DeCard
- **Валидация IP-адресов** DeCard
- **Проверка подписей** для безопасности
- **Отправка событий в Kafka** для асинхронной обработки

## Эндпоинты

- `POST /webhook/decard` - Вебхуки от DeCard

## Безопасность

### DeCard
- Проверка IP-адресов из белого списка
- Валидация HMAC-SHA256 подписи
- Проверка в production режиме

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
# Kafka Configuration
KAFKA_BROKER=kafka:9092

# DeCard Configuration
DECARD_API_URL=https://decard.me
DECARD_SHOP_KEY=your_shop_key
DECARD_SHOP_SECRET=your_shop_secret

# Application Settings
NODE_ENV=development
```

## Запуск

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm run build
npm start
```

### Docker
```bash
docker build -t webhook-worker .
docker run -p 3001:3001 webhook-worker
```

## Настройка в панели провайдера

### DeCard
- Webhook URL: `https://yourdomain.com:3001/webhook/decard`

## Масштабирование

Можно запускать несколько экземпляров за load balancer'ом:

```yaml
# docker-compose.prod.yml
webhook-worker:
  deploy:
    replicas: 3
  environment:
    NODE_ENV: production
```
