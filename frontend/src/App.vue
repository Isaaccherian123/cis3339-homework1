<script setup>
import { RouterView } from 'vue-router';
import AppHeader from '@/components/layout/AppHeader.vue';
import ToastContainer from '@/components/layout/ToastContainer.vue';
import ConfirmDialog from '@/components/layout/ConfirmDialog.vue';
</script>

<template>
    <a class="skip-link" href="#main">Skip to main content</a>
    <AppHeader />
    <main id="main" class="container main" tabindex="-1">
        <RouterView />
    </main>
    <footer class="app-footer">
        <div class="container">CIS 3339 · Student Records · Vue 3, Express &amp; MongoDB</div>
    </footer>
    <ToastContainer />
    <ConfirmDialog />
</template>
