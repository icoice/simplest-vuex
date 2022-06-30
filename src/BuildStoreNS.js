import debug from 'debug';
import { is, loop, firstUppercase } from './common'; 

const d = debug('simplestVuex');
const e = debug('simplestVuex:error');
const ds = d.extend('shareSpace');
const de = d.extend('state');

export const shareSpace = {
    mutation: {},
    namespace: [],
    action: {},
    getter: {},
    state: [],
};

if (typeof window !== 'undefined') {
    window.simpleLestVuexShareSpace = () => {
        ds('print', shareSpace);

        return shareSpace;
    }
}

class BuildStoreNS {
    constructor(ns = '') {
        shareSpace.mutation[ns] = {};
        shareSpace.action[ns] = [];
        shareSpace.getter[ns] = [];
        shareSpace.state[ns] = [];
    
        this.ns = ns;
        this.store = {
            actions: {},
            getters: {},
            mutations: {},
            states: {},
        };
    }

    getShareStore() {
        ds('print', shareSpace);

        return shareSpace;
    }

    setScope(name) {
        this.ns = ns === '' ? name : ns;
    }

    getNamespace(name) {
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

    // state快速设置
    speedSetState(localName, params) {
        const { ns, store } = this;
        const name = this.getNamespace(localName);
        const an = this.getActionName(name);

        d('create speed set state: ', `${localName} to ${ns} > ${an}`);
        
        store.states[name] = params; // 设置state
        store.getters[name] = state => state[name]; // 默认getter
        
        // 默认action
        store.actions[an] = ({ state }, payload) => {
          state[name] = payload;
          state[ns][localName] = payload;
        };
        
        // 默认mutation
        store.mutations[name] = function (state, payload) {
          state[name] = payload;
          state[ns][localName] = payload;
        };
    
        shareSpace.action[ns].push(an);
        shareSpace.getter[ns].push(name);
        shareSpace.mutation[ns].push(name);
        shareSpace.state[ns].push(name);
    }

    // 自定义设置mutation
    mutation(n = '', cb = () => {}) {
        const { ns, store } = this;
        const name = this.getNamespace(n);

        d('create mutation: ', `${ns} > ${name}`);
    
        store.mutations[name] = cb;

        shareSpace.mutation[ns].push(name);
    }

    // 自定义设置getter
    getter(n = '', cb = null) {
        const { ns, store } = this;
        const name = this.getNamespace(n);

        d('create getter: ', `${ns} > ${name}`);

        store.getters[name] = is(cb, Function) ? cb : state => state[name];

        shareSpace.getter[ns].push(name);
    }

    action(n, cb) {
        const { ns, store } = this;
        const name = this.getNamespace(n);
    
        store.actions[name] = (action, params) => {
            const actionExtend = {
                ...action,

                publish: nameList => loop(nameList, (v, k) => action.commit(this.getNamespace(k), v)),
                push: (k, v) => action.commit(this.getNamespace(k), v),
                doth: (k, payload) => action.dispatch(this.getNamespace(k), payload),
            };

            d('create action: ', `${ns} > ${name}`);

            if (!is(cb, Function)) {
                const errorMsg = `请设置${ns} > ${name}的回调方法`;

                e(errorMsg);

                throw new Error(errorMsg);
            }

            return cb(actionExtend, params);
        };
    
        shareSpace.action[ns].push(name);
    };

      
    // State
    state(stateList = {}) {
        const { ns, store } = this;
        const namespace = shareSpace;
        
        // 初始化注册
        if (!namespace.includes(ns)) {
          namespace.push(ns);

          store.states[ns] = {};
          store.getters[ns] = state => state[ns];
        }
    
        loop(stateList, (v, n) => {
          const storeState = store.states[ns];
          const name = this.getNamespace(n);
            
          // 创建state快速设置
          this.speedSetState(n, v);
          
          // 自动创建与state相关的内容
          storeState[n] = v;
          store.states[name] = v;
          
          de('create state', `${ns} > ${name}`);

          store.getters[name] = state => state[name];
          
          de('create getter', `${ns} > ${name}`);

          store.mutations[name] = (state, payload) => {
            state[name] = payload;
            storeState[n] = payload;
          };

          de('create mutation', `${ns} > ${name}`);
    
          shareSpace.getter[ns].push(name);
          shareSpace.mutation[ns].push(name);
          shareSpace.state[ns].push(name);
        });
    }   
}

export default BuildStoreNS;