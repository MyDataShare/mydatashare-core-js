import { getUrls } from './urls';
import { deepFreeze } from '../test-util';

const URL = deepFreeze({
  name: 'url name 4',
  method_type: 'get',
  subgroup: 1,
  translation_id: 44,
  url: 'https://example.com',
  uuid: '444',
  url_type: 'website',
});

const URLS = deepFreeze({
  1: [
    {
      name: 'url name 1',
      method_type: 'get',
      subgroup: null,
      translation_id: 11,
      url: 'https://example.com',
      uuid: '111',
      url_type: 'icon_medium',
    },
    {
      name: 'OpenID configuration',
      method_type: 'get',
      subgroup: 1,
      translation_id: 22,
      url: 'https://example.com',
      uuid: '222',
      url_type: 'openid_configuration',
    },
  ],
  2: [
    {
      name: 'url name 3',
      method_type: 'get',
      subgroup: null,
      translation_id: 33,
      url: 'https://example.com',
      uuid: '333',
      url_type: 'icon_small',
    },
    URL,
  ],
});

const OBJ_WITH_URLS = Object.freeze({ url_group_id: 2 });
const OBJ_WITHOUT_URLS = Object.freeze({ url_group_id: 42 });

describe('extracting url', () => {
  test('succeeds when url exists', () => {
    expect(getUrls(OBJ_WITH_URLS, 'website', URLS)).toEqual([URL]);
  });

  test('empty list is returned when url_type not found', () => {
    expect(getUrls(OBJ_WITH_URLS, 'icon_medium', URLS)).toHaveLength(0);
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
    expect(getUrls(OBJ_WITHOUT_URLS, 'website', URLS)).toHaveLength(0);
  });
});
