<template>
  <b-modal
    id="firmware-pld-modal"
    ref="modal"
    :title="$t(`${path}.title`)"
    @hidden="resetConfirm"
  >
    <template #default>
      <div v-if="$te(`${path}.context`)">
        <p v-if="$te(`${path}.context.header`)" :key="index" class="mb-2">
          <strong>{{ $t(`${path}.context.header`) }}</strong>
        </p>
        <ul v-if="$te(`${path}.context.items`)" :key="index">
          <li
            v-for="(item, itemIndex) in $t(`${path}.context.items`)"
            :key="itemIndex"
            class="mt-1 mb-1"
          >
            {{ $t(item) }}
          </li>
        </ul>
      </div>
    </template>
    <template #modal-footer>
      <div>
        <b-button
          class="mr-3"
          variant="secondary"
          data-test-id="modal-button-cancel"
          @click="handleCancel"
        >
          {{
            $te(`${path}.cancel`)
              ? $t(`${path}.cancel`)
              : $t('global.action.cancel')
          }}
        </b-button>
        <b-button
          type="submit"
          variant="primary"
          data-test-id="modal-button-confirm"
          @click="handleConfirm"
        >
          {{
            $te(`${path}.confirm`)
              ? $t(`${path}.confirm`)
              : $t('global.action.confirm')
          }}
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'FirmwareUpdateModal',
  props: {
    type: {
      required: true,
      type: String,
      default: '',
    },
    path: {
      required: true,
      type: String,
      default: '',
    },
  },
  data() {
    return {
      confirm: false,
    };
  },
  methods: {
    handleConfirm() {
      this.$emit('ok');
      this.$nextTick(() => this.$refs.modal.hide());
    },
    handleCancel() {
      this.$nextTick(() => this.$refs.modal.hide());
    },
    resetConfirm() {
      this.confirm = false;
    },
  },
};
</script>

<style></style>
