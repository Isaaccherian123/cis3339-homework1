<script setup>
defineProps({
    type: { type: String, default: 'button' },
    variant: {
        type: String,
        default: 'secondary',
        validator: (v) => ['primary', 'secondary', 'danger', 'ghost'].includes(v),
    },
    size: { type: String, default: 'md', validator: (v) => ['sm', 'md'].includes(v) },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});
</script>

<template>
    <button
        :type="type"
        class="btn"
        :class="[`btn--${variant}`, `btn--${size}`]"
        :disabled="disabled || loading"
        :aria-busy="loading || undefined"
    >
        <span v-if="loading" class="spinner spinner--inline" aria-hidden="true"></span>
        <slot />
    </button>
</template>
