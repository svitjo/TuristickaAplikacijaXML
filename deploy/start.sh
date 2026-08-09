#!/bin/bash
set -e
export MongoDB__ConnectionString="${MongoDB__ConnectionString:-${MONGODB_URI}}"
if [ -z "$MongoDB__ConnectionString" ]; then
  echo "ERROR: MongoDB__ConnectionString or MONGODB_URI must be set"
  exit 1
fi
export MongoDB__ConnectionString
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
