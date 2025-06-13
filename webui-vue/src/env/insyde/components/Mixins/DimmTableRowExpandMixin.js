import i18n from '@/i18n';
export const expandRowLabel = i18n.t('global.table.expandTableRow');

const DimmTableRowExpandMixin = {
  methods: {
    toggleRowDetails(row) {
      console.log(Object.keys(row.item.metricsinfo).length);
      row.toggleDetails();
      row.detailsShowing
        ? (this.expandRowLabel = this.$t('global.table.expandTableRow'))
        : (this.expandRowLabel = this.$t('global.table.collapseTableRow'));
    },
  },
};

export default DimmTableRowExpandMixin;
