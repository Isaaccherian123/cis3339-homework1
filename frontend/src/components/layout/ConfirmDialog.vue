<script setup>
import { nextTick, ref, watch } from 'vue';
import { useConfirmStore } from '@/stores/confirm';
import BaseButton from '@/components/base/BaseButton.vue';

const confirm = useConfirmStore();
const dialog = ref(null);
const cancelButton = ref(null);

// Native <dialog> gives us focus trapping, Escape handling, and a backdrop.
watch(
    () => confirm.request,
    async (request) => {
        const el = dialog.value;
        if (!el) return;
        if (request && !el.open) {
            el.showModal();
            await nextTick();
            cancelButton.value?.$el.focus(); // safer default for destructive actions
        } else if (!request && el.open) {
            el.close();
        }
    }
);

function onCancel(event) {
    event.preventDefault();
    confirm.respond(false);
}
</script>

<template>
    <dialog
        ref="dialog"
        class="dialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        @cancel="onCancel"
    >
        <template v-if="confirm.request">
            <h2 id="confirm-title" class="dialog__title">{{ confirm.request.title }}</h2>
            <p id="confirm-message" class="dialog__message">{{ confirm.request.message }}</p>
            <div class="dialog__actions">
                <BaseButton ref="cancelButton" @click="confirm.respond(false)">Cancel</BaseButton>
                <BaseButton variant="danger" @click="confirm.respond(true)">
                    {{ confirm.request.confirmLabel }}
                </BaseButton>
            </div>
        </template>
    </dialog>
</template>
