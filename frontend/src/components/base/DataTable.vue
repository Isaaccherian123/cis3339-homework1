<script setup>
/**
 * Responsive table. Below the mobile breakpoint each row becomes a card and
 * every cell shows its column label (from data-label).
 *
 * Slots:
 *   #cell-<key>="{ row }"  custom cell content
 *   #actions="{ row }"     per-row action buttons
 */
defineProps({
    columns: { type: Array, required: true }, // [{ key, label }]
    rows: { type: Array, required: true },
    rowKey: { type: String, required: true },
    caption: { type: String, required: true },
});
</script>

<template>
    <div class="table-wrap">
        <table class="data-table">
            <caption class="sr-only">{{ caption }}</caption>
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.key" scope="col">{{ column.label }}</th>
                    <th v-if="$slots.actions" scope="col" class="data-table__actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="row[rowKey]">
                    <td v-for="column in columns" :key="column.key" :data-label="column.label">
                        <slot :name="`cell-${column.key}`" :row="row">{{ row[column.key] }}</slot>
                    </td>
                    <td v-if="$slots.actions" class="data-table__actions" data-label="Actions">
                        <slot name="actions" :row="row" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
