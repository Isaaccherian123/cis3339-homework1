<script setup>
import { computed } from 'vue';

const model = defineModel({ type: String, default: '' });

const props = defineProps({
    id: { type: String, required: true },
    label: { type: String, required: true },
    /** [{ value: '1001', label: 'John (1001)' }] */
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '-- Select --' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    required: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
});

const describedBy = computed(
    () =>
        [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`]
            .filter(Boolean)
            .join(' ') || undefined
);
</script>

<template>
    <div class="field" :class="{ 'field--invalid': error }">
        <label :for="id" class="field__label">
            {{ label }}<span v-if="required" class="field__required" aria-hidden="true"> *</span>
        </label>
        <select
            :id="id"
            v-model="model"
            class="field__control field__control--select"
            :name="id"
            :disabled="disabled"
            :aria-required="required || undefined"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="describedBy"
        >
            <option value="">{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <p v-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
        <p v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</p>
    </div>
</template>
