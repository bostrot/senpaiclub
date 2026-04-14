#!/bin/sh
set -e

bundle config set path '/usr/local/bundle'
bundle install

if [ "$#" -eq 0 ]; then
  exec bundle exec jekyll serve --host 0.0.0.0 --port 4000 --livereload --force_polling
fi

exec "$@"
