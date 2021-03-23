import TranslationBase from './translation-base';
import { getUrls } from '../../api/urls';

/**
 * Base class for API objects that support both translations and URLs.
 * @augments TranslationBase
 */
class TranslationUrlBase extends TranslationBase {
  constructor(...args) {
    if (new.target === TranslationUrlBase) {
      throw new TypeError('TranslationUrlBase must be extended');
    }
    super(...args);
  }

  /**
     * Return all URLs of this object with given type.
     * @param {string} urlType The type of URLs to get (url_type property in url
     *   objects)
     * @returns {Array<Object>}
     */
  getUrls(urlType) {
    return getUrls(this, urlType, this.store.urls, {
      notFoundError: true,
    });
  }
}

export default TranslationUrlBase;
