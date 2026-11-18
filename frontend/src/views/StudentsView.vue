<script setup>
import { computed, onMounted, ref } from 'vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import StatBadge from '@/components/layout/StatBadge.vue';
import BaseCard from '@/components/base/BaseCard.vue';
import BaseButton from '@/components/base/BaseButton.vue';
import AlertMessage from '@/components/base/AlertMessage.vue';
import LoadingState from '@/components/base/LoadingState.vue';
import EmptyState from '@/components/base/EmptyState.vue';
import DataTable from '@/components/base/DataTable.vue';
import StudentForm from '@/components/students/StudentForm.vue';
import StudentSearch from '@/components/students/StudentSearch.vue';
import { useStudentStore } from '@/stores/students';
import { useConfirmStore } from '@/stores/confirm';
import { useNotificationStore } from '@/stores/notifications';

const store = useStudentStore();
const confirm = useConfirmStore();
const notifications = useNotificationStore();

const query = ref(store.searchQuery);
const deletingId = ref('');

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'phone', label: 'Phone' },
    { key: 'zip', label: 'ZIP' },
];

const summary = computed(() => {
    const n = store.searchResults.length;
    const label = `${n} student${n === 1 ? '' : 's'}`;
    return store.searchQuery ? `${label} found for “${store.searchQuery}”` : `Showing all ${label}`;
});

onMounted(() => {
    store.fetchStudents();
});

function search(text) {
    store.searchStudents(text);
}

function showAll() {
    query.value = '';
    store.searchStudents('');
}

function clear() {
    query.value = '';
    store.clearSearch();
}

function onAdded() {
    // Refresh visible results so a matching new student appears right away.
    if (store.hasSearched) store.searchStudents(store.searchQuery);
}

async function remove(student) {
    const ok = await confirm.ask({
        title: 'Delete student?',
        message: `Delete ${student.name} (ID ${student.studentId})? Any course enrollments for this student will also be removed. This cannot be undone.`,
        confirmLabel: 'Delete student',
    });
    if (!ok) return;

    deletingId.value = student.studentId;
    try {
        const result = await store.deleteStudent(student.studentId);
        const extra = result.removedEnrollments
            ? ` and ${result.removedEnrollments} enrollment${result.removedEnrollments === 1 ? '' : 's'}`
            : '';
        notifications.success(`Deleted ${student.name}${extra}.`);
    } catch (error) {
        notifications.error(error.message);
        if (error.status === 404) store.searchStudents(store.searchQuery);
    } finally {
        deletingId.value = '';
    }
}
</script>

<template>
    <PageHeader title="Students" description="Add students, look them up by name or ID, and remove records.">
        <StatBadge label="Students on file" :value="store.loadError ? null : store.studentCount" />
    </PageHeader>

    <AlertMessage v-if="store.loadError" type="error" class="page-alert">
        Could not load students: {{ store.loadError }}
    </AlertMessage>

    <div class="layout-split">
        <BaseCard
            title="Add a student"
            heading-id="add-student-heading"
            description="All fields are required."
        >
            <StudentForm @added="onAdded" />
        </BaseCard>

        <BaseCard title="Find students" heading-id="find-student-heading">
            <template v-if="store.hasSearched" #actions>
                <BaseButton variant="ghost" size="sm" @click="clear">Clear results</BaseButton>
            </template>

            <div class="stack">
                <StudentSearch v-model="query" :loading="store.searching" @search="search" @show-all="showAll" />

                <LoadingState v-if="store.searching && !store.hasSearched">Searching…</LoadingState>
                <AlertMessage v-else-if="store.searchError" type="error">{{ store.searchError }}</AlertMessage>
                <template v-else-if="store.hasSearched">
                    <p class="results-summary" role="status">{{ summary }}</p>
                    <EmptyState v-if="!store.searchResults.length" title="No matching students">
                        Check the spelling, try part of the name, or search by student ID.
                    </EmptyState>
                    <DataTable
                        v-else
                        :columns="columns"
                        :rows="store.searchResults"
                        row-key="studentId"
                        caption="Student search results"
                    >
                        <template #actions="{ row }">
                            <BaseButton
                                variant="danger"
                                size="sm"
                                :loading="deletingId === row.studentId"
                                :aria-label="`Delete ${row.name} (ID ${row.studentId})`"
                                @click="remove(row)"
                            >
                                Delete
                            </BaseButton>
                        </template>
                    </DataTable>
                </template>
                <EmptyState v-else title="Search for a student">
                    Enter a name or student ID above, or choose “Show all”.
                </EmptyState>
            </div>
        </BaseCard>
    </div>
</template>
