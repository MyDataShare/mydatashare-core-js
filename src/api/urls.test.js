import { getUrls } from './urls';
import { deepFreeze } from '../test-util';

const URL = deepFreeze({
  suppressed_fields: [],
  subtype1: 'website',
  uuid: 'url2_2',
  model: 'id_provider',
  updated: '2021-10-13T06:00:49.655277+00:00',
  subtype2: null,
  deleted: false,
  model_uuid: '2',
  json_data: {
    name: 'url name 4',
    method_type: 'get',
    url: 'https://example.com',
    url_type: 'website',
  },
  created: '2021-10-13T06:00:49.655263+00:00',
  name: 'website',
  type: 'url',
});

const METADATAS = deepFreeze({
  url1_1: {
    suppressed_fields: [],
    subtype1: 'icon_medium',
    uuid: 'url1_1',
    model: 'id_provider',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '1',
    json_data: {
      name: 'url name 1',
      method_type: 'get',
      url: 'https://example.com',
      url_type: 'icon_medium',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'icon',
    type: 'url',
  },
  url1_2: {
    suppressed_fields: [],
    subtype1: 'openid_configuration',
    uuid: 'url1_2',
    model: 'id_provider',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '1',
    json_data: {
      name: 'OpenID configuration',
      method_type: 'get',
      url: 'https://example.com',
      url_type: 'openid_configuration',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'OpenID configuration',
    type: 'url',
  },
  url2_1: {
    suppressed_fields: [],
    subtype1: 'icon_small',
    uuid: 'url2_1',
    model: 'id_provider',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '2',
    json_data: {
      name: 'small icon',
      method_type: 'get',
      url: 'https://example.com',
      url_type: 'icon_small',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'small icon',
    type: 'url',
  },
  url2_2: URL,
});

const OBJ_WITH_URLS = Object.freeze({ model: 'id_provider', uuid: '2', 'metadatas.uuid': ['url2_1', 'url2_2'] });
const OBJ_WITHOUT_URLS = Object.freeze({ model: 'id_provider', uuid: '3', 'metadatas.uuid': ['url3_1', 'url3_2'] });

describe('extracting url', () => {
  test('succeeds when url exists', () => {
    expect(getUrls(OBJ_WITH_URLS, 'website', METADATAS)).toEqual([URL]);
  });

  test('empty list is returned when url_type not found', () => {
    expect(getUrls(OBJ_WITH_URLS, 'icon_medium', METADATAS)).toHaveLength(0);
  });

  test('empty list is returned when urls object is undefined', () => {
    expect(getUrls(OBJ_WITH_URLS, 'website', undefined)).toHaveLength(0);
  });

  test('empty list is returned when urls object is null', () => {
    expect(getUrls(OBJ_WITH_URLS, 'website', null)).toHaveLength(0);
  });

  test('empty list is returned when urls object is empty', () => {
    expect(getUrls(OBJ_WITH_URLS, 'website', {})).toHaveLength(0);
  });

  test("empty list is returned when given object doesn't have urls", () => {
    expect(getUrls(OBJ_WITHOUT_URLS, 'website', METADATAS)).toHaveLength(0);
  });
});
