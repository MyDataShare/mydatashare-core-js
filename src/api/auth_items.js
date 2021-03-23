import { AuthItem } from '../store';
import { fetchAllPages } from '.';

/**
 * Fetch the auth_items endpoint of the MyDataShare API.
 *
 * @param {Object} config
 * @param {boolean} config.fetchAll If true (default), fetches as many times as
 *   there are paginated responses and combines the responses to a single
 *   object.
 * @returns {Promise<Object>}
 * @see {@link fetchAllPages}
 * @see {@link combinePaginatedResponses}
 */
const fetchAuthItems = async ({ fetchAll } = {}) => {
  const url = AuthItem.getEndpoint();
  const options = { method: 'POST' };
  if (!(fetchAll === false)) {
    return fetchAllPages(url, { options });
  }
  const result = await fetch(url, options);
  return result.json();
};

// eslint-disable-next-line import/prefer-default-export
export { fetchAuthItems };
