<template>
  <div class="page-container">
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
        class="mb-0"
      >
        <template #empty="scope">
          <div class="text-center">
            <strong>{{ scope.emptyText }}</strong>
          </div>
        </template>
      </b-table>
      <b-overlay :show="state.isLoading" no-wrap opacity="0.5"></b-overlay>
    </div>
    <b-alert :show="!!state.newItemsCount" variant="info" fade
      >Have new {{ state.newItemsCount }} block{{
        state.newItemsCount > 1 ? 's' : ''
      }}. Update Table?
      <b-button
        class="ml-1"
        @click="updateData(false)"
        variant="info"
        size="sm"
      >
        Update
      </b-button>
      <b-button class="ml-1" @click="updateData(true)" variant="info" size="sm">
        Update and never ask
      </b-button>
    </b-alert>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
  onMounted,
  computed
} from 'vue';
import { getBlocks, getBlocksCount } from '@/api';
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

interface BlocksTableData {
  sortBy: string;
  sortDesc: boolean;
  currentPage: number;
  fields: typeof fields;
  items: unknown[];
  totalItems: number;
  isLoading: boolean;
  isError: boolean;
  newItemsCount: number;
}

export default defineComponent({
  name: 'BlocksTable',
  setup() {
    const state = reactive<BlocksTableData>({
      sortBy: 'level',
      sortDesc: false,
      currentPage: 0,
      fields,
      items: [],
      totalItems: 0,
      isLoading: true,
      isError: false,
      newItemsCount: 0
    });
    const table = ref();
    const interval = ref();

    watch(
      [
        () => state.currentPage,
        () => state.sortBy,
        () => state.sortDesc,
        () => state.totalItems
      ],
      async (
        [currentPage, sortBy, sortDesc, totalItems],
        [prevCurrentPage, prevSortBy, prevSortDesc, prevTotalItems]
      ) => {
        if (
          currentPage !== prevCurrentPage ||
          sortBy !== prevSortBy ||
          sortDesc !== prevSortDesc ||
          totalItems !== prevTotalItems
        ) {
          const newItems = await getData.value();
          state.items =
            currentPage === 0 ? newItems : [...state.items, ...newItems];
        }
      }
    );

    onMounted(async () => {
      state.totalItems = await getBlocksCount();
      if (table) {
        table.value?.$el.addEventListener('scroll', throttledScroll);
      }
      interval.value = setInterval(updateBlocksCount, 8000);
    });

    onBeforeUnmount(() => {
      table.value?.$el.removeEventListener('scroll', throttledScroll);
      if (interval.value) {
        clearInterval(interval.value);
      }
    });

    const throttledScroll = throttle(onScroll, 250);

    async function updateBlocksCount() {
      const newCount = await getBlocksCount();
      state.newItemsCount = newCount - state.totalItems;
    }

    async function updateData(noUpdateBlockCount: boolean) {
      toFirstPage();
      state.totalItems = state.totalItems + state.newItemsCount;
      state.newItemsCount = 0;
      if (noUpdateBlockCount) {
        clearInterval(interval.value);
      }
    }

    const getData = computed((): (() => Promise<unknown[]>) => {
      const select = fields.map((field) => field.key);
      return async () => {
        try {
          state.isLoading = true;
          state.isError = false;
          const newItems = await getBlocks(
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
      };
    });

    async function onScroll(event: Event) {
      if (
        (event.target as HTMLElement).scrollTop +
          (event.target as HTMLElement).clientHeight >=
        (event.target as HTMLElement).scrollHeight
      ) {
        if (!state.isLoading) {
          if (state.items.length === state.totalItems) return;
          state.currentPage = state.currentPage + 1;
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
      toFirstPage();
    }

    function toFirstPage() {
      state.currentPage = 0;
      if (table) {
        table.value?.$el.scrollTo(0, 0);
      }
    }

    return { state, table, onSort, updateData };
  }
});
</script>

<style lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.position-relative {
  overflow: auto;
  flex-grow: 1;
}

.b-table-sticky-header {
  max-height: 100% !important;

  table.table.b-table > thead > tr > th {
    position: sticky !important;
  }
}
.alert {
  margin: 0 !important;
}
</style>
