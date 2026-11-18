<script setup>
defineProps({
    label: { type: String, required: true },
    value: { type: [Number, String], default: null },
});
</script>

<template>
    <div class="stat">
        <span class="stat__value">{{ value ?? '–' }}</span>
        <span class="stat__label">{{ label }}</span>
    </div>
</template>
