<script setup>
import { computed, ref, watch } from 'vue';
import SelectField from '@/components/base/SelectField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import { useStudentStore } from '@/stores/students';
import { useCourseStore } from '@/stores/courses';
import { useEnrollmentStore } from '@/stores/enrollments';
import { useNotificationStore } from '@/stores/notifications';

const emit = defineEmits(['enrolled']);

const studentStore = useStudentStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const notifications = useNotificationStore();

const studentId = ref('');
const courseId = ref('');
const errors = ref({});
const formError = ref('');
const submitting = ref(false);

// Options come from the backend data held in the Pinia stores.
const studentOptions = computed(() =>
    studentStore.sortedStudents.map((s) => ({ value: s.studentId, label: `${s.name} (${s.studentId})` }))
);
const courseOptions = computed(() =>
    courseStore.sortedCourses.map((c) => ({ value: c.courseId, label: `${c.name} (${c.courseId})` }))
);

// Warn before submitting if we already know this enrollment exists.
const alreadyEnrolled = computed(() => {
    const roster = enrollmentStore.rosters[courseId.value];
    return Boolean(studentId.value && roster?.some((s) => s.studentId === studentId.value));
});

watch([studentId, courseId], () => {
    errors.value = {};
    formError.value = '';
});

// Clear selections that no longer exist (e.g. deleted elsewhere).
watch(studentOptions, (options) => {
    if (studentId.value && !options.some((o) => o.value === studentId.value)) studentId.value = '';
});
watch(courseOptions, (options) => {
    if (courseId.value && !options.some((o) => o.value === courseId.value)) courseId.value = '';
});

async function submit() {
    const nextErrors = {};
    if (!studentId.value) nextErrors.studentId = 'Select a student.';
    if (!courseId.value) nextErrors.courseId = 'Select a course.';
    errors.value = nextErrors;
    if (Object.keys(nextErrors).length) {
        document.getElementById(nextErrors.studentId ? 'enroll-student' : 'enroll-course')?.focus();
        return;
    }
    if (alreadyEnrolled.value) {
        formError.value = 'This student is already enrolled in the selected course.';
        return;
    }

    submitting.value = true;
    try {
        const result = await enrollmentStore.enroll(studentId.value, courseId.value);
        notifications.success(result.message);
        emit('enrolled', courseId.value);
        studentId.value = ''; // keep the course selected for enrolling more students
    } catch (error) {
        formError.value = error.message;
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <form class="form" novalidate @submit.prevent="submit">
        <AlertMessage v-if="formError" type="error">{{ formError }}</AlertMessage>

        <SelectField
            id="enroll-student"
            v-model="studentId"
            label="Student"
            placeholder="-- Select student --"
            :options="studentOptions"
            required
            :error="errors.studentId"
        />
        <SelectField
            id="enroll-course"
            v-model="courseId"
            label="Course"
            placeholder="-- Select course --"
            :options="courseOptions"
            required
            :error="errors.courseId"
        />

        <AlertMessage v-if="alreadyEnrolled && !formError" type="info">
            This student is already enrolled in the selected course.
        </AlertMessage>


        <div class="form-actions">
            <BaseButton type="submit" variant="primary" :loading="submitting">
                {{ submitting ? 'Enrolling…' : 'Enroll student' }}
            </BaseButton>
        </div>
    </form>
</template>
