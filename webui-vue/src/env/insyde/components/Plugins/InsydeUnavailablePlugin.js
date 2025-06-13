import InsydeUnavailable from '@/env/insyde/components/InsydeUnavailable';
import { pluginFactory } from 'bootstrap-vue/src/utils/plugins';

const InsydeUnavailablePlugin = /*#__PURE__*/ pluginFactory({
  components: { InsydeUnavailable },
});

export { InsydeUnavailablePlugin, InsydeUnavailable };
