<template>
  <div class="position-relative">
    <b-table
      ref="table"
      id="table-id"
      :items="items"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :empty-text="
        isLoading
          ? 'Loading...'
          : isError
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
    <b-overlay :show="isLoading" no-wrap opacity="0.5"></b-overlay>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
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
  tableScrollBody: null | Element;
}

export default Vue.extend({
  name: 'BlocsTable',
  data(): BlocsTableData {
    return {
      sortBy: 'level',
      sortDesc: false,
      currentPage: 0,
      fields,
      items: [],
      totalItems: 0,
      isLoading: true,
      isError: false,
      tableScrollBody: null
    };
  },
  async created() {
    this.totalItems = await getBlocsCount();
    this.items = await this.getData();
  },
  mounted() {
    this.tableScrollBody = (this.$refs.table as Vue).$el;
    this.tableScrollBody.addEventListener(
      'scroll',
      throttle(this.onScroll, 250)
    );
  },
  methods: {
    async getData() {
      try {
        this.isLoading = true;
        this.isError = false;
        const select = fields.map((field) => field.key);
        const newItems = await getBlocs(
          select,
          this.currentPage,
          this.sortBy,
          this.sortDesc
        );
        this.isLoading = false;
        return newItems;
      } catch (error) {
        this.isError = true;
        this.isLoading = false;
        console.error(error);
        return [];
      }
    },
    async onScroll(event: Event) {
      if (
        (event.target as HTMLElement).scrollTop +
          (event.target as HTMLElement).clientHeight >=
        (event.target as HTMLElement).scrollHeight
      ) {
        if (!this.isLoading) {
          if (this.items.length === this.totalItems) return;
          this.currentPage = this.currentPage + 1;
          const newItems = await this.getData();
          this.items = this.items.concat(newItems);
        }
      }
    },
    async onSort({ sortBy, sortDesc }: { sortBy: string; sortDesc: boolean }) {
      console.log('onSort');
      this.sortBy = sortBy;
      this.sortDesc = sortDesc;
      this.currentPage = 0;
      this.items = await this.getData();
      if (this.tableScrollBody) {
        this.tableScrollBody.scrollTo(0, 0);
      }
    }
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
