<script setup>
import { useNotificationStore } from '@/stores/notifications';

const notifications = useNotificationStore();
</script>

<template>
    <div class="toasts" aria-live="polite" aria-relevant="additions">
        <TransitionGroup name="toast" tag="ul" class="toasts__list">
            <li
                v-for="toast in notifications.toasts"
                :key="toast.id"
                class="toast"
                :class="`toast--${toast.type}`"
            >
                <span class="toast__message">{{ toast.message }}</span>
                <button
                    type="button"
                    class="toast__close"
                    aria-label="Dismiss notification"
                    @click="notifications.dismiss(toast.id)"
                >
                    ×
                </button>
            </li>
        </TransitionGroup>
    </div>
</template>
