<template>
  <div class="position-relative">
    <b-table
      ref="table"
      id="table-id"
      :items="state.items"
      :fields="state.fields"
      :sort-by.sync="state.sortBy"
      :sort-desc.sync="state.sortDesc"
      :empty-text="
        state.isLoading
          ? 'Loading...'
          : state.isError
          ? 'There is error from backend!'
          : 'There are no records to show'
      "
      @sort-changed="onSort"
      no-local-sorting
      sticky-header
      responsive
      bordered
      no-border-collapse
      show-empty
      primary-key="id"
      head-variant="dark"
    >
      <template #empty="scope">
        <div class="text-center">
          <strong>{{ scope.emptyText }}</strong>
        </div>
      </template>
    </b-table>
    <b-overlay :show="state.isLoading" no-wrap opacity="0.5"></b-overlay>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { getBlocs, getBlocsCount } from '@/api';
import { proposerFormatter, throttle, timeFormatter } from '@/utils';

const fields = [
  { key: 'level', sortable: true },
  {
    key: 'timestamp',
    label: 'time',
    sortable: false,
    formatter: timeFormatter
  },
  { key: 'hash', sortable: false },
  { key: 'proposer', sortable: false, formatter: proposerFormatter },
  { key: 'reward', sortable: true },
  { key: 'fees', sortable: true }
];

interface BlocsTableData {
  sortBy: string;
  sortDesc: boolean;
  currentPage: number;
  fields: typeof fields;
  items: unknown[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
}

export default defineComponent({
  name: 'BlocsTable',
  setup() {
    const state = reactive<BlocsTableData>({
      sortBy: 'level',
      sortDesc: false,
      currentPage: 0,
      fields,
      items: [],
      totalItems: 0,
      isLoading: true,
      isError: false
    });
    const table = ref();

    onMounted(async () => {
      const [totalItems, items] = await Promise.all([
        getBlocsCount(),
        getData()
      ]);
      state.totalItems = totalItems;
      state.items = items;
      if (table) {
        table.value?.$el.addEventListener('scroll', throttledScroll);
      }
    });

    onUnmounted(() => {
      table.value?.$el.removeEventListener(throttledScroll);
    });

    const throttledScroll = throttle(onScroll, 250);

    async function getData() {
      try {
        state.isLoading = true;
        state.isError = false;
        const select = fields.map((field) => field.key);
        const newItems = await getBlocs(
          select,
          state.currentPage,
          state.sortBy,
          state.sortDesc
        );
        state.isLoading = false;
        return newItems;
      } catch (error) {
        state.isError = true;
        state.isLoading = false;
        console.error(error);
        return [];
      }
    }

    async function onScroll(event: Event) {
      if (
        (event.target as HTMLElement).scrollTop +
          (event.target as HTMLElement).clientHeight >=
        (event.target as HTMLElement).scrollHeight
      ) {
        if (!state.isLoading) {
          if (state.items.length === state.totalItems) return;
          state.currentPage = state.currentPage + 1;
          const newItems = await getData();
          state.items = state.items.concat(newItems);
        }
      }
    }

    async function onSort({
      sortBy,
      sortDesc
    }: {
      sortBy: string;
      sortDesc: boolean;
    }) {
      state.sortBy = sortBy;
      state.sortDesc = sortDesc;
      state.currentPage = 0;
      state.items = await getData();
      if (table) {
        table.value?.$el.scrollTo(0, 0);
      }
    }

    return { state, table, onSort };
  }
});
</script>

<style lang="scss">
.position-relative {
  min-height: 100%;
}

.b-table-sticky-header {
  max-height: 100vh !important;

  table.table.b-table > thead > tr > th {
    position: sticky !important;
  }
}
</style>
