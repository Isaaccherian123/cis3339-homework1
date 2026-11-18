<script setup>
import { computed } from 'vue';

const props = defineProps({
    type: { type: String, default: 'info', validator: (v) => ['info', 'success', 'error'].includes(v) },
});

// Errors interrupt screen readers; other messages are announced politely.
const role = computed(() => (props.type === 'error' ? 'alert' : 'status'));
const icon = computed(() => ({ info: 'i', success: '✓', error: '!' })[props.type]);
</script>

<template>
    <div class="alert" :class="`alert--${type}`" :role="role">
        <span class="alert__icon" aria-hidden="true">{{ icon }}</span>
        <div class="alert__content"><slot /></div>
    </div>
</template>
