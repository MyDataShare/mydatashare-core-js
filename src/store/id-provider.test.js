import { deepFreeze } from '../test-util';
import { IdProvider } from './id-provider';
import { store } from './index';

const idp1 = deepFreeze({
  uuid: '1',
  name: 'idp1 name',
  description: 'idp1 desc',
});

const idp2 = deepFreeze({
  uuid: '2',
  name: 'idp2 name',
  description: 'idp2 desc',
});

const ID_PROVIDERS = deepFreeze({
  1: idp1,
  2: idp2,
});

const PARSED_ID_PROVIDERS = deepFreeze({
  1: new IdProvider(null, { ...idp1 }),
  2: new IdProvider(null, { ...idp2 }),
});

const BY_UUID = deepFreeze({ ...PARSED_ID_PROVIDERS });

beforeAll(() => {
  store.clear();
});

describe('parsing id providers', () => {
  test('id provider objects are parsed', () => {
    const parsed = IdProvider.parse({ id_providers: ID_PROVIDERS }, null);
    expect(parsed).toEqual(PARSED_ID_PROVIDERS);
  });

  test('returns empty if api response is empty', () => {
    expect(IdProvider.parse({}, null)).toEqual({});
  });

  test('returns empty if api response does not have id_providers key', () => {
    expect(IdProvider.parse({ translations: {} }, null)).toEqual({});
  });

  test('returns empty if translations is empty', () => {
    expect(IdProvider.parse({ id_providers: {} }, null)).toEqual({});
  });
});

describe('retrieving id providers', () => {
  test('by uuid works', () => {
    store.idProviders = PARSED_ID_PROVIDERS;
    expect(IdProvider.byUuid(store)).toEqual(BY_UUID);
  });

  test('as array works', () => {
    store.idProviders = PARSED_ID_PROVIDERS;
    expect(IdProvider.asArray(store)).toEqual(Object.values(BY_UUID));
  });
});
