import TranslationBase from './base/translation-base';

const STORE_KEY = 'urls';

/**
 * Represents a url API object.
 * @augments TranslationBase
 */
class Url extends TranslationBase {}

Url.resourceName = 'url';

Url.byUuid = function byUuid(store) {
  const ret = {};
  if (!(STORE_KEY in store) || !Object.keys(store[STORE_KEY]).length) {
    return ret;
  }
  Object.values(store[STORE_KEY]).forEach((urlGroup) => {
    urlGroup.forEach((url) => {
      ret[url.uuid] = url;
    });
  });
  return ret;
};

Url.parse = function parse(apiResponse, store) {
  const ret = {};
  if (
    !Object.keys(apiResponse).length
    || !('urls' in apiResponse)
    || !Object.keys(apiResponse.urls).length
  ) {
    return ret;
  }
  Object.entries(apiResponse.urls).forEach((entry) => {
    const [urlGroupId, urlGroup] = entry;
    ret[urlGroupId] = [];
    urlGroup.forEach((url) => {
      ret[urlGroupId].push(new Url(store, url));
    });
  });
  return ret;
};

// eslint-disable-next-line import/prefer-default-export
export { Url };
