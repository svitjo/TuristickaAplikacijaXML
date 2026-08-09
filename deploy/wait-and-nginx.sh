#!/bin/bash
set -e

echo "Waiting for gateway on 127.0.0.1:5000..."
for i in $(seq 1 90); do
  if (echo > /dev/tcp/127.0.0.1/5000) >/dev/null 2>&1; then
    echo "Gateway is up after ${i}s"
    break
  fi
  sleep 1
done

# Give auth/blog a moment after gateway binds
sleep 3
exec /usr/sbin/nginx -g "daemon off;"
