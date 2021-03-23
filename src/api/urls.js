/**
 * Return URLs of specific type for given API object from given URLs resource.
 *
 * The URLs are extracted from the given urls object, if found. If URLs are not
 * found, an empty list is returned
 *
 * @param {Object} obj The API object for which the URL should be extracted for.
 *   The item must support URLs, i.e. it must have a url_group_id property.
 * @param {string} urlType The type of URLs to get (url_type property in url
 *   objects)
 * @param {Object} urls The value (object) of the urls property which can be
 *   found in the MyDataShare API responses that contain objects that support
 *   URLs, and for which there exists URLs.
 * @param {Object} config
 * @param {boolean} config.notFoundError If true, an error will be thrown if the
 *   requested URLs were not found.
 * @returns {Array.<Object>} Found URLs or empty if none was found.
 */
const getUrls = (obj, urlType, urls, { notFoundError } = {}) => {
  let ret = [];
  const handleNotFound = (msg) => {
    if (notFoundError) throw new Error(msg);
  };
  if (!urls) {
    handleNotFound('Did not receive urls');
    return ret;
  }
  if (!(obj.url_group_id in urls)) {
    handleNotFound(`No urls exist for url_group_id ${obj.url_group_id}`);
    return ret;
  }
  ret = urls[obj.url_group_id].filter((url) => url.url_type === urlType);
  if (!ret) {
    handleNotFound(
      `No urls with url_type "${urlType}" exist in group ${obj.url_group_id}`,
    );
  }
  return ret;
};

// eslint-disable-next-line import/prefer-default-export
export { getUrls };
