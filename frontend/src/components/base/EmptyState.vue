<script setup>
defineProps({
    title: { type: String, required: true },
});
</script>

<template>
    <div class="empty-state">
        <p class="empty-state__title">{{ title }}</p>
        <p v-if="$slots.default" class="empty-state__text"><slot /></p>
    </div>
</template>
