<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Laravel') }}</title>
        <script>
            (function () {
                const theme = localStorage.getItem('vite-ui-theme') || 'system';
                const root = document.documentElement;
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            })();
        </script>
        @viteReactRefresh
        @vite(['resources/js/app.tsx', 'resources/css/app.css'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
