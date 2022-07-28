import debug from 'debug';
import { is, loop, firstUppercase } from './common'; 

const d = debug('simplest-vuex');
const e = debug('simplest-vuex:error');
const ds = d.extend('share-space');
const de = d.extend('state');
const da = d.extend('action');
const dm = d.extend('mutation');
const dg = d.extend('getter');

export const shareSpace = {
    mutation: {},
    namespace: [],
    action: {},
    getter: {},
    state: [],
};

export const storeInstance = {
    actions: {},
    getters: {},
    mutations: {},
    state: {},
};

if (typeof window !== 'undefined') {
    window.simpleLestVuexShareSpace = () => {
        ds('print', shareSpace, storeInstance);

        return { shareSpace, storeInstance };
    }
}

class BuildStoreNS {
    constructor(ns = '') {
        shareSpace.mutation[ns] = [];
        shareSpace.action[ns] = [];
        shareSpace.getter[ns] = [];
        shareSpace.state[ns] = [];
    
        this.ns = ns;
    }

    getShareStore() {
        ds('print', shareSpace);

        return shareSpace;
    }

    setScope(name) {
        this.ns = ns === '' ? name : ns;
    }

    getNamespace(name = '') {
        const { ns } = this;

        return  `${ns}${firstUppercase(name)}`;
    }

    getState(state, n) {
        return state[this.getNamespace(n)];
    }

    getSpeedReadStateName() {
        const {ns} = this;

        return `set${firstUppercase(ns)}${firstUppercase(n)}`;
    }

    getActionName(name) {
        return `set${firstUppercase(name)}`;
    }

    shareRegister(arr = [], name = '') {
        if (!arr.includes(name)) arr.push(name);
    }

    // state快速设置
    speedSetState(localName, params) {
        const { ns } = this;
        const name = this.getNamespace(localName);
        const an = this.getActionName(name);

        de('create', `${localName} to ${ns} > ${an}`);
        
        storeInstance.state[name] = params; // 设置state
        storeInstance.getters[name] = state => state[name]; // 默认getter
        // 默认action
        storeInstance.actions[an] = ({ state }, payload) => {
          state[name] = payload;
          state[ns][localName] = payload;
        };
        // 默认mutation
        storeInstance.mutations[name] = function (state, payload) {
          state[name] = payload;
          state[ns][localName] = payload;
        };
        
        this.shareRegister(shareSpace.state[ns], name);
        this.shareRegister(shareSpace.getter[ns], name);
        this.shareRegister(shareSpace.action[ns], an);
        this.shareRegister(shareSpace.mutation[ns], name);
    }

    // 自定义设置mutation
    mutation(n = '', cb = () => {}) {
        const { ns } = this;
        const name = this.getNamespace(n);

        dm('create', `${ns} > ${name}`);
    
        storeInstance.mutations[name] = cb;

        this.shareRegister(shareSpace.mutation[ns], name);
    }

    // 自定义设置getter
    getter(n = '', cb = null) {
        const { ns } = this;
        const name = this.getNamespace(n);

        dg('create', `${ns} > ${name}`);

        storeInstance.getters[name] = is(cb, Function) ? cb : state => state[name];

        this.shareRegister(shareSpace.getter[ns], name);
    }

    action(n, cb) {
        const { ns } = this;
        const name = this.getNamespace(n);

        da('create', `${ns} > ${name}`);
    
        storeInstance.actions[name] = (process, params) => {
            const actionExtend = {
                ...process,
                
                ownerState: process.state[ns],
                publish: nameList => loop(nameList, (v, k) => process.commit(this.getNamespace(k), v)),
                push: (k, v) => process.commit(this.getNamespace(k), v),
                doth: (k, payload) => process.dispatch(this.getNamespace(k), payload),
            };

            if (!is(cb, Function)) {
                const errorMsg = `请设置${ns} > ${name}的回调方法`;

                e(errorMsg);

                throw new Error(errorMsg);
            }

            return cb(actionExtend, params);
        };

        this.shareRegister(shareSpace.action[ns], name);
    }

    // State
    state(stateList = {}) {
        const { ns } = this;
        const { namespace } = shareSpace;

        // 初始化注册
        if (!namespace.includes(ns)) {
          namespace.push(ns);

          storeInstance.state[ns] = {};
          storeInstance.getters[ns] = state => state[ns];
        }
    
        loop(stateList, (v, n) => {
          const storeState = storeInstance.state[ns];
          const name = this.getNamespace(n);
            
          // 创建state快速设置
          this.speedSetState(n, v);
          
          // 自动创建与state相关的内容
          storeState[n] = v;
          storeInstance.state[name] = v;
          
          de('create', `${ns} > ${name}`);

          storeInstance.getters[name] = state => state[name];
          
          dg('create', `${ns} > ${name}`);

          storeInstance.mutations[name] = (state, payload) => {
            state[name] = payload;
            storeState[n] = payload;
          };

          dm('create', `${ns} > ${name}`);
    
          this.shareRegister(shareSpace.getter[ns], name);
          this.shareRegister(shareSpace.mutation[ns], name);
          this.shareRegister(shareSpace.state[ns], name);
        });
    }
}

export default BuildStoreNS;