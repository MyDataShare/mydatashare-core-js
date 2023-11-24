const getUrlMetadata = (metadatas, obj = null) => Object.fromEntries(
  Object.entries(metadatas).filter(
    ([metadataUuid, metadata]) => {
      const isUrl = metadata.type === 'url';
      if (obj !== null) {
        if (!('metadatas.uuid' in obj)) {
          throw new Error('Given object does not have metadata.');
        }
        return isUrl && obj['metadatas.uuid'].includes(metadataUuid);
      }
      return isUrl;
    },
  ),
);

/**
 * Return URLs of specific type for given API object from given URLs resource.
 *
 * The URLs are extracted from the given metadatas object, if found. If URLs are not
 * found, an empty list is returned
 *
 * @param {Object} obj The API object for which the URL should be extracted for.
 *   The item must support URLs, i.e. it must have a url_group_id property.
 * @param {string} urlType The type of URLs to get (subtype1 property in url metadata
 *   objects)
 * @param {Object} metadatas The value (object) of the metadatas property which can be
 *   found in the MyDataShare API responses that contain objects that support
 *   URLs, and for which there exists URLs.
 * @param {Object} config
 * @param {boolean} config.notFoundError If true, an error will be thrown if the
 *   requested URLs were not found.
 * @returns {Array.<Object>} Found URLs or empty if none was found.
 */
const getUrls = (obj, urlType, metadatas, { notFoundError } = {}) => {
  let ret = [];
  const handleNotFound = (msg) => {
    if (notFoundError) throw new Error(msg);
  };
  if (!metadatas) {
    handleNotFound('Did not receive metadatas');
    return ret;
  }

  let urls;
  try {
    urls = getUrlMetadata(metadatas, obj);
  } catch (e) {
    handleNotFound('Given object does not have metadata.');
    return ret;
  }

  ret = Object.values(urls).filter((m) => m.subtype1 === urlType);
  return ret;
};

// eslint-disable-next-line import/prefer-default-export
export { getUrlMetadata, getUrls };
