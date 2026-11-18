import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * Promise-based confirmation dialog shared by every view:
 *   if (await confirm.ask({ title, message })) { ... }
 */
export const useConfirmStore = defineStore('confirm', () => {
    const request = ref(null);
    let resolver = null;

    function ask({ title, message, confirmLabel = 'Delete' }) {
        resolver?.(false); // close any dialog that is already open
        request.value = { title, message, confirmLabel };
        return new Promise((resolve) => {
            resolver = resolve;
        });
    }

    function respond(confirmed) {
        resolver?.(confirmed);
        resolver = null;
        request.value = null;
    }

    return { request, ask, respond };
});
