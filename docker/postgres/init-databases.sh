#!/bin/bash
set -e

echo "Creating microservices databases..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE inventory_db;
    CREATE DATABASE order_db;
    CREATE DATABASE payment_db;
    CREATE DATABASE notification_db;
    GRANT ALL PRIVILEGES ON DATABASE inventory_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE order_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE payment_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE notification_db TO $POSTGRES_USER;
EOSQL
echo "Microservices databases created successfully!"
