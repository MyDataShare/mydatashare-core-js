import { deepFreeze } from '../test-util';
import { Url } from './url';
import { store } from './index';

const url1 = deepFreeze({
  name: 'url name 1',
  method_type: 'get',
  subgroup: null,
  translation_id: 11,
  url: 'https://example.com',
  uuid: '11',
  url_type: 'icon_medium',
});

const url2 = deepFreeze({
  name: 'OpenID configuration',
  method_type: 'get',
  subgroup: 1,
  translation_id: 22,
  url: 'https://example.com',
  uuid: '22',
  url_type: 'openid_configuration',
});

const url3 = deepFreeze({
  name: 'url name 3',
  method_type: 'get',
  subgroup: null,
  translation_id: 33,
  url: 'https://example.com',
  uuid: '33',
  url_type: 'icon_small',
});

const URLS = deepFreeze({
  1: [
    {
      ...url1,
    },
    {
      ...url2,
    },
  ],
  2: [
    {
      ...url3,
    },
  ],
});

const PARSED_URLS = deepFreeze({
  1: [new Url(null, { ...url1 }), new Url(null, { ...url2 })],
  2: [new Url(null, { ...url3 })],
});

const BY_UUID = deepFreeze({
  11: new Url(null, { ...url1 }),
  22: new Url(null, { ...url2 }),
  33: new Url(null, { ...url3 }),
});

beforeAll(() => {
  store.clear();
});

describe('parsing urls', () => {
  test('url objects are parsed', () => {
    const parsed = Url.parse({ urls: URLS }, null);
    expect(parsed).toEqual(PARSED_URLS);
  });

  test('returns empty if api response is empty', () => {
    expect(Url.parse({}, null)).toEqual({});
  });

  test('returns empty if api response does not have translations key', () => {
    expect(Url.parse({ translations: {} }, null)).toEqual({});
  });

  test('returns empty if translations is empty', () => {
    expect(Url.parse({ urls: {} }, null)).toEqual({});
  });
});

describe('retrieving urls', () => {
  test('by uuid works', () => {
    store.urls = PARSED_URLS;
    expect(Url.byUuid(store)).toEqual(BY_UUID);
  });

  test('as array works', () => {
    store.urls = PARSED_URLS;
    expect(Url.asArray(store)).toEqual(Object.values(BY_UUID));
  });
});
