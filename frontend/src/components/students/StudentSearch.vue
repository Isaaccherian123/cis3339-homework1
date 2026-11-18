<script setup>
import { ref, watch } from 'vue';
import BaseButton from '@/components/base/BaseButton.vue';

const query = defineModel({ type: String, default: '' });

defineProps({
    loading: { type: Boolean, default: false },
});

const emit = defineEmits(['search', 'show-all']);
const error = ref('');

watch(query, () => {
    error.value = '';
});

function submit() {
    if (!query.value.trim()) {
        error.value = 'Enter a name or student ID, or choose “Show all”.';
        document.getElementById('student-search')?.focus();
        return;
    }
    emit('search', query.value.trim());
}
</script>

<template>
    <form class="search-form" role="search" novalidate @submit.prevent="submit">
        <div class="field" :class="{ 'field--invalid': error }">
            <label for="student-search" class="field__label">Name or student ID</label>
            <div class="search-form__row">
                <input
                    id="student-search"
                    v-model="query"
                    class="field__control"
                    type="search"
                    autocomplete="off"
                    placeholder="e.g. John or 1001"
                    :aria-invalid="error ? 'true' : undefined"
                    :aria-describedby="error ? 'student-search-error' : 'student-search-hint'"
                />
                <BaseButton type="submit" variant="primary" :loading="loading">Search</BaseButton>
                <BaseButton :disabled="loading" @click="emit('show-all')">Show all</BaseButton>
            </div>
            <p v-if="error" id="student-search-error" class="field__error">{{ error }}</p>
            <p v-else id="student-search-hint" class="field__hint">
                Matches any part of a name (not case-sensitive) or an exact student ID.
            </p>
        </div>
    </form>
</template>
