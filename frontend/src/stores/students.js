import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { studentsApi } from '@/services/api';
import { useEnrollmentStore } from './enrollments';

const byName = (a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) ||
    a.studentId.localeCompare(b.studentId, undefined, { numeric: true });

export const useStudentStore = defineStore('students', () => {
    // Full student list (used by the enrollment form).
    const students = ref([]);
    const loading = ref(false);
    const loadError = ref('');

    // Latest search on the Students page; kept here so it survives navigation.
    const searchQuery = ref('');
    const searchResults = ref([]);
    const searching = ref(false);
    const searchError = ref('');
    const hasSearched = ref(false);

    const sortedStudents = computed(() => [...students.value].sort(byName));
    const studentCount = computed(() => students.value.length);

    async function fetchStudents() {
        loading.value = true;
        loadError.value = '';
        try {
            students.value = await studentsApi.list();
        } catch (error) {
            loadError.value = error.message;
        } finally {
            loading.value = false;
        }
    }

    async function searchStudents(query) {
        searchQuery.value = query.trim();
        searching.value = true;
        searchError.value = '';
        try {
            searchResults.value = await studentsApi.list(searchQuery.value);
            hasSearched.value = true;
        } catch (error) {
            searchError.value = error.message;
        } finally {
            searching.value = false;
        }
    }

    function clearSearch() {
        searchQuery.value = '';
        searchResults.value = [];
        searchError.value = '';
        hasSearched.value = false;
    }

    async function addStudent(payload) {
        const student = await studentsApi.create(payload);
        students.value.push(student);
        return student;
    }

    async function deleteStudent(studentId) {
        const result = await studentsApi.remove(studentId);
        const keep = (s) => s.studentId !== studentId;
        students.value = students.value.filter(keep);
        searchResults.value = searchResults.value.filter(keep);

        // Keep other views consistent with the cascading delete on the server.
        useEnrollmentStore().removeStudentFromRosters(studentId);
        return result;
    }

    return {
        students,
        loading,
        loadError,
        searchQuery,
        searchResults,
        searching,
        searchError,
        hasSearched,
        sortedStudents,
        studentCount,
        fetchStudents,
        searchStudents,
        clearSearch,
        addStudent,
        deleteStudent,
    };
});
