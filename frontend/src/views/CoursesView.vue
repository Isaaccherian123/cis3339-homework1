<script setup>
import { onMounted, ref } from 'vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import StatBadge from '@/components/layout/StatBadge.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import LoadingState from '@/components/base/LoadingState.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import DataTable from '@/components/base/DataTable.vue';
import CourseForm from '@/components/courses/CourseForm.vue';
import { useCourseStore } from '@/stores/courses';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const store = useCourseStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();

const deletingId = ref('');

const columns = [
    { key: 'courseId', label: 'Course ID' },
    { key: 'name', label: 'Course name' },
    { key: 'enrollmentCount', label: 'Enrolled' },
];

onMounted(() => {
    store.fetchCourses();
});

async function remove(course) {
    const count = course.enrollmentCount ?? 0;
    const ok = await confirm.ask({
        title: 'Delete course?',
        message:
            `Delete ${course.courseId} – ${course.name}?` +
            (count
                ? ` ${count} enrollment${count === 1 ? '' : 's'} in this course will also be removed.`
                : '') +
            ' This cannot be undone.',
        confirmLabel: 'Delete course',
    });
    if (!ok) return;

    deletingId.value = course.courseId;
    try {
        const result = await store.deleteCourse(course.courseId);
        notifications.success(result.message);
    } catch (error) {
        notifications.error(error.message);
        if (error.status === 404) store.fetchCourses();
    } finally {
        deletingId.value = '';
    }
}
</script>

<template>
    <PageHeader title="Courses" description="Create courses and manage the course catalog.">
        <StatBadge label="Courses" :value="store.loadError ? null : store.courseCount" />
        <StatBadge label="Enrollments" :value="store.loadError ? null : store.totalEnrollments" />
    </PageHeader>

    <div class="layout-split">
        <BaseCard title="Add a course" heading-id="add-course-heading" description="All fields are required.">
            <CourseForm />
        </BaseCard>

        <BaseCard title="All courses" heading-id="course-list-heading">
            <template #actions>
                <BaseButton variant="ghost" size="sm" :loading="store.loading" @click="store.fetchCourses">
                    Refresh
                </BaseButton>
            </template>

            <LoadingState v-if="store.loading && !store.courses.length">Loading courses…</LoadingState>
            <AlertMessage v-else-if="store.loadError" type="error">
                Could not load courses: {{ store.loadError }}
            </AlertMessage>
            <EmptyState v-else-if="!store.courses.length" title="No courses yet">
                Add your first course with the form.
            </EmptyState>
            <DataTable v-else :columns="columns" :rows="store.sortedCourses" row-key="courseId" caption="All courses">
                <template #cell-enrollmentCount="{ row }">
                    <span class="pill">{{ row.enrollmentCount }}</span>
                </template>
                <template #actions="{ row }">
                    <BaseButton
                        variant="danger"
                        size="sm"
                        :loading="deletingId === row.courseId"
                        :aria-label="`Delete course ${row.courseId}`"
                        @click="remove(row)"
                    >
                        Delete
                    </BaseButton>
                </template>
            </DataTable>
        </BaseCard>
    </div>
</template>
