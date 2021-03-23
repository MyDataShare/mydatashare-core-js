let savedItems = {};

const localStorageMock = {
  setItem: (key, item) => {
    savedItems[key] = item;
  },
  removeItem: (key) => {
    delete savedItems[key];
  },
  getItem: (key) => savedItems[key],
  clear: () => {
    savedItems = {};
  },
};

const cryptoMock = {
  getRandomValues: (typedArray) => {
    for (let i = 0; i < typedArray.length; i += 1) {
      // eslint-disable-next-line no-param-reassign
      typedArray[i] = 1;
      // typedArray[i] = Math.floor(Math.random() * 10);
    }
  },
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'crypto', { value: cryptoMock });

const oldWindowLocation = window.location;

delete window.location;

window.location = Object.defineProperties(
  {},
  {
    ...Object.getOwnPropertyDescriptors(oldWindowLocation),
    assign: {
      configurable: true,
      value: jest.fn(),
    },
  },
);
