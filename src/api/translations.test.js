import { mergeTranslations, translateAll } from './translations';
import { deepFreeze } from '../test-util';

const FIELDS = ['name', 'description'];

const TRANSLATIONS = {
  fin: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Nimi 1',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Kuvaus 1',
      },
    },
    2: {
      name: {
        translation_id: 2,
        field_name: 'name',
        translation: 'Nimi 2',
      },
      description: {
        translation_id: 2,
        field_name: 'description',
        translation: 'Kuvaus 2',
      },
    },
  },
  eng: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Name',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Description',
      },
    },
    2: {
      name: {
        translation_id: 2,
        field_name: 'name',
        translation: 'Name 2',
      },
      description: {
        translation_id: 2,
        field_name: 'description',
        translation: 'Description 2',
      },
    },
  },
  swe: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Namn 1',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Beskrivning 1',
      },
    },
    2: {
      name: {
        translation_id: 2,
        field_name: 'name',
        translation: 'Namn 2',
      },
    },
  },
};

const TRANSLATIONS_NOR_EST = {
  nor: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Norwegian name 1',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Norwegian description 1',
      },
    },
  },
  est: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Estonian name 1',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Estonian description 1',
      },
    },
  },
};

const TRANSLATIONS_SWE_DAN = {
  swe: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Override namn 1',
      },
    },
  },
  dan: {
    1: {
      name: {
        translation_id: 1,
        field_name: 'name',
        translation: 'Danish name 1',
      },
      description: {
        translation_id: 1,
        field_name: 'description',
        translation: 'Danish description 1',
      },
    },
  },
};

const ITEMS = Object.freeze([
  deepFreeze({
    name: 'Default name 1',
    description: 'Default description 1',
    translation_id: 1,
  }),
  deepFreeze({
    name: 'Default name 2',
    description: 'Default description 2',
    translation_id: 2,
  }),
]);

describe('translating a list', () => {
  test('that is empty returns an empty list', () => {
    expect(translateAll('fin', FIELDS, [], TRANSLATIONS)).toEqual([]);
  });

  test('without translations (null) returns defaults', () => {
    expect(translateAll('fin', FIELDS, ITEMS, null)).toEqual([
      {
        translation_id: 1,
        name: 'Default name 1',
        description: 'Default description 1',
      },
      {
        translation_id: 2,
        name: 'Default name 2',
        description: 'Default description 2',
      },
    ]);
  });

  test('without translations (empty object) returns defaults', () => {
    expect(translateAll('fin', FIELDS, ITEMS, {})).toEqual([
      {
        translation_id: 1,
        name: 'Default name 1',
        description: 'Default description 1',
      },
      {
        translation_id: 2,
        name: 'Default name 2',
        description: 'Default description 2',
      },
    ]);
  });

  test('of items with translations returns them translated', () => {
    expect(translateAll('fin', FIELDS, ITEMS, TRANSLATIONS)).toEqual([
      { translation_id: 1, name: 'Nimi 1', description: 'Kuvaus 1' },
      { translation_id: 2, name: 'Nimi 2', description: 'Kuvaus 2' },
    ]);
  });

  test('of items with partial translations uses defaults for missing', () => {
    expect(translateAll('swe', FIELDS, ITEMS, TRANSLATIONS)).toEqual([
      {
        translation_id: 1,
        name: 'Namn 1',
        description: 'Beskrivning 1',
      },
      {
        translation_id: 2,
        name: 'Namn 2',
        description: 'Default description 2',
      },
    ]);
  });

  test('of items with partial translations raises error when notFoundError given', () => {
    expect(() => translateAll('swe', FIELDS, ITEMS, TRANSLATIONS, { notFoundError: true })).toThrow();
  });
});

describe('merging translations', () => {
  test('returns unmodified when merging with empty', () => {
    expect(mergeTranslations(TRANSLATIONS, {})).toEqual(TRANSLATIONS);
  });

  test("succeeds when objects don't share common language", () => {
    expect(mergeTranslations(TRANSLATIONS, TRANSLATIONS_NOR_EST)).toEqual({
      ...TRANSLATIONS,
      ...TRANSLATIONS_NOR_EST,
    });
  });

  test('succeeds when objects share common language', () => {
    const expected = {
      ...JSON.parse(JSON.stringify(TRANSLATIONS)),
      dan: TRANSLATIONS_SWE_DAN.dan,
    };
    // eslint-disable-next-line prefer-destructuring
    expected.swe[1] = TRANSLATIONS_SWE_DAN.swe[1];
    expect(mergeTranslations(TRANSLATIONS, TRANSLATIONS_SWE_DAN)).toEqual(
      expected,
    );
  });
});
