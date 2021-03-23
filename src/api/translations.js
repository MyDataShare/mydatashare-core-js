/**
 * Return a translation for the given API object's field.
 *
 * The translation is extracted from the given translations object, if
 * a translation for this object's field is found in the given language.
 * If no translation is found and notFoundError is false, the object's default
 * field value is returned.
 *
 * @param {Object} obj The API object for which the translation should be
 *   extracted for. The item must be translatable, i.e. it must have the
 *   translation_id property.
 * @param {string} field The field name for which to get the translation.
 * @param {string} language The alpha-3 language code. You can use
 *   {@link LANGUAGES} mapping to convert alpha-2 language codes to alpha-3.
 * @param {Object} translations The value (object) of the translations property
 *   which can be found in the MyDataShare API responses that contain
 *   translatable objects for which there are translations.
 * @param {Object} config
 * @param {boolean} config.notFoundError If true, an error will be thrown if the
 *   requested translation was not found.
 * @returns {string} The translation if found, otherwise the default field value
 *   of the object.
 */
const getTranslation = (
  obj,
  field,
  language,
  translations,
  { notFoundError } = {},
) => {
  const handleNotFound = (msg) => {
    if (notFoundError) throw new Error(msg);
  };

  const defaultValue = obj[field];

  if (!('translation_id' in obj)) {
    handleNotFound('Given object does not have translation_id property.');
    return defaultValue;
  }

  if (!translations) {
    handleNotFound('Did not receive translations');
    return defaultValue;
  }
  if (!(language in translations)) {
    handleNotFound(`No translations exist for language ${language}`);
    return defaultValue;
  }
  if (!(obj.translation_id in translations[language])) {
    handleNotFound(
      `No translations with translation_id ${obj.translation_id} exist for language ${language}.`,
    );
    return defaultValue;
  }
  if (!(field in translations[language][obj.translation_id])) {
    handleNotFound(
      `No translations for field ${field} with translation_id ${obj.translation_id} exist for language ${language}.`,
    );
    return defaultValue;
  }
  return translations[language][obj.translation_id][field].translation;
};

/**
 * Merge two translations objects from API responses.
 *
 * In case of duplicates, newTranslations has precedence.
 * Returns a new object that is a combination of the two given objects.
 *
 * @param {Object} oldTranslations
 * @param {Object} newTranslations
 * @returns {Object}
 */
const mergeTranslations = (oldTranslations, newTranslations) => {
  const translations = { ...oldTranslations };
  if (!newTranslations) return translations;
  Object.keys(newTranslations).forEach((language) => {
    if (language in translations) {
      Object.assign(translations[language], newTranslations[language]);
    } else {
      translations[language] = newTranslations[language];
    }
  });
  return translations;
};

/**
 * Return a list of translated versions of given API objects.
 *
 * All given objects must have have the same translatable fields given in
 * "fields" parameter.
 *
 * The given objects are not modified. Uses {@link getTranslation} for
 * translations, see its documentation for the parameter explanations.
 *
 * @param language
 * @param {Array.<string>} fields
 * @param {Array.<Object>} objects
 * @param {Object} translations
 * @param {Object} config
 * @param {boolean} config.notFoundError
 * @returns {Array.<Object>}
 * @see {@link getTranslation}
 */
const translateAll = (
  language,
  fields,
  objects,
  translations,
  { notFoundError } = {},
) => {
  const newItems = [];
  objects.forEach((item) => {
    const newItem = { ...item };
    fields.forEach((field) => {
      newItem[field] = getTranslation(newItem, field, language, translations, {
        notFoundError,
      });
    });
    newItems.push(newItem);
  });
  return newItems;
};

export { getTranslation, mergeTranslations, translateAll };
