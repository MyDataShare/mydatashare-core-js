import {
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
} from '@openid/appauth';
import {
  AuthItem,
  authorizationCallback,
  AuthorizationData,
  endSession,
  store,
  tokenCallback,
} from '.';
import { IdProvider } from './id-provider';

const CLIENT_ID = 'test client id';
const REDIRECT_URI = 'https://example.com/logout';
const SCOPE = 'openid email';
const OID_CONFIG_URL = 'this is the OID config URL';
const OID_CONFIG_URL_2 = 'this is another OID config URL';
const TEST_NONCE = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
const TEST_STATE = 'BBBBBBBBBB';

const OID_CONFIG = new AuthorizationServiceConfiguration({
  authorization_endpoint: 'https://example.com/auth_endpoint',
  token_endpoint: 'https://example.com/token_endpoint',
  revocation_endpoint: 'https://example.com/revocation_endpoint',
  userinfo_endpoint: 'https://example.com/userinfo_endpoint',
  end_session_endpoint: 'https://example.com/end_session_endpoint',
});

const ID_PROVIDER = new IdProvider(null, {
  uuid: '11',
  name: 'id_provider name 11',
  description: 'id_provider descrtipion 11',
  'metadatas.uuid': ['url1'],
});

const ID_PROVIDER_2 = new IdProvider(null, {
  uuid: '222',
  name: 'id_provider name 222',
  description: 'id_provider descrtipion 222',
  'metadatas.uuid': ['url2'],
});

const OID_CONFIG_METADATA_1 = {
  suppressed_fields: [],
  subtype1: 'openid_configuration',
  uuid: 'url1',
  model: 'id_provider',
  updated: '2021-10-13T06:00:49.655277+00:00',
  subtype2: null,
  deleted: false,
  model_uuid: '11',
  json_data: {
    name: 'url name',
    method_type: 'get',
    url_type: 'openid_configuration',
    url: OID_CONFIG_URL,
  },
  created: '2021-10-13T06:00:49.655263+00:00',
  name: 'openid_configuration',
  type: 'url',
};

const OID_CONFIG_METADATA_2 = {
  suppressed_fields: [],
  subtype1: 'openid_configuration',
  uuid: 'url2',
  model: 'id_provider',
  updated: '2021-10-13T06:00:49.655277+00:00',
  subtype2: null,
  deleted: false,
  model_uuid: '222',
  json_data: {
    name: 'url name',
    method_type: 'get',
    url_type: 'openid_configuration',
    url: OID_CONFIG_URL_2,
  },
  created: '2021-10-13T06:00:49.655263+00:00',
  name: 'openid_configuration',
  type: 'url',
};

const AUTH_ITEM = new AuthItem(null, {
  uuid: '1',
  name: 'auth_item 1 name',
  description: 'auth_item 1 description',
  id_provider_uuid: ID_PROVIDER.uuid,
});

const AUTH_ITEM_2 = new AuthItem(null, {
  uuid: '22',
  name: 'auth_item 22 name',
  description: 'auth_item 22 description',
  id_provider_uuid: ID_PROVIDER_2.uuid,
});

const AUTH_ITEM_WITH_PARAMS = new AuthItem(null, {
  uuid: '2',
  name: 'auth_item name 2',
  description: 'auth_item description 2',
  auth_params: 'param1=1&param2=2',
  id_provider_uuid: ID_PROVIDER.uuid,
});

const AUTH_ITEMS_JSON_SINGLE = Object.freeze({
  auth_items: {
    1: AUTH_ITEM,
  },
  id_providers: {
    11: ID_PROVIDER,
  },
  metadatas: {
    url1: OID_CONFIG_METADATA_1,
  },
});

const AUTH_ITEMS_JSON = Object.freeze({
  auth_items: {
    1: AUTH_ITEM,
    2: AUTH_ITEM_WITH_PARAMS,
  },
  id_providers: {
    11: ID_PROVIDER,
  },
  metadatas: {
    url1: OID_CONFIG_METADATA_1,
  },
});

const AUTH_ITEMS_JSON_MULTIPLE_IDP = Object.freeze({
  auth_items: {
    1: AUTH_ITEM,
    2: AUTH_ITEM_2,
  },
  id_providers: {
    11: ID_PROVIDER,
    222: ID_PROVIDER_2,
  },
  metadatas: {
    url1: OID_CONFIG_METADATA_1,
    url2: OID_CONFIG_METADATA_2,
  },
});

const buildTestAuthItem = (properties) => new AuthItem(
  store,
  {
    name: AUTH_ITEM.name,
    description: AUTH_ITEM.description,
  },
  {
    oidConfigUrl: 'https://example.com/openid_configuration',
    oidConfig: undefined,
    fetchingOidConfig: undefined,
    ...properties,
  },
);

const buildTestAuthRequest = (properties, extrasProperties) => Object.freeze(
  new AuthorizationRequest({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
    state: TEST_STATE,
    extras: {
      response_mode: 'fragment',
      nonce: TEST_NONCE,
      ...extrasProperties,
    },
    ...properties,
  }),
);

const mockPerformAuthorizationRequest = jest.fn();

jest.mock('@openid/appauth', () => {
  const mockAuthConfig = {
    authorizationEndpoint: 'https://example.com/auth_endpoint',
    tokenEndpoint: 'https://example.com/token_endpoint',
    revocationEndpoint: 'https://example.com/revocation_endpoint',
    endSessionEndpoint: 'https://example.com/end_session_endpoint',
    toJson: jest.fn(() => ({
      authorization_endpoint: 'https://example.com/auth_endpoint',
      token_endpoint: 'https://example.com/token_endpoint',
      revocation_endpoint: 'https://example.com/revocation_endpoint',
      end_session_endpoint: 'https://example.com/end_session_endpoint',
    })),
  };
  const mockAppAuth = {
    ...jest.requireActual('@openid/appauth'),
    AuthorizationServiceConfiguration: jest
      .fn()
      .mockImplementation(() => mockAuthConfig),
    RedirectRequestHandler: jest.fn().mockImplementation(() => ({
      performAuthorizationRequest: mockPerformAuthorizationRequest,
    })),
  };
  mockAppAuth.AuthorizationServiceConfiguration.fetchFromIssuer = jest.fn(
    () => Promise.resolve(mockAuthConfig),
  );
  return mockAppAuth;
});

beforeAll(() => {
  store.clear();
});

describe('parsing AuthItems', () => {
  test('Succeeds with single AuthItem', () => {
    AuthItem.configure({ backgroundFetchOidConfig: true });
    const authItems = AuthItem.parse(AUTH_ITEMS_JSON_SINGLE, store);
    expect(Object.values(authItems)).toHaveLength(1);
    const actual = Object.values(authItems)[0];
    expect(actual.name).toBe(AUTH_ITEM.name);
    expect(actual.description).toBe(AUTH_ITEM.description);
    expect(actual.extra).toBe(undefined);
    expect(actual.oidConfigUrl).toBe(OID_CONFIG_URL);
    expect(actual.oidConfig).toBe(undefined);
    expect(actual.fetchingOidConfig).resolves.toEqual(OID_CONFIG);
  });

  test('Succeeds with multiple auth_items', () => {
    AuthItem.configure({ backgroundFetchOidConfig: true });
    const authItems = AuthItem.parse(AUTH_ITEMS_JSON, store);
    expect(Object.values(authItems)).toHaveLength(2);
    const actual1 = Object.values(authItems)[0];
    expect(actual1.name).toBe(AUTH_ITEM.name);
    expect(actual1.description).toBe(AUTH_ITEM.description);
    expect(actual1.extra).toBe(undefined);
    expect(actual1.oidConfigUrl).toBe(OID_CONFIG_URL);
    expect(actual1.oidConfig).toBe(undefined);
    expect(actual1.fetchingOidConfig).resolves.toEqual(OID_CONFIG);

    const actual2 = Object.values(authItems)[1];
    expect(actual2.name).toBe(AUTH_ITEM_WITH_PARAMS.name);
    expect(actual2.description).toBe(AUTH_ITEM_WITH_PARAMS.description);
    expect(actual2.extra).toBe('param1=1&param2=2');
    expect(actual2.oidConfigUrl).toBe(OID_CONFIG_URL);
    expect(actual2.oidConfig).toBe(undefined);
    expect(actual2.fetchingOidConfig).resolves.toEqual(OID_CONFIG);
  });

  test('Succeeds with multiple ID providers', () => {
    AuthItem.configure({ backgroundFetchOidConfig: true });
    const authItems = AuthItem.parse(AUTH_ITEMS_JSON_MULTIPLE_IDP, store);
    expect(Object.values(authItems)).toHaveLength(2);
    const actual1 = Object.values(authItems)[0];
    expect(actual1.name).toBe(AUTH_ITEM.name);
    expect(actual1.description).toBe(AUTH_ITEM.description);
    expect(actual1.extra).toBe(undefined);
    expect(actual1.oidConfigUrl).toBe(OID_CONFIG_URL);
    expect(actual1.oidConfig).toBe(undefined);
    expect(actual1.fetchingOidConfig).resolves.toEqual(OID_CONFIG);

    const actual2 = Object.values(authItems)[1];
    expect(actual2.name).toBe(AUTH_ITEM_2.name);
    expect(actual2.description).toBe(AUTH_ITEM_2.description);
    expect(actual2.extra).toBe(undefined);
    expect(actual2.oidConfigUrl).toBe(OID_CONFIG_URL_2);
    expect(actual2.oidConfig).toBe(undefined);
    expect(actual2.fetchingOidConfig).resolves.toEqual(OID_CONFIG);
  });

  test('OID configs not fetched when configured', () => {
    AuthItem.configure({ backgroundFetchOidConfig: false });
    const authItems = AuthItem.parse(AUTH_ITEMS_JSON_SINGLE, store);
    expect(Object.values(authItems)).toHaveLength(1);
    const actual = Object.values(authItems)[0];
    expect(actual.name).toBe(AUTH_ITEM.name);
    expect(actual.description).toBe(AUTH_ITEM.description);
    expect(actual.extra).toBe(undefined);
    expect(actual.oidConfigUrl).toBe(OID_CONFIG_URL);
    expect(actual.oidConfig).toBe(undefined);
    expect(actual.fetchingOidConfig).toBe(undefined);
  });
});

describe('setting OID configuration', () => {
  test('fetch fails if OID config url is not set', () => {
    expect(() => AUTH_ITEM.fetchOidConfig()).rejects.toEqual(
      new Error('Cannot fetch OID configuration because this.oidConfigUrl is not set.'),
    );
  });

  test('fetch returns configuration and saves it to object', async () => {
    const authItem = new AuthItem(
      null,
      {
        uuid: '1',
        name: 'auth_item 1 name',
        description: 'auth_item 1 description',
        id_provider_uuid: ID_PROVIDER.uuid,
      },
      { oidConfigUrl: OID_CONFIG_URL },
    );
    expect(authItem.oidConfig).toBeUndefined();
    const oidConfig = await authItem.fetchOidConfig();
    expect(oidConfig).toEqual(OID_CONFIG);
    expect(authItem.oidConfig).toEqual(OID_CONFIG);
  });

  test('can be done using setter', () => {
    const authItem = new AuthItem(null, {});
    authItem.setOidConfig(OID_CONFIG);
    expect(authItem.oidConfig).toEqual(OID_CONFIG);
  });
});

describe('retrieving IdProvider', () => {
  test('Succees when found in store', () => {
    store.clear();
    store.idProviders[ID_PROVIDER.uuid] = ID_PROVIDER;
    const authItem = new AuthItem(store, {
      id_provider_uuid: ID_PROVIDER.uuid,
    });
    store.idProviders[ID_PROVIDER.uuid] = ID_PROVIDER;
    expect(authItem.getIdProvider()).toBe(ID_PROVIDER);
  });

  test('Returns null when IdProvider not in store', () => {
    store.clear();
    store.idProviders['123asd'] = ID_PROVIDER;
    const authItem = new AuthItem(store, {
      id_provider_uuid: ID_PROVIDER.uuid,
    });
    expect(authItem.getIdProvider()).toBeNull();
  });
});

describe('authorization performed with AuthItem', () => {
  test('pending OID config promise is used', async () => {
    const AUTH_ITEM_OID_PROMISE = buildTestAuthItem({
      fetchingOidConfig: Promise.resolve(OID_CONFIG),
    });
    await AUTH_ITEM_OID_PROMISE.performAuthorization(
      CLIENT_ID,
      REDIRECT_URI,
      SCOPE,
    );
    const authCalls = mockPerformAuthorizationRequest.mock.calls;
    expect(authCalls.length).toBe(1);
    expect(authCalls[0].length).toBe(2);
    const oidConfig = authCalls[0][0];
    expect(oidConfig).toEqual(OID_CONFIG);
    const authRequest = authCalls[0][1];
    expect(authRequest).toEqual(buildTestAuthRequest());
    expect(AUTH_ITEM_OID_PROMISE.oidConfig).toEqual(OID_CONFIG);
    expect(AUTH_ITEM_OID_PROMISE.oidConfig).toEqual(OID_CONFIG);
  });

  test('OID config property is used', async () => {
    const authItem = buildTestAuthItem({ oidConfig: OID_CONFIG });
    await authItem.performAuthorization(CLIENT_ID, REDIRECT_URI, SCOPE);
    const authCalls = mockPerformAuthorizationRequest.mock.calls;
    expect(authCalls.length).toBe(1);
    expect(authCalls[0].length).toBe(2);
    const oidConfig = authCalls[0][0];
    expect(oidConfig).toEqual(OID_CONFIG);
    const authRequest = authCalls[0][1];
    expect(authRequest).toEqual(buildTestAuthRequest());
    expect(authItem.oidConfig).toEqual(OID_CONFIG);
  });

  test('given state is used', async () => {
    const authItem = buildTestAuthItem({ oidConfig: OID_CONFIG });
    await authItem.performAuthorization(CLIENT_ID, REDIRECT_URI, SCOPE, {
      state: '123',
    });
    const authCalls = mockPerformAuthorizationRequest.mock.calls;
    expect(authCalls.length).toBe(1);
    expect(authCalls[0].length).toBe(2);
    const oidConfig = authCalls[0][0];
    expect(oidConfig).toEqual(OID_CONFIG);
    const authRequest = authCalls[0][1];
    expect(authRequest).toEqual(buildTestAuthRequest({ state: '123' }));
    expect(authItem.oidConfig).toEqual(OID_CONFIG);
  });

  test('nonce and oidConfig are saved to store', async () => {
    const authItem = buildTestAuthItem({ oidConfig: OID_CONFIG });
    await authItem.performAuthorization(CLIENT_ID, REDIRECT_URI, SCOPE);
    expect(localStorage.getItem('mds-core-localhost-nonce')).toBe(TEST_NONCE);
    expect(localStorage.getItem('mds-core-localhost-oidConfig')).toBe(
      JSON.stringify(OID_CONFIG.toJson()),
    );
  });
});

describe('authorization callback', () => {
  test('rejects promise if authorization code is not in params', async () => {
    await expect(
      authorizationCallback(CLIENT_ID, REDIRECT_URI),
    ).rejects.toEqual(new Error('Authorization code not received.'));
  });

  test('rejects promise if error in params', async () => {
    window.location.hash = '#error=oops&code=123&return_url=https://example.com#';
    await expect(
      authorizationCallback(CLIENT_ID, REDIRECT_URI),
    ).rejects.toEqual(new Error('Authorization error: "oops"'));
  });
});

// JWT payload: { "nonce": "123", "iat": 1516239022 }
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjEyMyIsImlhdCI6MTUxNjIzOTAyMn0.OyWrBJncxr9mwwN69FZLVeSK5dT2sRHgBkfay4YB4pE';
// JWT payload: { "iat": 1516239022 }
const JWT_WITHOUT_NONCE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1MTYyMzkwMjJ9.tbDepxpstvGdW8TC3G8zg4B6rUYAOvfzdceoH48wgRQ';

const TOKEN_RESPONSE = Object.freeze({
  idToken: JWT,
  accessToken: JWT,
});
const TOKEN_RESPONSE_WITHOUT_NONCE = Object.freeze({
  idToken: JWT_WITHOUT_NONCE,
  accessToken: JWT_WITHOUT_NONCE,
});

describe('token callback', () => {
  test('rejects promise if nonce not found in storage', async () => {
    localStorage.clear();
    await expect(tokenCallback(TOKEN_RESPONSE)).rejects.toEqual(
      new Error('Nonce was not generated for authorization request.'),
    );
  });

  test('rejects promise if nonce not found in id token', async () => {
    localStorage.clear();
    localStorage.setItem('mds-core-localhost-nonce', '123');
    await expect(tokenCallback(TOKEN_RESPONSE_WITHOUT_NONCE)).rejects.toEqual(
      new Error('IdToken nonce is invalid.'),
    );
  });

  test('rejects promise if id token nonce does not match stored nonce', async () => {
    localStorage.clear();
    localStorage.setItem('mds-core-localhost-nonce', '1234');
    await expect(tokenCallback(TOKEN_RESPONSE)).rejects.toEqual(
      new Error('IdToken nonce is invalid.'),
    );
  });

  test('resolves to access and id tokens', async () => {
    localStorage.clear();
    localStorage.setItem('mds-core-localhost-nonce', '123');
    await expect(tokenCallback(TOKEN_RESPONSE)).resolves.toEqual(
      new AuthorizationData({
        accessToken: TOKEN_RESPONSE.accessToken,
        idToken: TOKEN_RESPONSE.idToken,
      }),
    );
  });
});

describe('ending session', () => {
  test('fails if ID token not found in storage', () => {
    localStorage.clear();
    localStorage.setItem(
      'mds-core-localhost-oidConfig',
      JSON.stringify(OID_CONFIG.toJson()),
    );
    expect(endSession('test /logout')).toBe(false);
  });

  test('fails if OID config not found in storage', () => {
    localStorage.clear();
    localStorage.clear();
    localStorage.setItem('mds-core-localhost-idToken', 'asd');
    expect(endSession('test /logout')).toBe(false);
  });

  test('succeeds when required data found in storage', () => {
    localStorage.clear();
    localStorage.setItem(
      'mds-core-localhost-oidConfig',
      JSON.stringify(OID_CONFIG.toJson()),
    );
    localStorage.setItem('mds-core-localhost-idToken', 'asd');
    expect(endSession('test /logout')).toBe(true);
  });
});
