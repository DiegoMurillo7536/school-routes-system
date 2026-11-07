#!/bin/sh
alembic upgrade head
exec $API_COMMAND
