const getTranslationMetadata = (metadatas, obj = null) => Object.fromEntries(
  Object.entries(metadatas).filter(
    ([metadataUuid, metadata]) => {
      const isTranslation = metadata.type === 'translation';
      if (obj !== null) {
        if (!('metadatas.uuid' in obj)) {
          throw new Error('Given object does not have metadata.');
        }
        return isTranslation && obj['metadatas.uuid'].includes(metadataUuid);
      }
      return isTranslation;
    },
  ),
);

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
 * @param {Object} metadatas The value (object) of the metadatas property
 *   which can be found in the MyDataShare API responses that contain
 *   translatable objects for which there are translations.
 * @param {Object} config
 * @param {boolean} config.notFoundError If true, an error will be thrown if the
 *   requested translation was not found.
 * @param {boolean} config.returnUsedLanguage If true, also returns the language of the returned
 *   string. Can be used only if `notFoundError` is `false`. The return value will be an object with
 *   properties `val` and `lang`. The `lang` property will be equal to the language
 *   parameter given to this function if the translation was found. If no translation was found and
 *   the object whose translation was requested has a `default_language` field, then the value of
 *   that is returned in the `lang` property. Otherwise the `lang` property will be null.
 * @returns {string|Object} The translation if found, otherwise the default field value
 *   of the object. If `returnUsedLanguage` was `true`, returns an object with the properties
 *   `val` (the translation) and `lang` (the language of the translation or default value, or
 *   null if the language could not be determined).
 */
const getTranslation = (
  obj,
  field,
  language,
  metadatas,
  { notFoundError = false, returnUsedLanguage = false } = {},
) => {
  const handleNotFound = (msg) => {
    if (notFoundError) throw new Error(msg);
  };

  const notFoundReturnValue = returnUsedLanguage
    ? {
      val: obj[field],
      lang: 'default_language' in obj ? obj.default_language : null,
    }
    : obj[field];

  if (!metadatas) {
    handleNotFound('Did not receive metadatas');
    return notFoundReturnValue;
  }

  let translations;
  try {
    translations = getTranslationMetadata(metadatas, obj);
  } catch (e) {
    handleNotFound('Given object does not have metadata.');
    return notFoundReturnValue;
  }

  const translationsForLang = Object.values(translations).find((m) => m.subtype1 === language);

  if (!translationsForLang) {
    handleNotFound(`No translations exist for language ${language}.`);
    return notFoundReturnValue;
  }

  if (!(field in translationsForLang.json_data)) {
    handleNotFound(
      `No translations for field ${field} exist for language ${language}.`,
    );
    return notFoundReturnValue;
  }

  const val = translationsForLang.json_data[field];
  if (returnUsedLanguage) {
    return {
      val,
      lang: language,
    };
  }
  return val;
};

/**
 * Return a list of translated versions of given API objects.
 *
 * All given objects must have have the same translatable fields given in
 * "fields" parameter.
 *
 * The given objects are not modified. Uses {@link getTranslation} for
 * metadatas, see its documentation for the parameter explanations.
 *
 * @param language
 * @param {Array.<string>} fields
 * @param {Array.<Object>} objects
 * @param {Object} metadatas
 * @param {Object} config
 * @param {boolean} config.notFoundError
 * @returns {Array.<Object>}
 * @see {@link getTranslation}
 */
const translateAll = (
  language,
  fields,
  objects,
  metadatas,
  { notFoundError } = {},
) => {
  const newItems = [];
  objects.forEach((item) => {
    const newItem = { ...item };
    fields.forEach((field) => {
      newItem[field] = getTranslation(newItem, field, language, metadatas, {
        notFoundError,
      });
    });
    newItems.push(newItem);
  });
  return newItems;
};

export { getTranslationMetadata, getTranslation, translateAll };
