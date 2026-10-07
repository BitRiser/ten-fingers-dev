#!/bin/sh
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  python3 start.py "$@"
else
  echo 'Install Python 3 from python.org, then run this file again.'
fi
printf '\nPress Enter to close...'
read -r answer
