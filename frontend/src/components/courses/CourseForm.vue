<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import FormField from '@/components/base/FormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import { useCourseStore } from '@/stores/courses';
import { useNotificationStore } from '@/stores/notifications';
import { hasErrors, normalizeCourseId, validateCourse } from '@/utils/validators';

const store = useCourseStore();
const notifications = useNotificationStore();

const FIELDS = ['courseId', 'name'];
const emptyForm = () => ({ courseId: '', name: '' });

const form = reactive(emptyForm());
const errors = ref({});
const formError = ref('');
const submitting = ref(false);
const attempted = ref(false);

watch(
    form,
    () => {
        formError.value = '';
        if (attempted.value) errors.value = validateCourse(form);
    },
    { deep: true }
);

async function focusFirstError() {
    await nextTick();
    const field = FIELDS.find((key) => errors.value[key]);
    if (field) document.getElementById(`course-${field}`)?.focus();
}

async function submit() {
    attempted.value = true;
    errors.value = validateCourse(form);
    // Catch known duplicates before calling the API (the server also enforces this).
    const id = normalizeCourseId(form.courseId);
    if (!errors.value.courseId && store.courses.some((c) => c.courseId === id)) {
        errors.value.courseId = `A course with ID ${id} already exists.`;
    }
    if (hasErrors(errors.value)) return focusFirstError();

    submitting.value = true;
    try {
        const course = await store.addCourse({
            courseId: normalizeCourseId(form.courseId),
            name: form.name.trim(),
        });
        notifications.success(`Added ${course.courseId} – ${course.name}.`);
        Object.assign(form, emptyForm());
        attempted.value = false;
        errors.value = {};
    } catch (error) {
        if (error.status === 409) {
            errors.value = { courseId: error.message };
            focusFirstError();
        } else if (error.details) {
            errors.value = { ...error.details };
            formError.value = error.message;
            focusFirstError();
        } else {
            formError.value = error.message;
        }
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <form class="form" novalidate @submit.prevent="submit">
        <AlertMessage v-if="formError" type="error">{{ formError }}</AlertMessage>

        <FormField
            id="course-courseId"
            v-model="form.courseId"
            label="Course ID"
            maxlength="20"
            placeholder="CIS 3339"
            hint="Stored in uppercase; must be unique"
            required
            :error="errors.courseId"
        />
        <FormField
            id="course-name"
            v-model="form.name"
            label="Course name"
            maxlength="150"
            placeholder="Enterprise Applications Development"
            required
            :error="errors.name"
        />

        <div class="form-actions">
            <BaseButton type="submit" variant="primary" :loading="submitting">
                {{ submitting ? 'Adding…' : 'Add course' }}
            </BaseButton>
        </div>
    </form>
</template>
