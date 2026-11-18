import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { coursesApi } from '@/services/api';
import { useEnrollmentStore } from './enrollments';

export const useCourseStore = defineStore('courses', () => {
    const courses = ref([]);
    const loading = ref(false);
    const loadError = ref('');

    const sortedCourses = computed(() =>
        [...courses.value].sort((a, b) =>
            a.courseId.localeCompare(b.courseId, undefined, { numeric: true })
        )
    );
    const courseCount = computed(() => courses.value.length);
    const totalEnrollments = computed(() =>
        courses.value.reduce((sum, course) => sum + (course.enrollmentCount ?? 0), 0)
    );

    async function fetchCourses() {
        loading.value = true;
        loadError.value = '';
        try {
            courses.value = await coursesApi.list();
        } catch (error) {
            loadError.value = error.message;
        } finally {
            loading.value = false;
        }
    }

    async function addCourse(payload) {
        const course = await coursesApi.create(payload);
        courses.value.push(course);
        return course;
    }

    async function deleteCourse(courseId) {
        const result = await coursesApi.remove(courseId);
        courses.value = courses.value.filter((c) => c.courseId !== courseId);
        useEnrollmentStore().removeRoster(courseId);
        return result;
    }

    function adjustEnrollmentCount(courseId, delta) {
        const course = courses.value.find((c) => c.courseId === courseId);
        if (course) course.enrollmentCount = Math.max(0, (course.enrollmentCount ?? 0) + delta);
    }

    return {
        courses,
        loading,
        loadError,
        sortedCourses,
        courseCount,
        totalEnrollments,
        fetchCourses,
        addCourse,
        deleteCourse,
        adjustEnrollmentCount,
    };
});
