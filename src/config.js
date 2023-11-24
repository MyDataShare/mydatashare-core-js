let mdsCoreConfig = {
  apiBaseUrl: undefined,
  apiVersion: 'v3.0',
};

const getMdsCoreConfig = () => mdsCoreConfig;

/**
 * Configure global settings.
 *
 * @param {string} config.apiBaseUrl Base URL of the MDS API, without the domain or version prefix.
 *   For example `"https://api.mydatashare.com"`.
 * @param {string} config.apiVersion The MDS API version, defaults to `"v3.0"`.
 * @param {boolean} config.AuthItem.backgroundFetchOidConfig Whether to fetch OID configurations for
 *   found IdProviders in background during [parseApiResponse]{@link Store#parseApiResponse}.
 *   Defaults to `true`.
 */
const configureMdsCore = (config) => {
  mdsCoreConfig = { ...mdsCoreConfig, ...config };
};

export { getMdsCoreConfig, configureMdsCore };
