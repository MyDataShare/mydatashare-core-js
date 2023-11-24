import Base from './base';
import { getUrls } from '../..';

/**
 * Base class for API objects that support URLs.
 * @augments Base
 */
class UrlBase extends Base {
  constructor(...args) {
    if (new.target === UrlBase) {
      throw new TypeError('UrlBase must be extended');
    }
    super(...args);
  }

  /**
     * Return all URLs of this object with given type.
     * @param {string} urlType The type of URLs to get (url_type property in url metadata
     *   objects)
     * @returns {Array<Object>}
     */
  getUrls(urlType) {
    return getUrls(this, urlType, this.store.metadatas, {
      notFoundError: true,
    });
  }
}

export default UrlBase;
