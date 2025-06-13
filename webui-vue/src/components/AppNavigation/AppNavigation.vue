<template>
  <div>
    <div class="nav-container" :class="{ open: isNavigationOpen }">
      <nav ref="nav" :aria-label="$t('appNavigation.primaryNavigation')">
        <b-nav vertical class="mb-4">
          <template v-for="(navItem, index) in navigationItems">
            <!-- Navigation items with no children -->
            <b-nav-item
              v-if="!navItem.children"
              :key="index"
              :to="navItem.route"
              :data-test-id="`nav-item-${navItem.id}`"
              :class="navItem.myclass"
            >
              <component :is="navItem.icon" />
              {{ navItem.label }}
            </b-nav-item>

            <!-- Navigation items with children -->
            <li v-else :key="index" class="nav-item">
              <b-button
                v-b-toggle="`${navItem.id}`"
                variant="link"
                :data-test-id="`nav-button-${navItem.id}`"
                :class="navItem.myclass"
              >
                <component :is="navItem.icon" />
                {{ navItem.label }}
                <icon-expand class="icon-expand" />
              </b-button>
              <b-collapse :id="navItem.id" tag="ul" class="nav-item__nav">
                <li class="nav-item">
                  <router-link
                    v-for="(subNavItem, i) of navItem.children"
                    :key="i"
                    :to="subNavItem.route"
                    :data-test-id="`nav-item-${subNavItem.id}`"
                    class="nav-link"
                    :class="subNavItem.myclass"
                  >
                    {{ subNavItem.label }}
                  </router-link>
                </li>
              </b-collapse>
            </li>
          </template>
        </b-nav>
      </nav>
    </div>
    <transition name="fade">
      <div
        v-if="isNavigationOpen"
        id="nav-overlay"
        class="nav-overlay"
        @click="toggleIsOpen"
      ></div>
    </transition>
  </div>
</template>

<script>
//Do not change Mixin import.
//Exact match alias set to support
//dotenv customizations.
import AppNavigationMixin from './AppNavigationMixin';

export default {
  name: 'AppNavigation',
  mixins: [AppNavigationMixin],
  data() {
    return {
      isNavigationOpen: false,
    };
  },
  watch: {
    $route: function () {
      this.isNavigationOpen = false;
    },
    isNavigationOpen: function (isNavigationOpen) {
      this.$root.$emit('change-is-navigation-open', isNavigationOpen);
    },
  },
  mounted() {
    this.$root.$on('toggle-navigation', () => this.toggleIsOpen());
  },
  methods: {
    toggleIsOpen() {
      this.isNavigationOpen = !this.isNavigationOpen;
    },
  },
};
</script>

<style scoped lang="scss">
svg {
  fill: currentColor;
  height: 1.2rem;
  width: 1.2rem;
  margin-left: 0 !important; //!important overriding button specificity
  vertical-align: text-bottom;
  &:not(.icon-expand) {
    margin-right: $spacer;
  }
}

$nav-bg-color: theme-color('light') !default;
$nav-link-bg-color: theme-color('secondary') !default;
$nav-link-color: theme-color('secondary') !default;
$nav-link-hover-bg-color: theme-color-level(dark, -10.5) !default;
$nav-link-hover-color: theme-color('dark') !default;
$nav-link-focus-bg-color: theme-color-level(light, 0) !default;
$nav-link-focus-color: theme-color('dark') !default;
$nav-link-font-weight: $headings-font-weight !default;
$nav-curr-link-before-bg-color: theme-color('primary') !default;
$nav-curr-link-bg-color: theme-color('secondary') !default;
$nav-curr-link-color: theme-color('light') !default;
$nav-curr-link-hover-bg-color: theme-color('secondary') !default;
$nav-curr-link-hover-color: theme-color('light') !default;
$nav-curr-link-focus-bg-color: theme-color('secondary') !default;
$nav-curr-link-focus-color: theme-color('light') !default;
$nav-curr-link-font-weight: $headings-font-weight !default;
$nav-link-font-family: $font-family-base !default;

.green {
  background: green;
}

.red {
  background: red;
}

.nav {
  padding-top: $spacer / 4;
  @include media-breakpoint-up($responsive-layout-bp) {
    padding-top: $spacer;
  }
}

.nav-item__nav {
  list-style: none;
  padding-left: 0;
  margin-left: 0;

  .nav-item {
    outline: none;
  }

  .nav-link {
    padding-left: $spacer * 4;
    outline: none;

    &:not(.nav-link--current) {
      font-weight: $nav-link-font-weight;
    }
  }
}

.btn-link {
  display: inline-block;
  width: 100%;
  text-align: left;
  text-decoration: none !important;
  border-radius: 0;

  &.collapsed {
    .icon-expand {
      transform: rotate(180deg);
    }
  }
}

.icon-expand {
  float: right;
  margin-top: $spacer / 4;
}

.btn-link,
.nav-link {
  position: relative;
  font-family: $nav-link-font-family;
  font-weight: $nav-link-font-weight;
  padding-left: $spacer; // defining consistent padding for links and buttons
  padding-right: $spacer;
  color: $nav-link-color;
  @if variable-exists(nav-link-custom-style) and $nav-link-custom-style {
    @include nav-link-custom-style;
  }

  &:hover {
    background-color: $nav-link-hover-bg-color;
    color: $nav-link-hover-color;
  }

  &:focus {
    background-color: $nav-link-focus-bg-color;
    color: $nav-link-focus-color;
    box-shadow: inset 0 0 0 2px theme-color('primary');
    outline: 0;
  }

  &:active {
    @if variable-exists(nav-bg-gradient) and $nav-bg-gradient {
      @include nav-bg-gradient-color;
    } @else {
      background-color: $nav-link-bg-color;
    }
    color: $white;
  }
}

.nav-link--current {
  font-family: $nav-link-font-family;
  font-weight: $nav-curr-link-font-weight;
  background-color: $nav-curr-link-bg-color;
  color: $nav-curr-link-color;
  cursor: default;
  box-shadow: none;
  @if variable-exists(nav-link-custom-style) and $nav-link-custom-style {
    @include nav-link-custom-style;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background-color: $nav-curr-link-before-bg-color;
  }

  &:hover {
    background-color: $nav-curr-link-hover-bg-color;
    color: $nav-curr-link-hover-color;
  }

  &:focus {
    background-color: $nav-curr-link-focus-bg-color;
    color: $nav-curr-link-focus-color;
  }
}

.nav-container {
  position: fixed;
  width: $navigation-width;
  top: $header-height;
  bottom: 0;
  left: 0;
  z-index: $zindex-fixed;
  overflow-y: auto;
  @if variable-exists(nav-bg-gradient) and $nav-bg-gradient {
    @include nav-bg-gradient-color;
  } @else {
    background-color: $nav-bg-color;
  }
  transform: translateX(-$navigation-width);
  transition: transform $exit-easing--productive $duration--moderate-02;
  border-right: 1px solid theme-color-level('light', 2.85);

  @include media-breakpoint-down(md) {
    z-index: $zindex-fixed + 2;
  }

  &.open,
  &:focus-within {
    transform: translateX(0);
    transition-timing-function: $entrance-easing--productive;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    transition-duration: $duration--fast-01;
    transform: translateX(0);
  }
}

.nav-overlay {
  position: fixed;
  top: $header-height;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $zindex-fixed + 1;
  background-color: $black;
  opacity: 0.5;

  &.fade-enter-active {
    transition: opacity $duration--moderate-02 $entrance-easing--productive;
  }

  &.fade-leave-active {
    transition: opacity $duration--fast-02 $exit-easing--productive;
  }

  &.fade-enter, // Remove this vue2 based only class when switching to vue3
  &.fade-enter-from, // This is vue3 based only class modified from 'fade-enter'
  &.fade-leave-to {
    opacity: 0;
  }

  @include media-breakpoint-up($responsive-layout-bp) {
    display: none;
  }
}
</style>
