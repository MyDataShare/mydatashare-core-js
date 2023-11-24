# MyDataShare Core JS

MyDataShare Core JS is a convenience library for integrating into the [MyDataShare services](https://mydatashare.com). MyDataShare provides a full-fledged [application programming interface](https://app.swaggerhub.com/apis/MyDataShare2/MyDataShare). This library utilizes and supplements the MyDataShare API and authentication flow, and you can pick and choose freely which of its features you use.

The library currently supports client side web applications and OAuth 2.0 Authorization Code Grant with PKCE for user authorization. Node environments and other authentication methods are currently not supported. The NPM package is called `mydatashare-core`.

**[Jump to API documentation](#api-documentation)**

## Feature Overview

### Authorization

One of the main functionalities of this library is to provide tools that make it easier to integrate a web-based app to use MyDataShare ID authentication and authorization. This includes

- querying the available login methods (`auth_item`) from MDS API (e.g. Finnish Trust Network and Google)
- retrieving translated login prompts and/or descriptions for the `auth_item`s
- initiating login with the desired `auth_item`
- and handling web app authorization using Authorization Code Grant flow with PKCE, resulting in fetching an access token for the client app.

### API objects store

Another main feature of the library is wrapping API objects into convenience classes and saving them to an in-memory store.

This makes it easier to handle the relationships of API objects. Fetching an object's translations and urls can then be made through the object itself.

### Utility Methods

The library provides utility methods for handling the MDS API response entities. This includes for example easier extraction of API object URLs and translations from API responses. These can be used even if the store functionality is not used.

## Examples

### Store and API object wrappers

```javascript
import { AuthItem, fetchAuthItems, store, configureMdsCore } from 'mydatashare-core';

// Configure the library
configureMdsCore({ apiVersion: 'v2.0', 'AuthItem': { backgroundFetchOidConfig: true } });
store.setLanguage('fin');

// Fetch some MDS API endpoint. The library includes `fetchAuthItems` for convenience.
const authItems = await fetchAuthItems();

// Parse and store the API response objects
store.parseApiResponse(authItems);

// The store wraps the API objects in convenience classes, which can then be
// accessed via the class' static accessor methods.
const authItem = AuthItem.asArray(store)[0];

// The wrapped API objects have the same properties as in the API response
const defaultName = authItem.name;

// In addition, they have convenience methods that utilize the objects saved in store
const finnishName = authItem.getTranslation('name');
const idProvider = authItem.getIdProvider();
const icon = authItem.getUrls('icon_medium')[0];
```

### Authorization flow

```javascript
import { AuthItem, fetchAuthItems, store, configureMdsCore } from 'mydatashare-core';

// Get a hold of the AuthItem that we want to initiate login with.
configureMdsCore({ 'AuthItem': { backgroundFetchOidConfig: true } });
const authItems = await fetchAuthItems();
store.parseApiResponse(authItems);
const authItem = AuthItem.asArray(store)[0];

// Start the authorization via an AuthItem.
authItem.performAuthorization(
  'My Client ID',               // client ID
  'https://example.com/login',  // redirect URI
  'some-scope another-scope'    // scope
);
```

Now the user is taken to log in. After a successful login,  the flow continues in the redirect URI. There the Authorization Code parameters are exchanged for a token via a token request.

```javascript
import { authorizationCallback } from 'mydatashare-core';
// authorizationCallback handles making the token request
authorizationCallback('My Client ID', 'https://example.com/login')
  .then((authorizationData) => {
    const accessToken = authorizationData.accessToken;
    const idToken = authorizationData.idToken;
  })
```

When it's time end the session, call `endSession`:

```javascript
import { endSession } from 'mydatashare-core';
endSession('https://example.com/logout');  // Pass in the post logout redirect URI
// The browser visits the ID provider's end session endpoint, and then redirects
// back to the redirect URI given to `endSession`.
```

## Development

### API docs and readme

[jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown) is used for generating API documentation to the readme from jsdoc comments. If you want to edit the readme, make the edits in the readme source file `README.hbs`.

After editing `README.hbs` or making changes to the code or its jsdoc comments, generate a new version of `README.md`:

```bash
npm run docs
```

### Releasing a new version

When all the feature commits are done, add one last commit to bump the version number using `npm-version`, which commits and adds a git tag automatically. This will also execute the test suite before version upgrade. It also won't let you upgrade the version unless your git working directory is clean.

```bash
# For a patch version update
npm version patch

# For a minor version update
npm version minor

# For a major version update
npm version major
```

After bumping the version number, you shouldn't add any more commits – so the version commit should be the last one before merge to master branch.

If you realize that you have to add more commits after bumping the version, reset the version changes and remove the git tag. Then bump the version again after making the needed commits.

### Linking to projects

If you want to see changes made to this library in real time (without running `npm install`) in a project that is using this library, you have to link this repostiroy directory into the node_modules of the other project.

```bash
# In this project
npm link

# In another project that depends on mydatashare-core
npm link mydatashare-core
```

After linking, changes made to mydatashare-core will be reflected immediately to the other project too.

## API documentation

## Classes

<dl>
<dt><a href="#AuthItem">AuthItem</a> ⇐ <code><a href="#TranslationUrlBase">TranslationUrlBase</a></code></dt>
<dd><p>Represents an auth_item API object.</p>
</dd>
<dt><a href="#AuthorizationData">AuthorizationData</a></dt>
<dd><p>Contains a user&#39;s ID and access tokens after successful authorization.</p>
</dd>
<dt><a href="#IdProvider">IdProvider</a> ⇐ <code><a href="#TranslationUrlBase">TranslationUrlBase</a></code></dt>
<dd><p>Represents an id_provider API object.</p>
</dd>
<dt><a href="#Store">Store</a></dt>
<dd><p>Store that parses and saves API objects.</p>
<p>Parse API objects using <a href="#Store+parseApiResponse">parseApiResponse</a> and the parsed objects
are saved to this store.</p>
<p>Get access the global store instance by importing the <code>store</code> object.</p>
</dd>
<dt><a href="#Metadata">Metadata</a> ⇐ <code><a href="#TranslationUrlBase">TranslationUrlBase</a></code></dt>
<dd><p>Represents a metadata API object.</p>
</dd>
<dt><a href="#Base">Base</a></dt>
<dd><p>Base class for API objects.</p>
</dd>
<dt><a href="#TranslationBase">TranslationBase</a> ⇐ <code><a href="#Base">Base</a></code></dt>
<dd><p>Base class for API objects that support translations.</p>
</dd>
<dt><a href="#TranslationUrlBase">TranslationUrlBase</a> ⇐ <code><a href="#TranslationBase">TranslationBase</a></code></dt>
<dd><p>Base class for API objects that support both translations and URLs.</p>
</dd>
<dt><a href="#UrlBase">UrlBase</a> ⇐ <code><a href="#Base">Base</a></code></dt>
<dd><p>Base class for API objects that support URLs.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#LANGUAGES">LANGUAGES</a></dt>
<dd><p>Language alpha-2 codes as keys, alpha-3 codes as values (extracted from pycountry).</p>
</dd>
<dt><a href="#LANGUAGES_ALPHA_3">LANGUAGES_ALPHA_3</a></dt>
<dd><p>Language alpha-3 codes as keys, alpha-2 codes as values (extracted from pycountry).</p>
</dd>
<dt><a href="#store">store</a> : <code><a href="#Store">Store</a></code></dt>
<dd><p>The global store object.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#configureMdsCore">configureMdsCore()</a></dt>
<dd><p>Configure global settings.</p>
</dd>
<dt><a href="#fetchAuthItems">fetchAuthItems(config)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Fetch the auth_items endpoint of the MyDataShare API.</p>
</dd>
<dt><a href="#combinePaginatedResponses">combinePaginatedResponses(responses)</a> ⇒ <code>Object</code></dt>
<dd><p>Combine a list of objects received from MyDataShare API into a single object.
The responses should be the unmodified full JSON responses as they are
received from the API.</p>
<p>The MyDataShare API is paginated. A response will contain the property
next_offset if there are more data to fetch that was left out from the
response. Take the value of next_offset and pass it in the property offset in
the JSON body of a search endpoint request to use it.</p>
</dd>
<dt><a href="#fetchAllPages">fetchAllPages(url, config)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Fetch a resource from the MyDataShare API, and if there are enough data for
the response to be paginated, fetch all the remaining pages and combine the
responses into a single object.</p>
</dd>
<dt><a href="#getTranslation">getTranslation(obj, field, language, metadatas, config)</a> ⇒ <code>string</code> | <code>Object</code></dt>
<dd><p>Return a translation for the given API object&#39;s field.</p>
<p>The translation is extracted from the given translations object, if
a translation for this object&#39;s field is found in the given language.
If no translation is found and notFoundError is false, the object&#39;s default
field value is returned.</p>
</dd>
<dt><a href="#translateAll">translateAll(language, fields, objects, metadatas, config)</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd><p>Return a list of translated versions of given API objects.</p>
<p>All given objects must have have the same translatable fields given in
&quot;fields&quot; parameter.</p>
<p>The given objects are not modified. Uses <a href="#getTranslation">getTranslation</a> for
metadatas, see its documentation for the parameter explanations.</p>
</dd>
<dt><a href="#getUrls">getUrls(obj, urlType, metadatas, config)</a> ⇒ <code>Array.&lt;Object&gt;</code></dt>
<dd><p>Return URLs of specific type for given API object from given URLs resource.</p>
<p>The URLs are extracted from the given metadatas object, if found. If URLs are not
found, an empty list is returned</p>
</dd>
<dt><a href="#authorizationCallback">authorizationCallback(clientId, redirectUri)</a> ⇒ <code><a href="#AuthorizationData">Promise.&lt;AuthorizationData&gt;</a></code></dt>
<dd><p>Parse authorization response from the URL and perform a token request.</p>
</dd>
<dt><a href="#endSession">endSession()</a> ⇒ <code>boolean</code></dt>
<dd><p>Navigate to the end_session endpoint for logging out the user.</p>
<p>If the config values needed for navigating to end_session endpoint
(id_token_hint, OID configuration) are not found in LocalStorage, the user
will not be taken to the end_session_endpoint and instead this method will
return false. This can happen for example if a user clears the browser&#39;s
cache.</p>
<p>When false is returned, ending any possible local sessions should be handled
manually.</p>
</dd>
</dl>

<a name="AuthItem"></a>

## AuthItem ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
Represents an auth_item API object.

**Kind**: global class  
**Extends**: [<code>TranslationUrlBase</code>](#TranslationUrlBase)  

* [AuthItem](#AuthItem) ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
    * _instance_
        * [.fetchOidConfig()](#AuthItem+fetchOidConfig) ⇒ <code>Promise.&lt;AuthorizationServiceConfiguration&gt;</code>
        * [.getIdProvider()](#AuthItem+getIdProvider) ⇒ [<code>IdProvider</code>](#IdProvider) \| <code>null</code>
        * [.performAuthorization(clientId, redirectUri, scope, config)](#AuthItem+performAuthorization) ⇒ <code>Promise.&lt;void&gt;</code>
        * [.setOidConfig(oidConfig)](#AuthItem+setOidConfig)
        * [.getUrls(urlType)](#TranslationUrlBase+getUrls) ⇒ <code>Array.&lt;Object&gt;</code>
        * [.getTranslation(field, config)](#TranslationBase+getTranslation) ⇒ <code>string</code>
    * _static_
        * [.getEndpoint()](#AuthItem.getEndpoint) ⇒ <code>string</code>
        * [.configure(config)](#AuthItem.configure)

<a name="AuthItem+fetchOidConfig"></a>

### authItem.fetchOidConfig() ⇒ <code>Promise.&lt;AuthorizationServiceConfiguration&gt;</code>
Fetch this AuthItem's OID configuration object from the issuer.

This also sets this AuthItem's `oidConfig` property to the fetched object.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  
**Returns**: <code>Promise.&lt;AuthorizationServiceConfiguration&gt;</code> - AppAuth
  AuthorizationServiceConfiguration object, use toJson() to convert it into
  a regular object.  
<a name="AuthItem+getIdProvider"></a>

### authItem.getIdProvider() ⇒ [<code>IdProvider</code>](#IdProvider) \| <code>null</code>
Return this AuthItem's IdProvider from the store.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  
<a name="AuthItem+performAuthorization"></a>

### authItem.performAuthorization(clientId, redirectUri, scope, config) ⇒ <code>Promise.&lt;void&gt;</code>
Redirect user to authorize using given this AuthItem.

The fragment response mode is always used, meaning this library instructs the IdP to return
the authorization code and other parameters in the fragment part of the login redirect URI.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  
**See**: [authorizationCallback](#authorizationCallback)  

| Param | Type | Description |
| --- | --- | --- |
| clientId | <code>string</code> | Client ID registered with the IdProvider of given AuthItem. |
| redirectUri | <code>string</code> | The redirect_uri registered for the given client. |
| scope | <code>string</code> | A space separated string of scopes to request from the   IdProvider. |
| config | <code>Object</code> |  |
| config.state |  | Optional oauth 2.0 state parameter to use during   authorization flow. The state parameter is verified as described in   [RFC 6749](https://tools.ietf.org/html/rfc6749#section-10.12).   If state is not given, a secure state is generated automatically. |

<a name="AuthItem+setOidConfig"></a>

### authItem.setOidConfig(oidConfig)
Setter for `oidConfig`.

This can be used to set `oidConfig` manually. Usually this is not needed.

By default, [parseApiResponse](parseApiResponse) is configured to fetch OID configs for
AuthItems in the background.
[fetchOidConfig](fetchOidConfig) can also be used to fetch the OID configuration
object from issuer if it wasn't fetched during parsing.

The OID configuration will also be fetched automatically in
[performAuthorization](performAuthorization) if it hasn't been set.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  

| Param |
| --- |
| oidConfig | 

<a name="TranslationUrlBase+getUrls"></a>

### authItem.getUrls(urlType) ⇒ <code>Array.&lt;Object&gt;</code>
Return all URLs of this object with given type.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  
**Overrides**: [<code>getUrls</code>](#TranslationUrlBase+getUrls)  

| Param | Type | Description |
| --- | --- | --- |
| urlType | <code>string</code> | The type of URLs to get (url_type property in url metadata   objects) |

<a name="TranslationBase+getTranslation"></a>

### authItem.getTranslation(field, config) ⇒ <code>string</code>
Translate this object's field.

**Kind**: instance method of [<code>AuthItem</code>](#AuthItem)  
**Overrides**: [<code>getTranslation</code>](#TranslationBase+getTranslation)  
**Returns**: <code>string</code> - Either the translated field or if a translation doesn't
  exist, the field's default value. The return value is an object if `returnUsedLanguage` is
  used, see the documentation of the global function `getTranslation` for the format.  
**See**

- [setLanguage](#Store+setLanguage)
- [LANGUAGES](#LANGUAGES)


| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field's name to get a translation for. |
| config | <code>Object</code> |  |
| config.language | <code>string</code> | Optional alpha-3 language code for the   translation. If not given, the current language of `store` is used. |
| config.returnUsedLanguage | <code>boolean</code> | See the documentation of the global function   `getTranslation`. |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |

<a name="AuthItem.getEndpoint"></a>

### AuthItem.getEndpoint() ⇒ <code>string</code>
Get the full endpoint URL of this object.

**Kind**: static method of [<code>AuthItem</code>](#AuthItem)  
**See**: [configureMdsCore](#configureMdsCore)  
<a name="AuthItem.configure"></a>

### AuthItem.configure(config)
Configure AuthItem behavior.

**Kind**: static method of [<code>AuthItem</code>](#AuthItem)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.backgroundFetchOidConfig | <code>boolean</code> | Whether to fetch OID configurations for   found IdProviders in background during [parseApiResponse](#Store+parseApiResponse).   Defaults to `true`. |

<a name="AuthorizationData"></a>

## AuthorizationData
Contains a user's ID and access tokens after successful authorization.

**Kind**: global class  

* [AuthorizationData](#AuthorizationData)
    * [.accessToken](#AuthorizationData+accessToken) : <code>string</code>
    * [.idToken](#AuthorizationData+idToken) : <code>string</code>

<a name="AuthorizationData+accessToken"></a>

### authorizationData.accessToken : <code>string</code>
**Kind**: instance property of [<code>AuthorizationData</code>](#AuthorizationData)  
<a name="AuthorizationData+idToken"></a>

### authorizationData.idToken : <code>string</code>
**Kind**: instance property of [<code>AuthorizationData</code>](#AuthorizationData)  
<a name="IdProvider"></a>

## IdProvider ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
Represents an id_provider API object.

**Kind**: global class  
**Extends**: [<code>TranslationUrlBase</code>](#TranslationUrlBase)  

* [IdProvider](#IdProvider) ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
    * [.getUrls(urlType)](#TranslationUrlBase+getUrls) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.getTranslation(field, config)](#TranslationBase+getTranslation) ⇒ <code>string</code>

<a name="TranslationUrlBase+getUrls"></a>

### idProvider.getUrls(urlType) ⇒ <code>Array.&lt;Object&gt;</code>
Return all URLs of this object with given type.

**Kind**: instance method of [<code>IdProvider</code>](#IdProvider)  

| Param | Type | Description |
| --- | --- | --- |
| urlType | <code>string</code> | The type of URLs to get (url_type property in url metadata   objects) |

<a name="TranslationBase+getTranslation"></a>

### idProvider.getTranslation(field, config) ⇒ <code>string</code>
Translate this object's field.

**Kind**: instance method of [<code>IdProvider</code>](#IdProvider)  
**Returns**: <code>string</code> - Either the translated field or if a translation doesn't
  exist, the field's default value. The return value is an object if `returnUsedLanguage` is
  used, see the documentation of the global function `getTranslation` for the format.  
**See**

- [setLanguage](#Store+setLanguage)
- [LANGUAGES](#LANGUAGES)


| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field's name to get a translation for. |
| config | <code>Object</code> |  |
| config.language | <code>string</code> | Optional alpha-3 language code for the   translation. If not given, the current language of `store` is used. |
| config.returnUsedLanguage | <code>boolean</code> | See the documentation of the global function   `getTranslation`. |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |

<a name="Store"></a>

## Store
Store that parses and saves API objects.

Parse API objects using [parseApiResponse](#Store+parseApiResponse) and the parsed objects
are saved to this store.

Get access the global store instance by importing the `store` object.

**Kind**: global class  

* [Store](#Store)
    * [.language](#Store+language) : <code>string</code> \| <code>null</code>
    * [.clear()](#Store+clear)
    * [.parseApiResponse(response)](#Store+parseApiResponse)
    * [.setLanguage(language)](#Store+setLanguage)

<a name="Store+language"></a>

### store.language : <code>string</code> \| <code>null</code>
Current language.

[getTranslation](#TranslationBase+getTranslation) will fetch translations by default for
this language.

**Kind**: instance property of [<code>Store</code>](#Store)  
<a name="Store+clear"></a>

### store.clear()
Clear the store from objects.

**Kind**: instance method of [<code>Store</code>](#Store)  
<a name="Store+parseApiResponse"></a>

### store.parseApiResponse(response)
Parse and add objects to store from an API response.

The objects parsed from this response are merged with any existing objects
already in the store.

Use the static methods in API object classes for accessing the stored objects, for example
`AuthItem.asArray(store)` or `AuthItem.byUuid(store)`.

**Kind**: instance method of [<code>Store</code>](#Store)  
**See**

- [AuthItem](#AuthItem)
- [IdProvider](#IdProvider)


| Param | Type | Description |
| --- | --- | --- |
| response | <code>Object</code> | A JSON response from a MDS API endpoint as an object. |

<a name="Store+setLanguage"></a>

### store.setLanguage(language)
Change the language for which getTranslation() will fetch translations for
API objects from the store.

**Kind**: instance method of [<code>Store</code>](#Store)  

| Param | Type | Description |
| --- | --- | --- |
| language | <code>string</code> | The alpha-3 language code. You can use   [LANGUAGES](#LANGUAGES) mapping to convert alpha-2 language codes to alpha-3. |

<a name="Metadata"></a>

## Metadata ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
Represents a metadata API object.

**Kind**: global class  
**Extends**: [<code>TranslationUrlBase</code>](#TranslationUrlBase)  

* [Metadata](#Metadata) ⇐ [<code>TranslationUrlBase</code>](#TranslationUrlBase)
    * [.getUrls(urlType)](#TranslationUrlBase+getUrls) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.getTranslation(field, config)](#TranslationBase+getTranslation) ⇒ <code>string</code>

<a name="TranslationUrlBase+getUrls"></a>

### metadata.getUrls(urlType) ⇒ <code>Array.&lt;Object&gt;</code>
Return all URLs of this object with given type.

**Kind**: instance method of [<code>Metadata</code>](#Metadata)  

| Param | Type | Description |
| --- | --- | --- |
| urlType | <code>string</code> | The type of URLs to get (url_type property in url metadata   objects) |

<a name="TranslationBase+getTranslation"></a>

### metadata.getTranslation(field, config) ⇒ <code>string</code>
Translate this object's field.

**Kind**: instance method of [<code>Metadata</code>](#Metadata)  
**Returns**: <code>string</code> - Either the translated field or if a translation doesn't
  exist, the field's default value. The return value is an object if `returnUsedLanguage` is
  used, see the documentation of the global function `getTranslation` for the format.  
**See**

- [setLanguage](#Store+setLanguage)
- [LANGUAGES](#LANGUAGES)


| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field's name to get a translation for. |
| config | <code>Object</code> |  |
| config.language | <code>string</code> | Optional alpha-3 language code for the   translation. If not given, the current language of `store` is used. |
| config.returnUsedLanguage | <code>boolean</code> | See the documentation of the global function   `getTranslation`. |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |

<a name="Base"></a>

## Base
Base class for API objects.

**Kind**: global class  

* [Base](#Base)
    * [.asArray(store)](#Base.asArray) ⇒ [<code>Array.&lt;Base&gt;</code>](#Base)
    * [.byUuid(store)](#Base.byUuid) ⇒ <code>Object.&lt;string, Base&gt;</code>

<a name="Base.asArray"></a>

### Base.asArray(store) ⇒ [<code>Array.&lt;Base&gt;</code>](#Base)
Return objects of this type from the store as an array.

**Kind**: static method of [<code>Base</code>](#Base)  

| Param | Type |
| --- | --- |
| store | [<code>Store</code>](#Store) | 

<a name="Base.byUuid"></a>

### Base.byUuid(store) ⇒ <code>Object.&lt;string, Base&gt;</code>
Return objects of this type from the store as an object with UUIDs as keys.

**Kind**: static method of [<code>Base</code>](#Base)  

| Param | Type |
| --- | --- |
| store | [<code>Store</code>](#Store) | 

<a name="TranslationBase"></a>

## TranslationBase ⇐ [<code>Base</code>](#Base)
Base class for API objects that support translations.

**Kind**: global class  
**Extends**: [<code>Base</code>](#Base)  
<a name="TranslationBase+getTranslation"></a>

### translationBase.getTranslation(field, config) ⇒ <code>string</code>
Translate this object's field.

**Kind**: instance method of [<code>TranslationBase</code>](#TranslationBase)  
**Returns**: <code>string</code> - Either the translated field or if a translation doesn't
  exist, the field's default value. The return value is an object if `returnUsedLanguage` is
  used, see the documentation of the global function `getTranslation` for the format.  
**See**

- [setLanguage](#Store+setLanguage)
- [LANGUAGES](#LANGUAGES)


| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field's name to get a translation for. |
| config | <code>Object</code> |  |
| config.language | <code>string</code> | Optional alpha-3 language code for the   translation. If not given, the current language of `store` is used. |
| config.returnUsedLanguage | <code>boolean</code> | See the documentation of the global function   `getTranslation`. |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |

<a name="TranslationUrlBase"></a>

## TranslationUrlBase ⇐ [<code>TranslationBase</code>](#TranslationBase)
Base class for API objects that support both translations and URLs.

**Kind**: global class  
**Extends**: [<code>TranslationBase</code>](#TranslationBase)  

* [TranslationUrlBase](#TranslationUrlBase) ⇐ [<code>TranslationBase</code>](#TranslationBase)
    * [.getUrls(urlType)](#TranslationUrlBase+getUrls) ⇒ <code>Array.&lt;Object&gt;</code>
    * [.getTranslation(field, config)](#TranslationBase+getTranslation) ⇒ <code>string</code>

<a name="TranslationUrlBase+getUrls"></a>

### translationUrlBase.getUrls(urlType) ⇒ <code>Array.&lt;Object&gt;</code>
Return all URLs of this object with given type.

**Kind**: instance method of [<code>TranslationUrlBase</code>](#TranslationUrlBase)  

| Param | Type | Description |
| --- | --- | --- |
| urlType | <code>string</code> | The type of URLs to get (url_type property in url metadata   objects) |

<a name="TranslationBase+getTranslation"></a>

### translationUrlBase.getTranslation(field, config) ⇒ <code>string</code>
Translate this object's field.

**Kind**: instance method of [<code>TranslationUrlBase</code>](#TranslationUrlBase)  
**Overrides**: [<code>getTranslation</code>](#TranslationBase+getTranslation)  
**Returns**: <code>string</code> - Either the translated field or if a translation doesn't
  exist, the field's default value. The return value is an object if `returnUsedLanguage` is
  used, see the documentation of the global function `getTranslation` for the format.  
**See**

- [setLanguage](#Store+setLanguage)
- [LANGUAGES](#LANGUAGES)


| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | The field's name to get a translation for. |
| config | <code>Object</code> |  |
| config.language | <code>string</code> | Optional alpha-3 language code for the   translation. If not given, the current language of `store` is used. |
| config.returnUsedLanguage | <code>boolean</code> | See the documentation of the global function   `getTranslation`. |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |

<a name="UrlBase"></a>

## UrlBase ⇐ [<code>Base</code>](#Base)
Base class for API objects that support URLs.

**Kind**: global class  
**Extends**: [<code>Base</code>](#Base)  
<a name="UrlBase+getUrls"></a>

### urlBase.getUrls(urlType) ⇒ <code>Array.&lt;Object&gt;</code>
Return all URLs of this object with given type.

**Kind**: instance method of [<code>UrlBase</code>](#UrlBase)  

| Param | Type | Description |
| --- | --- | --- |
| urlType | <code>string</code> | The type of URLs to get (url_type property in url metadata   objects) |

<a name="LANGUAGES"></a>

## LANGUAGES
Language alpha-2 codes as keys, alpha-3 codes as values (extracted from pycountry).

**Kind**: global constant  
<a name="LANGUAGES_ALPHA_3"></a>

## LANGUAGES\_ALPHA\_3
Language alpha-3 codes as keys, alpha-2 codes as values (extracted from pycountry).

**Kind**: global constant  
<a name="store"></a>

## store : [<code>Store</code>](#Store)
The global store object.

**Kind**: global constant  
<a name="configureMdsCore"></a>

## configureMdsCore()
Configure global settings.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| config.apiBaseUrl | <code>string</code> | Base URL of the MDS API, without the domain or version prefix.   For example `"https://api.mydatashare.com"`. |
| config.apiVersion | <code>string</code> | The MDS API version, defaults to `"v3.0"`. |
| config.AuthItem.backgroundFetchOidConfig | <code>boolean</code> | Whether to fetch OID configurations for   found IdProviders in background during [parseApiResponse](#Store+parseApiResponse).   Defaults to `true`. |

<a name="fetchAuthItems"></a>

## fetchAuthItems(config) ⇒ <code>Promise.&lt;Object&gt;</code>
Fetch the auth_items endpoint of the MyDataShare API.

**Kind**: global function  
**See**

- [fetchAllPages](#fetchAllPages)
- [combinePaginatedResponses](#combinePaginatedResponses)


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> |  |
| config.fetchAll | <code>boolean</code> | If true (default), fetches as many times as   there are paginated responses and combines the responses to a single   object. |

<a name="combinePaginatedResponses"></a>

## combinePaginatedResponses(responses) ⇒ <code>Object</code>
Combine a list of objects received from MyDataShare API into a single object.
The responses should be the unmodified full JSON responses as they are
received from the API.

The MyDataShare API is paginated. A response will contain the property
next_offset if there are more data to fetch that was left out from the
response. Take the value of next_offset and pass it in the property offset in
the JSON body of a search endpoint request to use it.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| responses | <code>Array.&lt;Object&gt;</code> | A list of objects to merge into one. |

<a name="fetchAllPages"></a>

## fetchAllPages(url, config) ⇒ <code>Promise.&lt;Object&gt;</code>
Fetch a resource from the MyDataShare API, and if there are enough data for
the response to be paginated, fetch all the remaining pages and combine the
responses into a single object.

**Kind**: global function  
**See**: [combinePaginatedResponses](#combinePaginatedResponses)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The full URL to fetch. |
| config | <code>Object</code> |  |
| config.options | <code>Object</code> | Options to pass to the fetch call(s). |

<a name="getTranslation"></a>

## getTranslation(obj, field, language, metadatas, config) ⇒ <code>string</code> \| <code>Object</code>
Return a translation for the given API object's field.

The translation is extracted from the given translations object, if
a translation for this object's field is found in the given language.
If no translation is found and notFoundError is false, the object's default
field value is returned.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>Object</code> - The translation if found, otherwise the default field value
  of the object. If `returnUsedLanguage` was `true`, returns an object with the properties
  `val` (the translation) and `lang` (the language of the translation or default value, or
  null if the language could not be determined).  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The API object for which the translation should be   extracted for. The item must be translatable, i.e. it must have the   translation_id property. |
| field | <code>string</code> | The field name for which to get the translation. |
| language | <code>string</code> | The alpha-3 language code. You can use   [LANGUAGES](#LANGUAGES) mapping to convert alpha-2 language codes to alpha-3. |
| metadatas | <code>Object</code> | The value (object) of the metadatas property   which can be found in the MyDataShare API responses that contain   translatable objects for which there are translations. |
| config | <code>Object</code> |  |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested translation was not found. |
| config.returnUsedLanguage | <code>boolean</code> | If true, also returns the language of the returned   string. Can be used only if `notFoundError` is `false`. The return value will be an object with   properties `val` and `lang`. The `lang` property will be equal to the language   parameter given to this function if the translation was found. If no translation was found and   the object whose translation was requested has a `default_language` field, then the value of   that is returned in the `lang` property. Otherwise the `lang` property will be null. |

<a name="translateAll"></a>

## translateAll(language, fields, objects, metadatas, config) ⇒ <code>Array.&lt;Object&gt;</code>
Return a list of translated versions of given API objects.

All given objects must have have the same translatable fields given in
"fields" parameter.

The given objects are not modified. Uses [getTranslation](#getTranslation) for
metadatas, see its documentation for the parameter explanations.

**Kind**: global function  
**See**: [getTranslation](#getTranslation)  

| Param | Type |
| --- | --- |
| language |  | 
| fields | <code>Array.&lt;string&gt;</code> | 
| objects | <code>Array.&lt;Object&gt;</code> | 
| metadatas | <code>Object</code> | 
| config | <code>Object</code> | 
| config.notFoundError | <code>boolean</code> | 

<a name="getUrls"></a>

## getUrls(obj, urlType, metadatas, config) ⇒ <code>Array.&lt;Object&gt;</code>
Return URLs of specific type for given API object from given URLs resource.

The URLs are extracted from the given metadatas object, if found. If URLs are not
found, an empty list is returned

**Kind**: global function  
**Returns**: <code>Array.&lt;Object&gt;</code> - Found URLs or empty if none was found.  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | The API object for which the URL should be extracted for.   The item must support URLs, i.e. it must have a url_group_id property. |
| urlType | <code>string</code> | The type of URLs to get (subtype1 property in url metadata   objects) |
| metadatas | <code>Object</code> | The value (object) of the metadatas property which can be   found in the MyDataShare API responses that contain objects that support   URLs, and for which there exists URLs. |
| config | <code>Object</code> |  |
| config.notFoundError | <code>boolean</code> | If true, an error will be thrown if the   requested URLs were not found. |

<a name="authorizationCallback"></a>

## authorizationCallback(clientId, redirectUri) ⇒ [<code>Promise.&lt;AuthorizationData&gt;</code>](#AuthorizationData)
Parse authorization response from the URL and perform a token request.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;AuthorizationData&gt;</code>](#AuthorizationData) - Returns a Promise which resolves with
  access and id token information.  

| Param | Type | Description |
| --- | --- | --- |
| clientId | <code>string</code> | The client ID to use. |
| redirectUri | <code>string</code> | The redirect_uri registered for given client. |

<a name="endSession"></a>

## endSession() ⇒ <code>boolean</code>
Navigate to the end_session endpoint for logging out the user.

If the config values needed for navigating to end_session endpoint
(id_token_hint, OID configuration) are not found in LocalStorage, the user
will not be taken to the end_session_endpoint and instead this method will
return false. This can happen for example if a user clears the browser's
cache.

When false is returned, ending any possible local sessions should be handled
manually.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether navigation to end_session endpoint succeeded.  
