<script setup>
import { RouterLink } from 'vue-router';

const links = [
    { to: '/students', label: 'Students' },
    { to: '/courses', label: 'Courses' },
    { to: '/enrollments', label: 'Enrollments' },
];
</script>

<template>
    <header class="app-header">
        <div class="container app-header__inner">
            <RouterLink to="/students" class="brand">
                <svg class="brand__logo" viewBox="0 0 32 32" aria-hidden="true">
                    <rect width="32" height="32" rx="7" fill="currentColor" />
                    <path
                        d="M16 7 4 13l12 6 12-6-12-6Zm-7 9.2V21c0 2 3.1 4 7 4s7-2 7-4v-4.8L16 20l-7-3.8Z"
                        fill="#fff"
                    />
                </svg>
                <span>Student Records</span>
            </RouterLink>
            <nav class="main-nav" aria-label="Main">
                <RouterLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="main-nav__link"
                    active-class="main-nav__link--active"
                >
                    {{ link.label }}
                </RouterLink>
            </nav>
        </div>
    </header>
</template>
