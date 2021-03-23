const camelToSnake = (str) => str[0].toLowerCase()
    + str
      .slice(1, str.length)
      .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Base class for API objects.
 */
class Base {
  constructor(store, properties) {
    if (new.target === Base) {
      throw new TypeError('Base must be extended');
    }
    Object.entries(properties).forEach((entry) => {
      const [name, value] = entry;
      this[name] = value;
    });
    this.store = store;
  }
}

Base.resourceName = null;

/**
 * Return objects of this type from the store as an array.
 * @param {Store} store
 * @returns {Array.<Base>}
 */
Base.asArray = function asArray(store) {
  return Object.values(this.byUuid(store));
};

/**
 * Return objects of this type from the store as an object with UUIDs as keys.
 * @param {Store} store
 * @returns {Object.<string, Base>}
 */
Base.byUuid = function byUuid(store) {
  const storeKey = `${this.resourceName}s`;
  if (!(storeKey in store) || !Object.keys(store[storeKey]).length) {
    return {};
  }
  return store[storeKey];
};

Base.parse = function parse(apiResponse, store) {
  const pluralName = `${camelToSnake(this.resourceName)}s`;
  const ret = {};
  if (
    !Object.keys(apiResponse).length
        || !(pluralName in apiResponse)
        || !Object.keys(apiResponse[pluralName]).length
  ) {
    return ret;
  }
  Object.values(apiResponse[pluralName]).forEach((obj) => {
    ret[obj.uuid] = new this(store, obj);
  });
  return ret;
};

export default Base;
