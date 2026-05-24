<?php

use Illuminate\Support\Facades\Broadcast;

// Default user private channel
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// AI chat private channel (legacy, kept for backward compat)
Broadcast::channel('ai-chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Shared operations channel — accessible to all authenticated staff (owner & kasir)
Broadcast::channel('ops', function ($user) {
    return $user->hasAnyRole(['owner', 'kasir']);
});
