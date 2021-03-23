const decodeJwt = (jwt) => {
  const [header, payload, signature] = jwt.split('.');
  return {
    header: JSON.parse(atob(header)),
    payload: JSON.parse(atob(payload)),
    signature,
  };
};

const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const ret = {};
  params.forEach((value, key) => {
    if (params.getAll(key).length > 1) {
      ret[key] = params.getAll(key);
    } else {
      ret[key] = value;
    }
  });
  return ret;
};

const getHashParams = () => parseQueryString(window.location.hash.replace(/^#/, ''));

const getSearchParams = () => parseQueryString(window.location.search.replace(/^\?/, ''));

export {
  decodeJwt, getHashParams, getSearchParams, parseQueryString,
};
