import Base from './base/base';

const STORE_KEY = 'translations';

/**
 * Represents a translation API object.
 * @augments Base
 */
class Translation extends Base {}

Translation.resourceName = 'translation';

Translation.byUuid = function byUuid(store) {
  const ret = {};
  if (!(STORE_KEY in store) || !Object.keys(store[STORE_KEY]).length) {
    return ret;
  }
  Object.values(store[STORE_KEY]).forEach((translationGroup) => {
    Object.values(translationGroup).forEach((fields) => {
      Object.values(fields).forEach((translation) => {
        ret[translation.uuid] = translation;
      });
    });
  });
  return ret;
};

Translation.parse = function parse(apiResponse, store) {
  const ret = {};
  if (
    !Object.keys(apiResponse).length
    || !('translations' in apiResponse)
    || !Object.keys(apiResponse.translations).length
  ) {
    return ret;
  }
  Object.entries(
    apiResponse.translations,
  ).forEach((langTranslationGroup) => {
    const [language, translationGroups] = langTranslationGroup;
    ret[language] = {};
    Object.entries(translationGroups).forEach((translationFields) => {
      const [translationId, fields] = translationFields;
      ret[language][translationId] = {};
      Object.entries(fields).forEach((fieldTranslations) => {
        const [fieldName, translation] = fieldTranslations;
        ret[language][translationId][fieldName] = new Translation(
          store,
          translation,
        );
      });
    });
  });
  return ret;
};

// eslint-disable-next-line import/prefer-default-export
export { Translation };
