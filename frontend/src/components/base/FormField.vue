<script setup>
import { computed } from 'vue';

const model = defineModel({ type: String, default: '' });

const props = defineProps({
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: 'text' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    autocomplete: { type: String, default: 'off' },
    inputmode: { type: String, default: undefined },
    maxlength: { type: [Number, String], default: undefined },
    required: { type: Boolean, default: false },
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
        <input
            :id="id"
            v-model="model"
            class="field__control"
            :type="type"
            :name="id"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :inputmode="inputmode"
            :maxlength="maxlength"
            :aria-required="required || undefined"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="describedBy"
        />
        <p v-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</p>
        <p v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</p>
    </div>
</template>
