#!/bin/bash
set -e

export MongoDB__ConnectionString="${MongoDB__ConnectionString:-${MONGODB_URI}}"
if [ -z "$MongoDB__ConnectionString" ]; then
  echo "ERROR: MongoDB__ConnectionString or MONGODB_URI must be set"
  exit 1
fi

# Render injects PORT; default to 80 for local Docker
export PORT="${PORT:-80}"
sed -i "s/listen .*;/listen ${PORT};/" /etc/nginx/conf.d/app.conf

echo "Starting Touris on PORT=${PORT}"
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
