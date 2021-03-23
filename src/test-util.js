function deepFreeze(object) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self

  propNames.forEach((name) => {
    const value = object[name];

    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });

  return Object.freeze(object);
}

// eslint-disable-next-line import/prefer-default-export
export { deepFreeze };
