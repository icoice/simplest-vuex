export const is = (v, t = '') => {
    if (t === 'object') return typeof v === 'object' && v !== null && !(v instanceof Array);
    if (t === 'promise' || t === Promise) return v instanceof Promise || (typeof v === 'object' && v !== null && typeof v.then === 'function' && typeof v.catch === 'function');
    if (t === 'null' || t === null) return v === null;
    if (t === 'array') return v instanceof Array;
    if (t === 'formData') return v instanceof FormData;
    if (typeof t !== 'string') return v instanceof t;

    return typeof v === t;
}

export const firstUppercase = word => {
    if (typeof word !== 'string') return word;

    const firstLetter = word.charAt(0);

    return `${firstLetter.toUpperCase()}${word.slice(1, word.length)}`;
}

export const def = (v, d) => is(v, 'undefined') ? d : v;
export const loop = (v, cb = () => {}) => Object.entries(v).map(([k, v]) => cb(v, k));
export const empty = v => (v === '' || v === null || JSON.stringify(v) === '{}' || JSON.stringify(v) === '[]' || is(v, 'undefined'));