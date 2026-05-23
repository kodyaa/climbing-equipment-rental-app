# Stage 1: Install Composer dependencies
FROM composer:2.8 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --no-autoloader \
    --prefer-dist

# Stage 2: Final runtime image (Debian-based for high network stability)
FROM dunglas/frankenphp
WORKDIR /var/web

# Install system dependencies and PHP extensions via preloaded helper
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libpq-dev \
    zip \
    unzip \
    && install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    gd \
    zip \
    bcmath \
    opcache \
    pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure Caddy/FrankenPHP directories for non-root certificate/config storage
RUN mkdir -p /data/caddy /config/caddy \
    && chown -R www-data:www-data /data /config

ENV XDG_DATA_HOME=/data
ENV XDG_CONFIG_HOME=/config

# Copy PHP configurations
COPY docker/common/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy application source (includes precompiled public/build assets)
COPY --chown=www-data:www-data . .

# Copy composer dependencies from builder stage
COPY --chown=www-data:www-data --from=composer-builder /app/vendor ./vendor

# Run composer autoloader dump and install Octane config
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer-builder /usr/bin/composer /usr/bin/composer
RUN composer dump-autoload --no-dev --classmap-authoritative \
    && php artisan octane:install --server=frankenphp --no-interaction \
    && rm /usr/bin/composer

# Configure entrypoint and script permissions
COPY --chown=www-data:www-data docker/production/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 8000 for Laravel Octane
EXPOSE 8000

# Run as non-privileged user
USER www-data

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
