<template>
  <b-container fluid="xl">
    <page-title />
    <b-span>
      {{ $t('pageUnitReset.description') }}
    </b-span>
    <br />
    <b-span>
      {{ $t('pageUnitReset.description2') }}
    </b-span>
    <br />

    <!-- Reset Form -->
    <b-button
      type="submit"
      variant="primary"
      data-test-id="unitReset-button-submit"
      :disabled="$route.meta.viewOnly"
      @click="onUnitResetSubmit"
    >
      {{ $t('global.action.reset') }}
    </b-button>
  </b-container>
</template>

<script>
import PageTitle from '@/components/Global/PageTitle';

export default {
  name: 'FactoryReset',
  components: { PageTitle },

  data() {
    return {
      resetOption: 'resetBios',
    };
  },
  created() {
    this.hideLoader();
  },
  methods: {
    onUnitResetSubmit() {
      this.$bvModal
        .msgBoxConfirm(this.$t('pageUnitReset.msgbox.resetConfirmMessage'), {
          title: this.$tc('appPageTitle.unitReset'),
          okTitle: this.$tc('global.action.confirm'),
          cancelTitle: this.$t('global.action.cancel'),
        })
        .then((confirmed) => {
          if (confirmed) {
            this.$store
              .dispatch('unitReset/resetBmc')
              .then((title) => {
                this.successToast('', {
                  title,
                });
              })
              .catch(({ message }) => {
                this.errorToast('', {
                  title: message,
                });
              });
          }
        });
    },
  },
};
</script>
