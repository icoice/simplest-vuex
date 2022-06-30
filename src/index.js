import debug from 'debug';
import Vuex, { Store, mapActions, mapGetters } from 'vuex';
import BuildStoreNS, { shareSpace, storeInstance } from './BuildStoreNS';
import { is, firstUppercase } from './common';

const d = debug('simplest-vuex');
const de = debug('simplest-vuex:error');

BuildStoreNS.use = (n, v) => {
  if (!BuildStoreNS[n]) {
      d(`use: ${n}`, v);

      BuildStoreNS[n] = v;
  } else {
      throw de(`use: ${n} is existed`);
  }
}

export const createSimplestVuexStore = () => new Store(storeInstance);

export {
  Vuex,
  Store,
  mapActions,
  mapGetters,
};

export const install = (Vue, options = {}) => {
  const { onEnrollStoreBefore } = options;

  Vue.use(Vuex);

  if (is(onEnrollStoreBefore, Function)) {
    onEnrollStoreBefore(BuildStoreNS, { Vuex, Store, mapActions, mapGetters });
  }

  // if (is(Vue.prototype.$store, 'undefined')) {
  //   Vue.prototype.$store = createSimplestVuexStore()
  // } else {
  //   throw 'simplest-vuex: $store已被注册'
  // }
};

const toMap = (ns, names, share = {}) => {
  return !is(names, null) ? names.map(name => `${ns}${firstUppercase(name)}`) : share[ns];
};

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

  return mapActions(toMap(ns, names, shareSpace.action));
}

export default install;
