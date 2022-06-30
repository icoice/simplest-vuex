import debug from 'debug';
import Vuex, { Store, mapActions, mapGetters } from 'vuex';
import BuildStoreNS, { shareSpace } from './BuildStoreNS';
import { firstUppercase } from './common';

const d = debug('simplestVuex');
const de = debug('simplestVuex:error');

BuildStoreNS.use = (n, v) => {
  if (!BuildStoreNS[n]) {
      d(`use: ${n}`, v);

      BuildStoreNS[n] = v;
  } else {
      throw de(`use: ${n} is existed`);
  }
}

BuildStoreNS.vuexRegister = store => new Store(store);

export const install = (Vue, options = {}) => {
  const { onCreateStoreBefore } = options;

  if (is(onCreateStoreBefore, Function)) {
    onCreateStoreBefore(BuildStoreNS, { Vuex, Store, mapActions, mapGetters });
  }

  Vue.use(Vuex);
};

const toMap = (ns, names, share = {}) => {
  return !is(names, null) ? names.map(name => `${ns}${firstUppercase(name)}`) : share[ns];
}

export const getters = (ns, names = null) => {
  if (!shareSpace.namespace.includes(ns) && !shareSpace.getter[ns]) {
    de('getters: 未注册 %S', ns);

    return {};
  }

  return mapGetters([
    ...toMap(ns, names, shareSpace.getter),

    ns,
  ]);
}

export const actions = (ns, names = null) => {
  if (!shareSpace.action[ns]) {
    de('actions: 未注册 %S', ns);

    return {};

  }

  return mapActions(maps(ns, names, shareSpace.action));
}

export default install;
