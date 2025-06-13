import i18n from '@/i18n';
export const expandRowLabel = i18n.t('global.table.expandTableRow');

const NvmeTableRowExpandMixin = {
  methods: {
    toggleRowDetails(row) {
      console.log(row.item);
      row.toggleDetails();
      row.detailsShowing
        ? (this.expandRowLabel = this.$t('global.table.expandTableRow'))
        : (this.expandRowLabel = this.$t('global.table.collapseTableRow'));
    },
  },
};

export default NvmeTableRowExpandMixin;
