import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { coursesApi, enrollmentsApi } from '@/services/api';
import { useCourseStore } from './courses';

export const useEnrollmentStore = defineStore('enrollments', () => {
    // Course currently shown in the roster panel, and cached rosters by course ID.
    const selectedCourseId = ref('');
    const rosters = ref({});
    const rosterLoading = ref(false);
    const rosterError = ref('');

    const selectedRoster = computed(() => rosters.value[selectedCourseId.value] ?? null);

    async function fetchRoster(courseId) {
        selectedCourseId.value = courseId;
        rosterError.value = '';
        if (!courseId) return;

        rosterLoading.value = true;
        try {
            const { students } = await coursesApi.roster(courseId);
            rosters.value[courseId] = students;
        } catch (error) {
            rosterError.value = error.message;
            delete rosters.value[courseId];
        } finally {
            rosterLoading.value = false;
        }
    }

    async function enroll(studentId, courseId) {
        const result = await enrollmentsApi.create(studentId, courseId);
        const roster = rosters.value[courseId];
        if (roster) {
            roster.push({ ...result.student, enrolledAt: result.enrollment.enrolledAt });
            roster.sort((a, b) => a.name.localeCompare(b.name));
        }
        useCourseStore().adjustEnrollmentCount(courseId, 1);
        return result;
    }

    async function unenroll(courseId, studentId) {
        const result = await coursesApi.unenroll(courseId, studentId);
        if (rosters.value[courseId]) {
            rosters.value[courseId] = rosters.value[courseId].filter((s) => s.studentId !== studentId);
        }
        useCourseStore().adjustEnrollmentCount(courseId, -1);
        return result;
    }

    function removeStudentFromRosters(studentId) {
        for (const courseId of Object.keys(rosters.value)) {
            rosters.value[courseId] = rosters.value[courseId].filter((s) => s.studentId !== studentId);
        }
    }

    function removeRoster(courseId) {
        delete rosters.value[courseId];
        if (selectedCourseId.value === courseId) selectedCourseId.value = '';
    }

    return {
        selectedCourseId,
        rosters,
        rosterLoading,
        rosterError,
        selectedRoster,
        fetchRoster,
        enroll,
        unenroll,
        removeStudentFromRosters,
        removeRoster,
    };
});
