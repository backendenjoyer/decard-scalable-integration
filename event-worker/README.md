# Event Processing Worker

Сервис для обработки событий из Kafka и обновления базы данных с правильными уровнями изоляции транзакций.

## Архитектура

```
Webhook Worker → Kafka → Event Processing Worker → Database (SERIALIZABLE)
```

## Функциональность

- **Слушает события из Kafka** топика `payment.webhook.decard`
- **Обновляет статусы транзакций** в базе данных
- **Атомарно обновляет балансы пользователей** с уровнем изоляции SERIALIZABLE
- **Предотвращает race conditions** с помощью SELECT ... FOR UPDATE
- **Обрабатывает ошибки** с автоматическим rollback транзакций

## Уровни изоляции транзакций

### SERIALIZABLE
- Самый строгий уровень изоляции
- Предотвращает все аномалии (dirty read, non-repeatable read, phantom read)
- Гарантирует консистентность данных при параллельных операциях

### SELECT ... FOR UPDATE
- Блокирует строку пользователя для обновления
- Предотвращает одновременное чтение/запись баланса
- Обеспечивает атомарность операций

## Обработка событий

### DeCard Webhook
```typescript
// Событие из Kafka
{
  provider: 'decard',
  transactionId: 'uuid',
  status: 'success',
  amount: 100,
  currency: 'TRY',
  type: 'payment'
}
```

## Безопасность

- **Проверка достаточности средств** перед payout
- **Автоматический rollback** при ошибках
- **Логирование всех операций** для аудита
- **Обработка дублирующихся событий** (idempotency)

## Переменные окружения

```env
DATABASE_URL=postgresql://user:password@db:5432/gatedb
KAFKA_BROKER=kafka:9092
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
docker build -t event-worker .
docker run event-worker
```

## Масштабирование

Можно запускать несколько экземпляров для обработки событий:

```yaml
# docker-compose.prod.yml
event-worker:
  deploy:
    replicas: 3  # Несколько воркеров
  environment:
    NODE_ENV: production
```

Kafka автоматически распределит события между воркерами в рамках одной consumer group.

## Мониторинг

- Логи всех операций с балансом
- Ошибки обработки событий
- Время выполнения транзакций
- Статистика по провайдеру DeCard
