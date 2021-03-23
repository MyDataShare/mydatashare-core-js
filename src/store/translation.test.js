import { Translation } from './translation';
import { store } from '.';
import { deepFreeze } from '../test-util';

const finName1 = Object.freeze({
  uuid: '11',
  translation_id: 1,
  field_name: 'name',
  translation: 'Nimi 1',
});

const finDesc1 = Object.freeze({
  uuid: '12',
  translation_id: 1,
  field_name: 'description',
  translation: 'Kuvaus 1',
});

const finName2 = Object.freeze({
  uuid: '21',
  translation_id: 2,
  field_name: 'name',
  translation: 'Nimi 2',
});

const finDesc2 = Object.freeze({
  uuid: '22',
  translation_id: 2,
  field_name: 'description',
  translation: 'Kuvaus 2',
});

const engName1 = Object.freeze({
  uuid: '31',
  translation_id: 1,
  field_name: 'name',
  translation: 'Name',
});

const engDesc1 = Object.freeze({
  uuid: '32',
  translation_id: 1,
  field_name: 'description',
  translation: 'Description',
});

const engName2 = Object.freeze({
  uuid: '41',
  translation_id: 2,
  field_name: 'name',
  translation: 'Name 2',
});

const engDesc2 = Object.freeze({
  uuid: '42',
  translation_id: 2,
  field_name: 'description',
  translation: 'Description 2',
});

const TRANSLATIONS = deepFreeze({
  fin: {
    1: {
      name: { ...finName1 },
      description: {
        ...finDesc1,
      },
    },
    2: {
      name: {
        ...finName2,
      },
      description: {
        ...finDesc2,
      },
    },
  },
  eng: {
    1: {
      name: {
        ...engName1,
      },
      description: {
        ...engDesc1,
      },
    },
    2: {
      name: {
        ...engName2,
      },
      description: {
        ...engDesc2,
      },
    },
  },
});

const PARSED_TRANSLATIONS = deepFreeze({
  fin: {
    1: {
      name: new Translation(null, {
        ...finName1,
      }),
      description: new Translation(null, {
        ...finDesc1,
      }),
    },
    2: {
      name: new Translation(null, {
        ...finName2,
      }),
      description: new Translation(null, {
        ...finDesc2,
      }),
    },
  },
  eng: {
    1: {
      name: new Translation(null, {
        ...engName1,
      }),
      description: new Translation(null, {
        ...engDesc1,
      }),
    },
    2: {
      name: new Translation(null, {
        ...engName2,
      }),
      description: new Translation(null, {
        ...engDesc2,
      }),
    },
  },
});

const BY_UUID = deepFreeze({
  11: new Translation(null, { ...finName1 }),
  12: new Translation(null, { ...finDesc1 }),
  21: new Translation(null, { ...finName2 }),
  22: new Translation(null, { ...finDesc2 }),
  31: new Translation(null, { ...engName1 }),
  32: new Translation(null, { ...engDesc1 }),
  41: new Translation(null, { ...engName2 }),
  42: new Translation(null, { ...engDesc2 }),
});

beforeAll(() => {
  store.clear();
});

describe('parsing translations', () => {
  test('translation objects are parsed', () => {
    const parsed = Translation.parse({ translations: TRANSLATIONS }, null);
    expect(parsed).toEqual(PARSED_TRANSLATIONS);
  });

  test('returns empty if api response is empty', () => {
    expect(Translation.parse({}, null)).toEqual({});
  });

  test('returns empty if api response does not have translations key', () => {
    expect(Translation.parse({ urls: {} }, null)).toEqual({});
  });

  test('returns empty if translations is empty', () => {
    expect(Translation.parse({ translations: {} }, null)).toEqual({});
  });
});

describe('retrieving translations', () => {
  test('by uuid works', () => {
    store.translations = PARSED_TRANSLATIONS;
    expect(Translation.byUuid(store)).toEqual(BY_UUID);
  });

  test('as array works', () => {
    store.translations = PARSED_TRANSLATIONS;
    expect(Translation.asArray(store)).toEqual(Object.values(BY_UUID));
  });
});
