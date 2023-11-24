/**
 * Combine a list of objects received from MyDataShare API into a single object.
 * The responses should be the unmodified full JSON responses as they are
 * received from the API.
 *
 * The MyDataShare API is paginated. A response will contain the property
 * next_offset if there are more data to fetch that was left out from the
 * response. Take the value of next_offset and pass it in the property offset in
 * the JSON body of a search endpoint request to use it.
 *
 * @param {Array.<Object>} responses A list of objects to merge into one.
 * @returns {Object}
 */
const combinePaginatedResponses = (responses) => {
  if (!responses.length) {
    throw new Error('No JSON argument given.');
  }
  const combined = JSON.parse(JSON.stringify(responses[0])); // "Deep copy"
  if (responses.length === 1) {
    return combined;
  }

  responses.slice(1).forEach((currentPage) => {
    Object.entries(currentPage).forEach((entry) => {
      const [resourceName, resources] = entry;
      if (typeof resources === 'object' && resources) {
        if (!(resourceName in combined)) combined[resourceName] = {};
        Object.assign(combined[resourceName], resources);
      }
    });
  });
  return combined;
};

/**
 * Fetch a resource from the MyDataShare API, and if there are enough data for
 * the response to be paginated, fetch all the remaining pages and combine the
 * responses into a single object.
 *
 * @param {string} url The full URL to fetch.
 * @param {Object} config
 * @param {Object} config.options Options to pass to the fetch call(s).
 * @returns {Promise<Object>}
 * @see {@link combinePaginatedResponses}
 */
const fetchAllPages = async (url, { options } = {}) => {
  const ret = [];
  let response; let json; let
    fetchConfig;
  const params = { offset: 0 };
  // eslint-disable-next-line no-constant-condition
  while (true) {
    fetchConfig = { ...options };
    // We must await in a loop, because we don't know if we need to continue looping until after
    // the promise has been resolved.
    // eslint-disable-next-line no-await-in-loop
    response = await fetch(`${url}?${new URLSearchParams(params)}`, fetchConfig);
    if (!response.ok) {
      return Promise.reject(new Error(response.statusText));
    }
    // eslint-disable-next-line no-await-in-loop
    json = await response.json();
    ret.push(json);
    if ('next_offset' in json) {
      params.offset = json.next_offset;
    } else {
      break;
    }
  }
  return Promise.resolve(combinePaginatedResponses(ret));
};

export { combinePaginatedResponses, fetchAllPages };
