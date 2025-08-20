# 🚀 Пример интеграции платёжки (DeCard)

Микросервисная платежная система с интеграцией DeCard API для payin/payout операций в валюте TRY.

## 🏗️ Архитектура

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                          USER FLOW                              │
    └─────────────────────────────────────────────────────────────────┘
              │ REST API                    │ HMAC-256
              ▼                             ▼
┌─────────────────────┐      ┌─────────────────────┐      ┌─────────────────────┐
│     Frontend        │      │    Backend API      │      │     DeCard API      │
│                     │◄────►│                     │─────►│                     │
│ • React UI          │ HTTP │ • Transactions      │ HTTPS│ • Payin/Payout      │
│ • Forms & Tables    │      │ • User Management   │      │ • TRY Currency      │
│ • Real-time Updates │      │ • DeCard Integration│      │ • Webhook Callbacks │
│                     │      │ • REST Endpoints    │      │                     │
│ Port: 3002          │      │ Port: 3000          │      │ External Service    │
└─────────────────────┘      └─────────────────────┘      └─────────────────────┘
                                       │                             │
                             Creates   │                             │ HTTP POST
                          Transactions │                             │ Webhooks
                                       ▼                             ▼
                             ┌─────────────────────┐      ┌─────────────────────┐
                             │     PostgreSQL      │      │   Webhook Worker    │
                             │                     │      │                     │
                             │ • Users & Balances  │      │ • IP Whitelist      │
                             │ • Transactions      │      │ • HMAC Validation   │
                             │ • SERIALIZABLE TX   │      │ • Event Publishing  │
                             │ • SELECT FOR UPDATE │      │                     │
                             │                     │      │ Port: 3001          │
                             │ Port: 5432          │      └─────────────────────┘
                             └─────────────────────┘                 │
                                       ▲                             │ Publishes
                                       │                             │ Events
                                       │                             ▼
                                       │                  ┌─────────────────────┐
                                       │                  │       Kafka         │
                                       │                  │                     │
                                       │                  │ • Message Broker    │
                                       │                  │ • Event Bus         │
                                       │                  │ • Topic: payment.*  │
                                       │                  │ • Reliable Delivery │
                                       │                  │                     │
                                       │                  │ Port: 9092          │
                                       │                  └─────────────────────┘
                                       │                             │
                                Updates │                             │ Consumes
                                Balance │                             │ Events
                                       │                             ▼
                                       │                  ┌─────────────────────┐
                                       └──────────────────│   Event Worker      │
                                                          │                     │
                                                          │ • Balance Updates   │
                                                          │ • Status Processing │
                                                          │ • ACID Transactions │
                                                          │ • Error Handling    │
                                                          │                     │
                                                          │ Microservice        │
                                                          └─────────────────────┘
```

**Детальный поток данных:**

### 🔄 **Payin Flow (Пополнение):**
1. **User** → **Frontend** (вводит сумму и метод оплаты)
2. **Frontend** → **Backend API** (POST /transactions с HMAC данными)
3. **Backend API** → **PostgreSQL** (создание транзакции со статусом PENDING)
4. **Backend API** → **DeCard API** (POST /rest/paymentgate/simple/ с HMAC-256)
5. **DeCard API** → **Backend API** (возвращает redirect_url)
6. **Backend API** → **Frontend** (redirect_url для оплаты)
7. **User** → **DeCard Payment Page** (завершает оплату)
8. **DeCard API** → **Webhook Worker** (HTTP POST уведомление)
9. **Webhook Worker** → **Kafka** (публикация события payment.webhook.decard)
10. **Event Worker** ← **Kafka** (получение и обработка события)
11. **Event Worker** → **PostgreSQL** (SERIALIZABLE обновление баланса и статуса)

### 💸 **Payout Flow (Вывод):**
1. **User** → **Frontend** (вводит сумму и реквизиты)
2. **Frontend** → **Backend API** (POST /payouts с валидацией баланса)
3. **Backend API** → **PostgreSQL** (создание payout транзакции)
4. **Backend API** → **DeCard API** (POST /rest/payoutgate/{method}/ с HMAC-256)
5. **DeCard API** → **Webhook Worker** (уведомление о статусе payout)
6. **Webhook Worker** → **Kafka** → **Event Worker** → **PostgreSQL** (обновление)

## ⚡ Быстрый запуск

### 1. Настройка конфигурации

```bash
# Разрешаем выполнение файла
chmod +x ./setup-env.sh

# Автоматическая настройка всех .env файлов
./setup-env.sh
```

🔐 **Структура конфигурации:**
- **`.env`** - общие настройки (БД, Kafka, URLs)
- **`backend/.env`** - API ключи DeCard (SHOP_KEY + SHOP_SECRET)
- **`webhook-worker/.env`** - SHOP_SECRET для валидации webhook'ов
- **`event-worker/.env`** - только БД и Kafka (без секретов)

⚠️ **Важно**: Файлы `.env` защищены `.gitignore`!

### 2. Запуск всей системы

```bash
# Запуск всех сервисов в Docker
docker-compose up --build
```

### 3. Тестирование

Откройте браузер и перейдите на:

**🖥️ http://localhost:3002** - Веб-интерфейс для тестирования

### Что можно протестировать:

1. **💳 Payin** - Пополнение баланса через DeCard
   - Выберите сумму (например: 100 TRY)
   - Выберите метод (card/papara/bank)
   - Нажмите "Пополнить" → получите redirect_url

2. **💸 Payout** - Вывод средств
   - Укажите сумму для вывода
   - Введите реквизиты (Papara номер или банковский счет)
   - Нажмите "Вывести" → двухэтапный процесс

3. **📊 Мониторинг** - Отслеживание операций
   - История всех транзакций
   - Текущий баланс пользователя
   - Статусы операций в реальном времени

### ✅ Основные требования
- **Payin/Payout для TRY** через DeCard API
- **HMAC-SHA256 генерация** для запросов и webhook'ов
- **Гибкая конфигурация** API-ключей

## 🔐 Безопасность

### HMAC-SHA256 валидация
```typescript
// Генерация подписи для запросов к DeCard
const hash = crypto
    .createHmac('sha256', SHOP_SECRET)
    .update(sortedPayloadString)
    .digest('hex');
```

### IP Whitelist для webhook'ов
```typescript
const decardAllowedIPs = [
    '13.49.167.214', '13.51.135.69', '13.49.98.133',
    '13.50.69.248', '18.158.233.247', '13.51.235.85'
];
```

## 🛡️ Безопасность конфигурации

### Файлы с секретными данными
- ✅ `.env` - содержит реальные API ключи (не в Git!)
- ✅ `env.example` - шаблон без секретов (в Git)
- ✅ `.gitignore` - защищает от случайного коммита .env

### Переменные окружения
```bash
# Обязательные секретные переменные:
DECARD_SHOP_KEY=your_real_shop_key       # 🔑 От DeCard
DECARD_SHOP_SECRET=your_real_shop_secret # 🔐 От DeCard

# Остальные настройки (можно оставить как есть):
DATABASE_URL=postgresql://user:password@db:5432/gatedb
KAFKA_BROKER=kafka:9092
```

## 🚀 Flow операций

### Payin (Пополнение)
1. Frontend → Backend: Создание транзакции
2. Backend → DeCard: API запрос с HMAC
3. DeCard → Frontend: Redirect на платежную форму
4. User → DeCard: Оплата
5. DeCard → Webhook Worker: Уведомление
6. Webhook → Event Worker: Через Kafka
7. Event Worker → Database: Обновление баланса

### Payout (Вывод)
1. Frontend → Backend: Создание заявки на вывод
2. Backend → DeCard: Двухэтапный процесс (init + confirm)
3. DeCard → Webhook Worker: Уведомление о статусе
4. Event Worker → Database: Списание с баланса

### Для тестирования:
1. Настройте конфигурацию: `./setup-env.sh`
2. Добавьте DeCard ключи в `backend/.env` и `webhook-worker/.env`
3. Запустите систему: `docker-compose up --build`
4. Откройте http://localhost:3002
5. Протестируйте payin/payout операции