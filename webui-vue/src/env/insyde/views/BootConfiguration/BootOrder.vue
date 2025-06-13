<template>
  <page-section :section-title="$t('pageBootConfiguration.bootOrder.title')">
    <div
      v-if="bootOrderOptionsAll.length == 0"
      class="form-background"
      style="width: 600px; height: 150px"
    >
      <b-row>
        <b-col>
          {{ $t('pageBootConfiguration.bootOrder.noDeviceFound') }}
        </b-col>
      </b-row>
    </div>
    <div
      v-if="bootOrderOptionsAll.length > 0"
      class="form-background"
      style="width: 600px"
    >
      <b-row>
        <b-col>
          <b-form-text id="boot-order-draggable-description" class="px-3 pt-3">
            {{ $t('pageBootConfiguration.bootOrder.draggableDescription') }}
          </b-form-text>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <div class="p-3">
            <div slot="header" class="list-group-header">
              {{ $t('pageBootConfiguration.bootOrder.activeBootOrder') }}
            </div>
            <draggable
              v-model="bootOrderActive"
              v-bind="dragOptions"
              class="list-group mb-3"
              :disabled="$route.meta.viewOnly"
              @start="drag = true"
              @end="drag = false"
            >
              <transition-group
                type="transition"
                :name="!drag ? 'flip-list' : null"
              >
                <div
                  v-for="order in bootOrderActiveOptions"
                  :key="order.name"
                  class="list-group-item item"
                >
                  {{ order.name }}
                </div>
              </transition-group>
            </draggable>
          </div>
        </b-col>
        <b-col>
          <div class="p-3">
            <div slot="header" class="list-group-header">
              {{ $t('pageBootConfiguration.bootOrder.inactiveBootOrder') }}
            </div>
            <draggable
              v-model="bootOrderInactive"
              v-bind="dragOptions"
              class="list-group mb-3"
              :disabled="$route.meta.viewOnly"
              @start="drag = true"
              @end="drag = false"
            >
              <transition-group
                type="transition"
                :name="!drag ? 'flip-list' : null"
              >
                <div
                  v-for="order in bootOrderInactiveOptions"
                  :key="order.name"
                  class="list-group-item item"
                >
                  {{ order.name }}
                </div>
              </transition-group>
            </draggable>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button
            variant="primary"
            class="ml-3 mb-3"
            :disabled="$route.meta.viewOnly"
            @click="handleSubmit"
          >
            {{ $t('global.action.save') }}
          </b-button>
        </b-col>
      </b-row>
    </div>
  </page-section>
</template>

<script>
import { mapGetters } from 'vuex';

import PageSection from '@/components/Global/PageSection';
import draggable from 'vuedraggable';

export default {
  name: 'BootOrder',
  components: { PageSection, draggable },

  data() {
    return {
      drag: true,
    };
  },
  computed: {
    ...mapGetters('bootConfig', ['bootOrderOptionsAll']),
    dragOptions() {
      return {
        animation: 200,
        group: 'option',
        disabled: false,
        ghostClass: 'ghost',
        draggable: '.item',
      };
    },
    bootOrderInactiveOptions() {
      return this.bootOrderOptionsAll.filter((el) => !el.enabled);
    },
    bootOrderInactive: {
      get() {
        return this.bootOrderInactiveOptions.map((el) => {
          return el.value;
        });
      },
      set(value) {
        let currValues = _.cloneDeep(this.bootOrderOptionsAll);
        // Reordering
        currValues.sort((a, b) => {
          let ia = value.findIndex((el) => el == a.value);
          let ib = value.findIndex((el) => el == b.value);
          if (ia >= 0 && ib >= 0) {
            return ia - ib;
          } else if (ia < 0 && ib < 0) {
            return 0;
          } else if (ia < 0) {
            // a is not in the inactive list, let it have a higher order.
            return -1;
          } else {
            // b is not in the inactive list, let it have a higher order.
            return 1;
          }
        });
        currValues = currValues.map((el, idx) => {
          el.order = idx;
          return el;
        });
        this.$store.commit('bootConfig/setBootOrderOptionsAll', currValues);
      },
    },
    bootOrderActiveOptions() {
      return this.bootOrderOptionsAll.filter((el) => el.enabled);
    },
    bootOrderActive: {
      get() {
        return this.bootOrderActiveOptions.map((el) => {
          return el.value;
        });
      },
      set(value) {
        let currValues = _.cloneDeep(this.bootOrderOptionsAll);
        // Set enable/disable
        currValues = currValues.map((el) => {
          el.enabled = value.includes(el.value);
          return el;
        });
        // Reordering
        currValues.sort((a, b) => {
          let ia = value.findIndex((el) => el == a.value);
          let ib = value.findIndex((el) => el == b.value);
          if (ia >= 0 && ib >= 0) {
            return ia - ib;
          } else if (ia < 0 && ib < 0) {
            return 0;
          } else if (ia < 0) {
            // a is not in the active list, let it have a lower order.
            return 1;
          } else {
            // b is not in the active list, let it have a lower order.
            return -1;
          }
        });
        currValues = currValues.map((el, idx) => {
          el.order = idx;
          return el;
        });
        this.$store.commit('bootConfig/setBootOrderOptionsAll', currValues);
      },
    },
  },
  created() {
    this.$root.$emit('boot-configuration-boot-order-complete');
  },
  methods: {
    handleSubmit() {
      this.startLoader();
      this.$store
        .dispatch('bootConfig/saveBootOrder')
        .then((success) => this.successToast(success))
        .catch(({ message }) => this.errorToast(message))
        .finally(() => this.endLoader());
    },
  },
};
</script>

<style scoped>
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 20px;
}

.list-group-header {
  cursor: default;
  background: #d2c5c5;
  padding-left: 10px;
}

.list-group-item {
  cursor: move;
  white-space: nowrap;
}

.list-group-item div {
  cursor: pointer;
}
</style>
