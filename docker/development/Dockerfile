FROM dunglas/frankenphp
WORKDIR /var/web

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    gd \
    zip \
    bcmath \
    opcache \
    pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer globally for development tasks inside container
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configure Caddy/FrankenPHP directories for non-root certificate/config storage
RUN mkdir -p /data/caddy /config/caddy \
    && chown -R www-data:www-data /data /config

ENV XDG_DATA_HOME=/data
ENV XDG_CONFIG_HOME=/config

# Copy PHP configurations
COPY docker/common/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copy entrypoint script
COPY docker/development/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port 8000 for Laravel Octane
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
