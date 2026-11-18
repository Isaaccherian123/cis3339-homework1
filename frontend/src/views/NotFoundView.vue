<script setup>
import { RouterLink } from 'vue-router';
import PageHeader from '@/components/layout/PageHeader.vue';
</script>

<template>
    <PageHeader title="Page not found" description="The page you were looking for does not exist." />
    <p><RouterLink to="/students" class="btn btn--primary btn--md">Go to Students</RouterLink></p>
</template>
