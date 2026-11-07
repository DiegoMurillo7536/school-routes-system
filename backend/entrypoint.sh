#!/bin/sh
set -e
alembic upgrade head
exec $API_COMMAND
