#!/bin/bash

# 🔧 Скрипт настройки окружения для Gate Payment System

echo "🚀 Настройка конфигурации Gate Payment System..."

# Создаём общий .env
if [ ! -f .env ]; then
    echo "📋 Создаю общий .env файл для Docker Compose..."
    cp env.example .env
    echo "✅ .env создан (содержит POSTGRES_USER, POSTGRES_PASSWORD, etc.)"
else
    echo "⚠️  .env уже существует"
fi

# Создаём директории если их нет
mkdir -p backend webhook-worker event-worker

# Backend .env
if [ ! -f backend/.env ]; then
    echo "🔧 Создаю backend/.env..."
    cp backend-env.example backend/.env
    echo "✅ backend/.env создан"
else
    echo "⚠️  backend/.env уже существует"
fi

# Webhook Worker .env
if [ ! -f webhook-worker/.env ]; then
    echo "🔗 Создаю webhook-worker/.env..."
    cp webhook-worker-env.example webhook-worker/.env
    echo "✅ webhook-worker/.env создан"
else
    echo "⚠️  webhook-worker/.env уже существует"
fi

# Event Worker .env
if [ ! -f event-worker/.env ]; then
    echo "⚡ Создаю event-worker/.env..."
    cp event-worker-env.example event-worker/.env
    echo "✅ event-worker/.env создан"
else
    echo "⚠️  event-worker/.env уже существует"
fi

echo ""
echo "🎯 Конфигурация готова!"
echo ""
echo "🔐 КРИТИЧЕСКИ ВАЖНО: Добавьте ваши DeCard ключи в ДВА файла:"
echo ""
echo "📍 1. backend/.env (для API запросов):"
echo "   DECARD_SHOP_KEY=your_actual_shop_key"
echo "   DECARD_SHOP_SECRET=your_actual_shop_secret"
echo ""
echo "📍 2. webhook-worker/.env (для валидации webhook'ов):"
echo "   DECARD_SHOP_SECRET=your_actual_shop_secret"
echo ""
echo "⚠️  Оба файла должны содержать ОДИНАКОВЫЙ DECARD_SHOP_SECRET!"
echo ""
echo "🚀 Затем запустите: docker-compose up --build"
