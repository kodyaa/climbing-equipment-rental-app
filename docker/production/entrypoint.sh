#!/bin/bash
set -e

# Wait for database connection
echo "Checking database connection..."
until php -r "
    \$driver = getenv('DB_CONNECTION') ?: 'mysql';
    \$host   = getenv('DB_HOST') ?: '127.0.0.1';
    \$port   = getenv('DB_PORT') ?: (\$driver === 'pgsql' ? '5432' : '3306');
    \$db     = getenv('DB_DATABASE') ?: 'laravel';
    \$user   = getenv('DB_USERNAME') ?: 'root';
    \$pass   = getenv('DB_PASSWORD') ?: '';
    try {
        \$dsn = \"\$driver:host=\$host;port=\$port;dbname=\$db\";
        if (\$driver === 'sqlite') {
            \$dsn = \"sqlite:\$db\";
        }
        new PDO(\$dsn, \$user, \$pass);
        exit(0);
    } catch (PDOException \$e) {
        exit(1);
    }
" 2>/dev/null; do
    echo "Database is not ready yet. Waiting 2 seconds..."
    sleep 2
done
echo "Database is ready!"

# Run database migrations
echo "Running migrations..."
php artisan migrate --force

# Seed database if it is empty (no users found)
echo "Checking if database needs seeding..."
USER_COUNT=$(php -r "
    \$driver = getenv('DB_CONNECTION') ?: 'mysql';
    \$host   = getenv('DB_HOST') ?: '127.0.0.1';
    \$port   = getenv('DB_PORT') ?: (\$driver === 'pgsql' ? '5432' : '3306');
    \$db     = getenv('DB_DATABASE') ?: 'laravel';
    \$user   = getenv('DB_USERNAME') ?: 'root';
    \$pass   = getenv('DB_PASSWORD') ?: '';
    try {
        \$dsn = \"\$driver:host=\$host;port=\$port;dbname=\$db\";
        if (\$driver === 'sqlite') {
            \$dsn = \"sqlite:\$db\";
        }
        \$pdo = new PDO(\$dsn, \$user, \$pass);
        \$stmt = \$pdo->query('SELECT COUNT(*) FROM users');
        echo \$stmt ? \$stmt->fetchColumn() : 0;
    } catch (Exception \$e) {
        echo 0;
    }
")

if [ "$USER_COUNT" -eq 0 ]; then
    echo "No users found in database. Seeding data..."
    php artisan db:seed --force
else
    echo "Database already has records. Skipping seeder."
fi

# Ensure storage directories exist
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

# Link storage
if [ ! -d "public/storage" ]; then
    echo "Creating public storage link..."
    php artisan storage:link
fi

# Cache config, routes, and views for production optimization
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start Laravel Octane with FrankenPHP
echo "Starting Laravel Octane with FrankenPHP..."
exec php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000
