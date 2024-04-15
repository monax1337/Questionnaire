#!/bin/bash

/opt/mssql/bin/sqlservr &
sleep 30
/cheto/config/configure-db.sh
tail -f /dev/null
# Start the script to create the DB and user