import { ref } from 'vue';
import { defineStore } from 'pinia';

const MAX_VISIBLE = 3;

/** App-wide toast messages shown by <ToastContainer>. */
export const useNotificationStore = defineStore('notifications', () => {
    const toasts = ref([]);
    let nextId = 1;

    function dismiss(id) {
        toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }

    function notify(message, type = 'success', timeout = 4500) {
        const id = nextId++;
        toasts.value.push({ id, message, type });
        if (toasts.value.length > MAX_VISIBLE) toasts.value.shift();
        if (timeout) setTimeout(() => dismiss(id), timeout);
        return id;
    }

    const success = (message) => notify(message, 'success');
    const error = (message) => notify(message, 'error', 7000);

    return { toasts, notify, success, error, dismiss };
});
