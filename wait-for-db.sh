#!/bin/sh
# Attendre que MySQL soit prêt avant de lancer Prisma + Netlify
echo "⏳ Waiting for MySQL to be ready..."
while ! nc -z db 3306; do
  sleep 2
done
echo "✅ MySQL is up!"
exec "$@"
