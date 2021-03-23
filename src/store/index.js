import {
  AuthItem,
  AuthorizationData,
  authorizationCallback,
  endSession,
  fetchOidConfig,
  getOidConfigUrl,
  tokenCallback,
} from './auth-item';
import { IdProvider } from './id-provider';
import { Translation } from './translation';
import { Url } from './url';
import { mergeTranslations } from '../api/translations';
import { combinePaginatedResponses } from '../api';

/**
 * Store that parses and saves API objects.
 *
 * Parse API objects using [parseApiResponse]{@link Store#parseApiResponse} and the parsed objects
 * are saved to this store.
 *
 * Get access the global store instance by importing the `store` object.
 * @example
 * import { store, fetchAuthItems, AuthItem } from 'mydatashare-core';
 * fetchAuthItems()
 *   .then(response => {
 *     store.parseApiResponse(response);
 *     const authItem = AuthItem.asArray(store)[0];
 *   });
 */
class Store {
  constructor() {
    /**
     * Current language.
     *
     * [getTranslation]{@link TranslationBase#getTranslation} will fetch translations by default for
     * this language.
     * @type {string|null}
     */
    this.language = null;
    this.authItems = {};
    this.idProviders = {};
    this.translations = {};
    this.urls = {};
  }

  /**
   * Clear the store from objects.
   */
  clear() {
    this.authItems = {};
    this.idProviders = {};
    this.translations = {};
    this.urls = {};
  }

  /**
   * Parse and add objects to store from an API response.
   *
   * The objects parsed from this response are merged with any existing objects
   * already in the store.
   *
   * Use the static methods in API object classes for accessing the stored objects, for example
   * `AuthItem.asArray(store)` or `AuthItem.byUuid(store)`.
   *
   * @see {@link AuthItem}
   * @see {@link IdProvider}
   * @param {Object} response A JSON response from a MDS API endpoint as an object.
   */
  parseApiResponse(response) {
    let res = JSON.parse(JSON.stringify(response));
    if (res instanceof Array) res = combinePaginatedResponses(res);

    if ('auth_items' in res) {
      this.authItems = {
        ...this.authItems,
        ...AuthItem.parse(res, this),
      };
    }

    if ('id_providers' in res) {
      this.idProviders = {
        ...this.idProviders,
        ...IdProvider.parse(res, this),
      };
    }

    if ('translations' in res) {
      this.translations = mergeTranslations(
        this.translations,
        Translation.parse(res, this),
      );
    }

    if ('urls' in res) {
      this.urls = { ...this.urls, ...Url.parse(res, this) };
    }
  }

  /**
   * Change the language for which getTranslation() will fetch translations for
   * API objects from the store.
   * @param {string} language The alpha-3 language code. You can use
   *   {@link LANGUAGES} mapping to convert alpha-2 language codes to alpha-3.
   */
  setLanguage(language) {
    this.language = language;
  }
}

/**
 * The global store object.
 * @type {Store}
 */
const store = new Store();

export {
  store,
  AuthItem,
  AuthorizationData,
  IdProvider,
  Translation,
  Url,
  authorizationCallback,
  endSession,
  fetchOidConfig,
  getOidConfigUrl,
  tokenCallback,
};
