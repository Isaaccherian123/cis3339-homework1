<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import FormField from '@/components/base/FormField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import { useStudentStore } from '@/stores/students';
import { useNotificationStore } from '@/stores/notifications';
import { hasErrors, validateStudent } from '@/utils/validators';

const emit = defineEmits(['added']);

const store = useStudentStore();
const notifications = useNotificationStore();

const FIELDS = ['name', 'studentId', 'phone', 'zip'];
const emptyForm = () => ({ name: '', studentId: '', phone: '', zip: '' });

const form = reactive(emptyForm());
const errors = ref({});
const formError = ref('');
const submitting = ref(false);
const attempted = ref(false);

// After the first submit attempt, re-validate as the user types.
watch(
    form,
    () => {
        formError.value = '';
        if (attempted.value) errors.value = validateStudent(form);
    },
    { deep: true }
);

async function focusFirstError() {
    await nextTick();
    const field = FIELDS.find((key) => errors.value[key]);
    if (field) document.getElementById(`student-${field}`)?.focus();
}

async function submit() {
    attempted.value = true;
    errors.value = validateStudent(form);
    // Catch known duplicates before calling the API (the server also enforces this).
    const id = form.studentId.trim();
    if (!errors.value.studentId && store.students.some((s) => s.studentId === id)) {
        errors.value.studentId = `A student with ID ${id} already exists.`;
    }
    if (hasErrors(errors.value)) return focusFirstError();

    submitting.value = true;
    try {
        const student = await store.addStudent({
            name: form.name.trim(),
            studentId: form.studentId.trim(),
            phone: form.phone.trim(),
            zip: form.zip.trim(),
        });
        notifications.success(`Added ${student.name} (ID ${student.studentId}).`);
        Object.assign(form, emptyForm());
        attempted.value = false;
        errors.value = {};
        emit('added', student);
    } catch (error) {
        if (error.status === 409) {
            errors.value = { studentId: error.message };
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
            id="student-name"
            v-model="form.name"
            label="Full name"
            autocomplete="off"
            maxlength="100"
            required
            :error="errors.name"
        />
        <div class="form-grid">
            <FormField
                id="student-studentId"
                v-model="form.studentId"
                label="Student ID"
                inputmode="numeric"
                maxlength="10"
                hint="Digits only, must be unique"
                required
                :error="errors.studentId"
            />
            <FormField
                id="student-phone"
                v-model="form.phone"
                label="Phone"
                type="tel"
                maxlength="20"
                hint="e.g. 555-123-4567"
                required
                :error="errors.phone"
            />
            <FormField
                id="student-zip"
                v-model="form.zip"
                label="ZIP code"
                inputmode="numeric"
                maxlength="10"
                hint="e.g. 77004"
                required
                :error="errors.zip"
            />
        </div>

        <div class="form-actions">
            <BaseButton type="submit" variant="primary" :loading="submitting">
                {{ submitting ? 'Adding…' : 'Add student' }}
            </BaseButton>
        </div>
    </form>
</template>
