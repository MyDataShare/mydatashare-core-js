import { configureMdsCore } from './config';
import { RESPONSE_MODE_FRAGMENT, RESPONSE_MODE_QUERY } from './constants';
import {
  store,
  AuthItem,
  AuthorizationData,
  IdProvider,
  Translation,
  Url,
  authorizationCallback,
  endSession,
} from './store';
import LANGUAGES from './languages';
import {
  combinePaginatedResponses,
  fetchAllPages,
} from './api';
import { fetchAuthItems } from './api/auth_items';
import {
  getTranslation,
  mergeTranslations,
  translateAll,
} from './api/translations';
import { getUrls } from './api/urls';

export {
  authorizationCallback,
  combinePaginatedResponses,
  configureMdsCore,
  endSession,
  fetchAllPages,
  fetchAuthItems,
  getTranslation,
  getUrls,
  mergeTranslations,
  store,
  translateAll,
  AuthorizationData,
  AuthItem,
  IdProvider,
  Translation,
  Url,
  LANGUAGES,
  RESPONSE_MODE_FRAGMENT,
  RESPONSE_MODE_QUERY,
};
