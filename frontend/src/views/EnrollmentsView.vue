<script setup>
import { computed, onMounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import PageHeader from '@/components/layout/PageHeader.vue';
import StatBadge from '@/components/layout/StatBadge.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import LoadingState from '@/components/base/LoadingState.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import EnrollmentForm from '@/components/enrollments/EnrollmentForm.vue';
import CourseRoster from '@/components/enrollments/CourseRoster.vue';
import { useStudentStore } from '@/stores/students';
import { useCourseStore } from '@/stores/courses';
import { useEnrollmentStore } from '@/stores/enrollments';

const studentStore = useStudentStore();
const courseStore = useCourseStore();
const enrollmentStore = useEnrollmentStore();

const loading = computed(
    () =>
        (studentStore.loading && !studentStore.students.length) ||
        (courseStore.loading && !courseStore.courses.length)
);
const loadError = computed(() => studentStore.loadError || courseStore.loadError);
const canEnroll = computed(() => studentStore.studentCount > 0 && courseStore.courseCount > 0);

const route = useRoute();
const router = useRouter();

onMounted(async () => {
    await Promise.all([studentStore.fetchStudents(), courseStore.fetchCourses()]);

    // ?course=CIS%203339 in the URL wins, so refreshing or sharing the page keeps the roster open.
    const fromUrl = typeof route.query.course === 'string' ? route.query.course : '';
    const courseId = fromUrl || enrollmentStore.selectedCourseId;
    if (!courseId) return;

    if (courseStore.courses.some((c) => c.courseId === courseId)) {
        enrollmentStore.fetchRoster(courseId);
    } else {
        enrollmentStore.removeRoster(courseId);
        router.replace({ query: {} });
    }
});

// Keep the URL in sync with the selected roster course.
watch(
    () => enrollmentStore.selectedCourseId,
    (courseId) => {
        if ((route.query.course ?? '') !== courseId) {
            router.replace({ query: courseId ? { course: courseId } : {} });
        }
    }
);

// Show the roster for the course a student was just enrolled in.
function onEnrolled(courseId) {
    if (enrollmentStore.selectedCourseId !== courseId || !enrollmentStore.selectedRoster) {
        enrollmentStore.fetchRoster(courseId);
    }
}
</script>

<template>
    <PageHeader title="Enrollments" description="Enroll students in courses and view each course's roster.">
        <StatBadge label="Total enrollments" :value="courseStore.loadError ? null : courseStore.totalEnrollments" />
    </PageHeader>

    <AlertMessage v-if="loadError" type="error" class="page-alert">
        Could not load data: {{ loadError }}
    </AlertMessage>

    <div class="layout-split">
        <BaseCard title="Enroll a student" heading-id="enroll-heading">
            <LoadingState v-if="loading">Loading students and courses…</LoadingState>
            <EmptyState v-else-if="!canEnroll && !loadError" title="Nothing to enroll yet">
                You need at least one
                <RouterLink v-if="!studentStore.studentCount" to="/students">student</RouterLink>
                <span v-else>student</span>
                and one
                <RouterLink v-if="!courseStore.courseCount" to="/courses">course</RouterLink>
                <span v-else>course</span>
                before creating an enrollment.
            </EmptyState>
            <EnrollmentForm v-else-if="canEnroll" @enrolled="onEnrolled" />
        </BaseCard>

        <BaseCard title="Students in a course" heading-id="roster-heading">
            <LoadingState v-if="courseStore.loading && !courseStore.courses.length">Loading courses…</LoadingState>
            <EmptyState v-else-if="!courseStore.courses.length && !courseStore.loadError" title="No courses yet">
                <RouterLink to="/courses">Add a course</RouterLink> to see its roster here.
            </EmptyState>
            <CourseRoster v-else-if="courseStore.courses.length" />
        </BaseCard>
    </div>
</template>
