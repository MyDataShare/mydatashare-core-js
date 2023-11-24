import { getTranslation, translateAll } from './translations';
import { deepFreeze } from '../test-util';

const FIELDS = ['name', 'description'];

const METADATAS = {
  fin1: {
    suppressed_fields: [],
    subtype1: 'fin',
    uuid: 'fin1',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '1',
    json_data: {
      name: 'Nimi 1',
      description: 'Kuvaus 1',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in fin',
    type: 'translation',
  },
  fin2: {
    suppressed_fields: [],
    subtype1: 'fin',
    uuid: 'fin2',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '2',
    json_data: {
      name: 'Nimi 2',
      description: 'Kuvaus 2',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in fin',
    type: 'translation',
  },
  eng1: {
    suppressed_fields: [],
    subtype1: 'eng',
    uuid: 'eng1',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '1',
    json_data: {
      name: 'Name',
      description: 'Description',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in eng',
    type: 'translation',
  },
  eng2: {
    suppressed_fields: [],
    subtype1: 'eng',
    uuid: 'eng2',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '2',
    json_data: {
      name: 'Name 2',
      description: 'Description 2',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in eng',
    type: 'translation',
  },
  swe1: {
    suppressed_fields: [],
    subtype1: 'swe',
    uuid: 'swe1',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '1',
    json_data: {
      name: 'Namn 1',
      description: 'Beskrivning 1',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in swe',
    type: 'translation',
  },
  swe2: {
    suppressed_fields: [],
    subtype1: 'swe',
    uuid: 'swe2',
    model: 'auth_item',
    updated: '2021-10-13T06:00:49.655277+00:00',
    subtype2: null,
    deleted: false,
    model_uuid: '2',
    json_data: {
      name: 'Namn 2',
    },
    created: '2021-10-13T06:00:49.655263+00:00',
    name: 'Translations in swe',
    type: 'translation',
  },
};

const ITEMS = Object.freeze([
  deepFreeze({
    uuid: '1',
    name: 'Default name 1',
    description: 'Default description 1',
    'metadatas.uuid': ['fin1', 'eng1', 'swe1'],
  }),
  deepFreeze({
    uuid: '2',
    name: 'Default name 2',
    description: 'Default description 2',
    'metadatas.uuid': ['fin2', 'eng2', 'swe2'],
  }),
]);

describe('translating a list', () => {
  test('that is empty returns an empty list', () => {
    expect(translateAll('fin', FIELDS, [], METADATAS)).toEqual([]);
  });

  test('without metadatas (null) returns defaults', () => {
    expect(translateAll('fin', FIELDS, ITEMS, null)).toEqual([
      {
        uuid: '1',
        name: 'Default name 1',
        description: 'Default description 1',
        'metadatas.uuid': ['fin1', 'eng1', 'swe1'],
      },
      {
        uuid: '2',
        name: 'Default name 2',
        description: 'Default description 2',
        'metadatas.uuid': ['fin2', 'eng2', 'swe2'],
      },
    ]);
  });

  test('without metadatas (empty object) returns defaults', () => {
    expect(translateAll('fin', FIELDS, ITEMS, {})).toEqual([
      {
        uuid: '1',
        name: 'Default name 1',
        description: 'Default description 1',
        'metadatas.uuid': ['fin1', 'eng1', 'swe1'],
      },
      {
        uuid: '2',
        name: 'Default name 2',
        description: 'Default description 2',
        'metadatas.uuid': ['fin2', 'eng2', 'swe2'],
      },
    ]);
  });

  test('of items with translations returns them translated', () => {
    expect(translateAll('fin', FIELDS, ITEMS, METADATAS)).toEqual([
      {
        uuid: '1', name: 'Nimi 1', description: 'Kuvaus 1', 'metadatas.uuid': ITEMS[0]['metadatas.uuid'],
      },
      {
        uuid: '2', name: 'Nimi 2', description: 'Kuvaus 2', 'metadatas.uuid': ITEMS[1]['metadatas.uuid'],
      },
    ]);
  });

  test('of items with partial translations uses defaults for missing', () => {
    expect(translateAll('swe', FIELDS, ITEMS, METADATAS)).toEqual([
      {
        uuid: '1',
        name: 'Namn 1',
        description: 'Beskrivning 1',
        'metadatas.uuid': ITEMS[0]['metadatas.uuid'],
      },
      {
        uuid: '2',
        name: 'Namn 2',
        description: 'Default description 2',
        'metadatas.uuid': ITEMS[1]['metadatas.uuid'],
      },
    ]);
  });

  test('of items with partial translations raises error when notFoundError given', () => {
    expect(() => translateAll('swe', FIELDS, ITEMS, METADATAS, { notFoundError: true })).toThrow();
  });
});

describe('getting translation as string', () => {
  const conf = { notFoundError: true };

  test('returns translated value', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['eng1'] };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(getTranslation(obj, 'name', 'eng', metadatas, conf)).toEqual('translatedName');
  });

  test('fails if object does not have metadatas.uuid property', () => {
    const obj = { name: 'testName', uuid: '1' };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(() => getTranslation(obj, 'name', 'eng', metadatas, conf)).toThrow('Given object does not have metadata.');
  });

  test('fails if translations do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ITEMS[0]['metadatas.uuid'] };
    expect(() => getTranslation(obj, 'name', 'eng', null, conf)).toThrow('Did not receive metadatas');
  });

  test('fails if translations for language do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ITEMS[0]['metadatas.uuid'] };
    expect(() => getTranslation(obj, 'name', 'eng', {}, conf)).toThrow('No translations exist for language eng');
  });

  test('fails if translations for object do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['fin1', 'swe1'] };
    const metadatas = { ...METADATAS };
    delete metadatas.eng1;
    expect(() => getTranslation(obj, 'name', 'eng', metadatas, conf)).toThrow('No translations exist for language eng.');
  });

  test('fails if translations for given field do not exist', () => {
    const obj = {
      name: 'testName', description: 'testDescription', uuid: '1', 'metadatas.uuid': ['eng1'],
    };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          description: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(() => getTranslation(obj, 'name', 'eng', metadatas, conf)).toThrow('No translations for field name exist for language eng.');
  });
});

describe('getting translation as string with default value', () => {
  test('when object does not have metadatas', () => {
    const obj = { name: 'testName', uuid: '1' };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '2',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(getTranslation(obj, 'name', 'eng', metadatas)).toEqual('testName');
  });

  test('when metadatas do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['eng1'] };
    expect(getTranslation(obj, 'name', 'eng', null)).toEqual('testName');
  });

  test('when translations for language do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['eng1'] };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(getTranslation(obj, 'name', 'swe', metadatas)).toEqual('testName');
  });

  test('when translations for object do not exist', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['url1'] };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '2',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
      url1: {
        subtype1: 'icon_medium',
        uuid: 'url1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          url: 'url1',
        },
        name: 'url',
        type: 'url',
      },
    };
    expect(getTranslation(obj, 'name', 'eng', metadatas)).toEqual('testName');
  });

  test('when translations for given field do not exist', () => {
    const obj = {
      name: 'testName', description: 'testDescription', uuid: '1', 'metadatas.uuid': ['eng1'],
    };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    expect(getTranslation(obj, 'description', 'eng', metadatas)).toEqual('testDescription');
  });
});

describe('getting translation as object', () => {
  test('returns translated value and language', () => {
    const obj = { name: 'testName', uuid: '1', 'metadatas.uuid': ['eng1'] };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          name: 'translatedName',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    const exp = { val: 'translatedName', lang: 'eng' };
    expect(getTranslation(obj, 'name', 'eng', metadatas, { returnUsedLanguage: true })).toEqual(exp);
  });

  test('returns default language of object', () => {
    const obj = {
      name: 'testName',
      description: 'testDescription',
      uuid: '1',
      'metadatas.uuid': ['eng1'],
      default_language: 'fin',
    };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          description: 'translatedDescription',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    const exp = { val: 'testName', lang: 'fin' };
    expect(getTranslation(obj, 'name', 'eng', metadatas, { returnUsedLanguage: true })).toEqual(exp);
  });

  test('returns null language if it cannot be determined', () => {
    const obj = {
      name: 'testName',
      description: 'testDescription',
      uuid: '1',
      'metadatas.uuid': ['eng1'],
    };
    const metadatas = {
      eng1: {
        subtype1: 'eng',
        uuid: 'eng1',
        model: 'auth_item',
        subtype2: null,
        model_uuid: '1',
        json_data: {
          description: 'translatedDescription',
        },
        name: 'Translations in eng',
        type: 'translation',
      },
    };
    const exp = { val: 'testName', lang: null };
    expect(getTranslation(obj, 'name', 'eng', metadatas, { returnUsedLanguage: true })).toEqual(exp);
  });
});
