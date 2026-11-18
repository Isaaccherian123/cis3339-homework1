<script setup>
defineProps({
    title: { type: String, required: true },
    headingId: { type: String, required: true },
    description: { type: String, default: '' },
});
</script>

<template>
    <section class="card" :aria-labelledby="headingId">
        <header class="card__header">
            <div>
                <h2 :id="headingId" class="card__title">{{ title }}</h2>
                <p v-if="description" class="card__description">{{ description }}</p>
            </div>
            <div v-if="$slots.actions" class="card__actions">
                <slot name="actions" />
            </div>
        </header>
        <div class="card__body">
            <slot />
        </div>
    </section>
</template>
