/* eslint-disable max-classes-per-file */

import {
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  FetchRequestor,
  GRANT_TYPE_AUTHORIZATION_CODE,
  RedirectRequestHandler,
  TokenRequest,
  TokenResponse,
} from '@openid/appauth';
import { getMdsCoreConfig } from '../config';
import {
  getConfig,
  getOidConfigFromConfig,
  removeConfig,
  saveConfig,
} from '../storage';
import {
  decodeJwt,
  getHashParams,
  parseQueryString,
} from '../utils';
import TranslationUrlBase from './base/translation-url-base';

let defaultConfig = {
  backgroundFetchOidConfig: true,
};

const getOptions = () => {
  const globalConfig = getMdsCoreConfig();
  let config = { ...defaultConfig };
  if ('AuthItem' in globalConfig) {
    config = { ...config, ...globalConfig.AuthItem };
  }
  return config;
};

const getOidConfigUrl = (idProvider, metadatas) => {
  const oidConfigUrl = Object.values(metadatas).find(
    (metadata) => (
      metadata.model_uuid === idProvider.uuid
      && metadata.type === 'url'
      && metadata.subtype1 === 'openid_configuration'
    ),
  );
  if (!oidConfigUrl) {
    return null;
  }
  return oidConfigUrl.json_data.url;
};

const fetchOidConfig = async (url) => {
  let issuerBaseUrl = url;
  if (url.endsWith('/.well-known/openid-configuration')) {
    issuerBaseUrl = url.slice(0, -33);
  }
  let response;
  try {
    response = await AuthorizationServiceConfiguration.fetchFromIssuer(
      issuerBaseUrl,
      new FetchRequestor(),
    );
  } catch (error) {
    return Promise.resolve(null);
  }
  return response;
};

const generateNonce = () => {
  const buffer = new Uint8Array(128);
  window.crypto.getRandomValues(buffer);
  const state = [];
  const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < buffer.byteLength; i += 1) {
    const index = buffer[i] % CHARSET.length;
    state.push(CHARSET[index]);
  }
  return state.join('');
};

const buildAuthorizationRequest = (
  extra,
  clientId,
  redirectUri,
  scope,
  { state } = {},
) => {
  const extras = {
    ...(typeof extra === 'string' || extra instanceof String
      ? parseQueryString(extra)
      : extra),
    response_mode: 'fragment',
    nonce: generateNonce(),
  };
  return new AuthorizationRequest({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
    state,
    extras,
  });
};

/**
 * Represents an auth_item API object.
 * @augments TranslationUrlBase
 */
class AuthItem extends TranslationUrlBase {
  constructor(
    store,
    properties,
    {
      extra, oidConfigUrl, fetchingOidConfig, oidConfig,
    } = {},
  ) {
    super(store, properties);
    this.extra = extra;
    this.oidConfigUrl = oidConfigUrl;
    this.fetchingOidConfig = fetchingOidConfig;
    this.oidConfig = oidConfig;
  }

  /**
   * Fetch this AuthItem's OID configuration object from the issuer.
   *
   * This also sets this AuthItem's `oidConfig` property to the fetched object.
   *
   * @returns {Promise<AuthorizationServiceConfiguration>} AppAuth
   *   AuthorizationServiceConfiguration object, use toJson() to convert it into
   *   a regular object.
   */
  async fetchOidConfig() {
    if (!this.oidConfigUrl) {
      return Promise.reject(
        new Error('Cannot fetch OID configuration because this.oidConfigUrl is not set.'),
      );
    }
    const oidConfig = await fetchOidConfig(this.oidConfigUrl);
    if (!oidConfig) {
      return Promise.reject(new Error('Could not fetch OID configuration.'));
    }
    this.oidConfig = oidConfig;
    return Promise.resolve(oidConfig);
  }

  /**
   * Return this AuthItem's IdProvider from the store.
   * @returns {IdProvider|null}
   */
  getIdProvider() {
    const uuid = this.id_provider_uuid;
    const defaultValue = null;
    const { idProviders } = this.store;
    if (!Object.keys(idProviders).length || !(uuid in idProviders)) {
      return defaultValue;
    }
    return idProviders[uuid];
  }

  /**
   * Redirect user to authorize using given this AuthItem.
   *
   * The fragment response mode is always used, meaning this library instructs the IdP to return
   * the authorization code and other parameters in the fragment part of the login redirect URI.
   *
   * @param {string} clientId Client ID registered with the IdProvider of given AuthItem.
   * @param {string} redirectUri The redirect_uri registered for the given client.
   * @param {string} scope A space separated string of scopes to request from the
   *   IdProvider.
   * @param {Object} config
   * @param config.state Optional oauth 2.0 state parameter to use during
   *   authorization flow. The state parameter is verified as described in
   *   [RFC 6749]{@link https://tools.ietf.org/html/rfc6749#section-10.12}.
   *   If state is not given, a secure state is generated automatically.
   * @returns {Promise<void>}
   * @see {@link authorizationCallback}
   */
  async performAuthorization(
    clientId,
    redirectUri,
    scope,
    { state } = {},
  ) {
    if (this.fetchingOidConfig instanceof Promise) {
      this.oidConfig = await this.fetchingOidConfig;
    } else if (!(this.oidConfig instanceof AuthorizationServiceConfiguration)) {
      this.oidConfig = await fetchOidConfig(this.oidConfigUrl);
    }
    if (!this.oidConfig) return Promise.reject(new Error("AuthItem doesn't have OpenID configuration"));

    const request = buildAuthorizationRequest(
      this.extra,
      clientId,
      redirectUri,
      scope,
      { state },
    );

    saveConfig('nonce', request.extras.nonce);
    saveConfig('oidConfig', JSON.stringify(this.oidConfig.toJson()));

    return new RedirectRequestHandler().performAuthorizationRequest(
      this.oidConfig,
      request,
    );
  }

  /**
   * Setter for `oidConfig`.
   *
   * This can be used to set `oidConfig` manually. Usually this is not needed.
   *
   * By default, {@link parseApiResponse} is configured to fetch OID configs for
   * AuthItems in the background.
   * {@link fetchOidConfig} can also be used to fetch the OID configuration
   * object from issuer if it wasn't fetched during parsing.
   *
   * The OID configuration will also be fetched automatically in
   * {@link performAuthorization} if it hasn't been set.
   *
   * @param oidConfig
   */
  setOidConfig(oidConfig) {
    this.oidConfig = oidConfig;
  }
}

AuthItem.resourceName = 'authItem';

/**
 * Get the full endpoint URL of this object.
 *
 * @see {@link configureMdsCore}
 * @returns {string}
 */
AuthItem.getEndpoint = () => {
  const config = getMdsCoreConfig();
  return `${config.apiBaseUrl}/public/${config.apiVersion}/auth_items`;
};

/**
 * Configure AuthItem behavior.
 * @param {Object} config
 * @param {boolean} config.backgroundFetchOidConfig Whether to fetch OID configurations for
 *   found IdProviders in background during [parseApiResponse]{@link Store#parseApiResponse}.
 *   Defaults to `true`.
 */
AuthItem.configure = (config) => {
  defaultConfig = { ...defaultConfig, ...config };
};

const createAuthItems = (store, idProvider, metadatas, authItems) => {
  const oidConfigUrl = getOidConfigUrl(idProvider, metadatas);
  const ret = {};
  if (!oidConfigUrl) return ret;
  let fetchingOidConfig;
  if (getOptions().backgroundFetchOidConfig) {
    fetchingOidConfig = fetchOidConfig(oidConfigUrl);
  }
  authItems.forEach((authItem) => {
    const extra = authItem.auth_params ? authItem.auth_params : undefined;
    ret[authItem.uuid] = new AuthItem(store, authItem, {
      extra,
      oidConfigUrl,
      fetchingOidConfig,
    });
  });
  return ret;
};

AuthItem.parse = function parse(apiResponse, store) {
  if (
    !Object.keys(apiResponse).length
    || !('id_providers' in apiResponse)
    || !Object.keys(apiResponse.id_providers).length
    || !('metadatas' in apiResponse)
    || !Object.keys(apiResponse.metadatas).length
  ) {
    return {};
  }
  let authItems = {};
  Object.entries(apiResponse.id_providers).forEach((entry) => {
    const [idpUuid, idp] = entry;
    let currentItems = [];
    currentItems = Object.values(apiResponse.auth_items).filter(
      (item) => item.id_provider_uuid === idpUuid,
    );
    if (currentItems.length) {
      const items = createAuthItems(store, idp, apiResponse.metadatas, currentItems);
      if (Object.keys(items).length) authItems = { ...authItems, ...items };
    }
  });
  return authItems;
};

/**
 * Contains a user's ID and access tokens after successful authorization.
 */
class AuthorizationData {
  constructor({ accessToken, idToken } = {}) {
    /**
     * @type string
     */
    this.accessToken = accessToken;
    /**
     * @type string
     */
    this.idToken = idToken;
  }
}

const tokenCallback = (response) => {
  const jwtPayload = decodeJwt(response.idToken).payload;
  const expectedNonce = getConfig('nonce');
  removeConfig('nonce');
  if (!expectedNonce) {
    return Promise.reject(new Error('Nonce was not generated for authorization request.'));
  }
  if (expectedNonce !== jwtPayload.nonce) {
    return Promise.reject(new Error('IdToken nonce is invalid.'));
  }

  saveConfig('idToken', response.idToken);
  return Promise.resolve(
    new AuthorizationData({
      accessToken: response.accessToken,
      idToken: response.idToken,
    }),
  );
};

const performTokenRequest = async (
  authorizationRequest,
  authorizationResponse,
  clientId,
  redirectUri,
) => {
  if (
    authorizationResponse
      && authorizationResponse instanceof AuthorizationResponse
  ) {
    const tokenRequest = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: authorizationResponse.code,
      refresh_token: undefined,
      extras:
          authorizationRequest && authorizationRequest.internal
            ? { code_verifier: authorizationRequest.internal.code_verifier }
            : null,
    });
    const tokenHandler = new BaseTokenRequestHandler(new FetchRequestor());
    let tokenResponse;
    try {
      const oidConfig = getOidConfigFromConfig();
      if (!oidConfig) {
        return Promise.reject(
          new Error('Cannot perform token request – OID Config not found in storage.'),
        );
      }
      tokenResponse = await tokenHandler.performTokenRequest(
        oidConfig,
        tokenRequest,
      );
    } catch (error) {
      return Promise.reject(new Error(`Token request error: ${JSON.stringify(error)}`));
    }
    if (tokenResponse && tokenResponse instanceof TokenResponse) {
      return tokenCallback(tokenResponse);
    }
    return Promise.reject(new Error('Valid token response not received'));
  }
  return Promise.reject(new Error('Authorization response not received in listener'));
};

/**
 * Parse authorization response from the URL and perform a token request.
 *
 * @param {string} clientId The client ID to use.
 * @param {string} redirectUri The redirect_uri registered for given client.
 * @returns {Promise<AuthorizationData>} Returns a Promise which resolves with
 *   access and id token information.
 */
const authorizationCallback = async (clientId, redirectUri) => {
  const params = getHashParams();

  if (params.error) {
    return Promise.reject(
      new Error(`Authorization error: ${JSON.stringify(params.error)}`),
    );
  }

  if (!params.code) {
    return Promise.reject(new Error('Authorization code not received.'));
  }

  const authorizationHandler = new RedirectRequestHandler();
  const result = await authorizationHandler.completeAuthorizationRequest();
  if (!result) {
    return Promise.reject(new Error('No valid authorization code callback.'));
  }
  return performTokenRequest(
    result.request,
    result.response,
    clientId,
    redirectUri,
  );
};

/**
 * Navigate to the end_session endpoint for logging out the user.
 *
 * If the config values needed for navigating to end_session endpoint
 * (id_token_hint, OID configuration) are not found in LocalStorage, the user
 * will not be taken to the end_session_endpoint and instead this method will
 * return false. This can happen for example if a user clears the browser's
 * cache.
 *
 * When false is returned, ending any possible local sessions should be handled
 * manually.
 *
 * @returns {boolean} Whether navigation to end_session endpoint succeeded.
 */
const endSession = (postLogoutRedirectUri) => {
  // TODO: Explore how id_token_hint could be left out of Gluu's end_session
  //  request (docs say it should be optional). That way we wouldn't have to
  //  save ID token to localstorage.
  const idToken = getConfig('idToken');
  removeConfig('idToken');
  if (!idToken) {
    return false;
  }

  const oidConfig = getOidConfigFromConfig();
  removeConfig('oidConfig');
  if (!oidConfig) {
    return false;
  }

  // Append post_logout_redirect_uri to the end_session_endpoint
  const endSessionEndpoint = new URL(oidConfig.endSessionEndpoint);
  endSessionEndpoint.searchParams.append(
    'post_logout_redirect_uri',
    postLogoutRedirectUri,
  );
  oidConfig.endSessionEndpoint = endSessionEndpoint.toString();

  // TODO: On error Gluu responds with JSON instead of HTML and user gets stuck
  window.location.assign(
    `${oidConfig.endSessionEndpoint}&id_token_hint=${idToken}`,
  );
  return true;
};

export {
  AuthItem,
  AuthorizationData,
  authorizationCallback,
  endSession,
  fetchOidConfig,
  getOidConfigUrl,
  tokenCallback,
};
