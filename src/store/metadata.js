import TranslationUrlBase from './base/translation-url-base';

/**
 * Represents a metadata API object.
 * @augments TranslationUrlBase
 */
class Metadata extends TranslationUrlBase {}

Metadata.resourceName = 'metadata';

// eslint-disable-next-line import/prefer-default-export
export { Metadata };
