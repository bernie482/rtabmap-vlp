<template>
  <div class="na-root">
    <svg width="144" height="144" viewBox="0 0 24 24">
      <path
        fill="#c0c0c0"
        d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"
      ></path>
    </svg>
    <div class="na-text">
      {{ msg }}
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n';

export default {
  name: 'InsydeUnavailable',
  props: {
    msg: {
      // (optional) description
      type: String,
      default: i18n.t('global.status.notAvailable'),
    },
  },
};
</script>

<style scoped>
.na-root {
  padding: 24px 0px;
  text-align: center;
  color: rgb(192, 192, 192);
  font-size: 18px;
}
.na-text {
  color: rgb(192, 192, 192);
  font-size: 24px;
  line-height: 24px;
  margin-top: 36px;
  margin-bottom: 12px;
}
</style>
