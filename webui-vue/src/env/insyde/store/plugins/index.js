import WebSocketPlugin from '@/store/plugins/WebSocketPlugin';
import InsydeWSPlugin from '@/env/insyde/store/plugins/InsydeWSPlugin';

const Plugins = (store) => {
  WebSocketPlugin(store);
  InsydeWSPlugin(store);
};

export default Plugins;
