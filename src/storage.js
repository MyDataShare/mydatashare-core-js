import { AuthorizationServiceConfiguration } from '@openid/appauth';

const STORAGE_PREFIX = 'mds-core-';

const getPrefix = (name) => {
  if (typeof window !== 'undefined') {
    // When running on localhost, the LocalStorage is shared between wep apps
    // running on different ports. Adding the host and port to the item name
    // prevents the storage keys from getting mixed up between apps.
    return `${STORAGE_PREFIX}${window.location.host}-${name}`;
  }
  return `${STORAGE_PREFIX}${name}`;
};

const getConfig = (name) => localStorage.getItem(getPrefix(name));

const getOidConfigFromConfig = () => {
  const savedConfig = getConfig('oidConfig');
  if (!savedConfig) {
    return null;
  }
  return new AuthorizationServiceConfiguration(JSON.parse(savedConfig));
};

const removeConfig = (name) => {
  localStorage.removeItem(getPrefix(name));
};

const saveConfig = (name, value) => {
  localStorage.setItem(getPrefix(name), value);
};

export {
  getConfig, getOidConfigFromConfig, removeConfig, saveConfig,
};
