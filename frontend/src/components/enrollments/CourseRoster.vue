<script setup>
import { computed, ref } from 'vue';
import SelectField from '@/components/base/SelectField.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import LoadingState from '@/components/base/LoadingState.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import DataTable from '@/components/base/DataTable.vue';
import { useCourseStore } from '@/stores/courses';
import { useEnrollmentStore } from '@/stores/enrollments';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();

const removingId = ref('');

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'phone', label: 'Phone' },
    { key: 'zip', label: 'ZIP' },
];

const courseOptions = computed(() =>
    courseStore.sortedCourses.map((c) => ({ value: c.courseId, label: `${c.name} (${c.courseId})` }))
);

const selectedCourse = computed(() =>
    courseStore.courses.find((c) => c.courseId === enrollmentStore.selectedCourseId)
);

// The select drives the store; choosing a course loads its roster immediately.
const selected = computed({
    get: () => enrollmentStore.selectedCourseId,
    set: (courseId) => enrollmentStore.fetchRoster(courseId),
});

const summary = computed(() => {
    const roster = enrollmentStore.selectedRoster;
    if (!roster || !selectedCourse.value) return '';
    const n = roster.length;
    return `${n} student${n === 1 ? '' : 's'} enrolled in ${selectedCourse.value.courseId} – ${selectedCourse.value.name}`;
});

async function unenroll(student) {
    const course = selectedCourse.value;
    const ok = await confirm.ask({
        title: 'Remove enrollment?',
        message: `Remove ${student.name} (ID ${student.studentId}) from ${course.courseId}? The student and course records are kept.`,
        confirmLabel: 'Remove',
    });
    if (!ok) return;

    removingId.value = student.studentId;
    try {
        const result = await enrollmentStore.unenroll(course.courseId, student.studentId);
        notifications.success(result.message);
    } catch (error) {
        notifications.error(error.message);
        enrollmentStore.fetchRoster(course.courseId);
    } finally {
        removingId.value = '';
    }
}
</script>

<template>
    <div class="stack">
        <div class="inline-form">
            <SelectField
                id="roster-course"
                v-model="selected"
                label="Course"
                placeholder="-- Select course --"
                :options="courseOptions"
                :disabled="!courseOptions.length"
            />
            <BaseButton
                :disabled="!enrollmentStore.selectedCourseId"
                :loading="enrollmentStore.rosterLoading"
                @click="enrollmentStore.fetchRoster(enrollmentStore.selectedCourseId)"
            >
                Refresh list
            </BaseButton>
        </div>

        <EmptyState v-if="!enrollmentStore.selectedCourseId" title="No course selected">
            Choose a course to see the students enrolled in it.
        </EmptyState>
        <LoadingState v-else-if="enrollmentStore.rosterLoading && !enrollmentStore.selectedRoster">
            Loading students…
        </LoadingState>
        <AlertMessage v-else-if="enrollmentStore.rosterError" type="error">
            {{ enrollmentStore.rosterError }}
        </AlertMessage>
        <template v-else-if="enrollmentStore.selectedRoster">
            <p class="results-summary" role="status">{{ summary }}</p>
            <EmptyState v-if="!enrollmentStore.selectedRoster.length" title="No students enrolled yet">
                Use the form to enroll a student in this course.
            </EmptyState>
            <DataTable
                v-else
                :columns="columns"
                :rows="enrollmentStore.selectedRoster"
                row-key="studentId"
                :caption="`Students enrolled in ${enrollmentStore.selectedCourseId}`"
            >
                <template #actions="{ row }">
                    <BaseButton
                        variant="ghost"
                        size="sm"
                        :loading="removingId === row.studentId"
                        :aria-label="`Remove ${row.name} from ${enrollmentStore.selectedCourseId}`"
                        @click="unenroll(row)"
                    >
                        Remove
                    </BaseButton>
                </template>
            </DataTable>
        </template>
    </div>
</template>
