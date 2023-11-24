import Base from './base';
import { getTranslation } from '../../api/translations';

/**
 * Base class for API objects that support translations.
 * @augments Base
 */
class TranslationBase extends Base {
  constructor(...args) {
    if (new.target === TranslationBase) {
      throw new TypeError('TranslationBase must be extended');
    }
    super(...args);
  }

  /**
     * Translate this object's field.
     * @param {string} field The field's name to get a translation for.
     * @param {Object} config
     * @param {string} config.language Optional alpha-3 language code for the
     *   translation. If not given, the current language of `store` is used.
     * @param {boolean} config.returnUsedLanguage See the documentation of the global function
     *   `getTranslation`.
     * @param {boolean} config.notFoundError If true, an error will be thrown if the
     *   requested translation was not found.
     * @returns {string} Either the translated field or if a translation doesn't
     *   exist, the field's default value. The return value is an object if `returnUsedLanguage` is
     *   used, see the documentation of the global function `getTranslation` for the format.
     * @see {@link Store#setLanguage}
     * @see {@link LANGUAGES}
     */
  getTranslation(field, { language, notFoundError, returnUsedLanguage } = {}) {
    const lang = language || this.store.language;
    return getTranslation(
      this,
      field,
      lang,
      this.store.metadatas,
      { notFoundError, returnUsedLanguage },
    );
  }
}

export default TranslationBase;
