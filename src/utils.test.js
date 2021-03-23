import { getHashParams, getSearchParams } from './utils';

describe('parsing hash params', () => {
  test('leading hash character is removed', () => {
    window.location.hash = '#code=123&return_url=https://example.com#';
    expect(getHashParams()).toEqual({
      code: '123',
      return_url: 'https://example.com#',
    });
  });

  test('multiple values are returned in list', () => {
    window.location.hash = 'asd=1&qwe=3&asd=2';
    expect(getHashParams()).toEqual({
      asd: ['1', '2'],
      qwe: '3',
    });
  });
});

describe('parsing search params', () => {
  test('leading question mark character is removed and multiple values returned in list', () => {
    // Combined two test cases to one because of Object.defineProperty quirks
    Object.defineProperty(window, 'location', {
      value: {
        search:
          '?code=123&asd=1&qwe=3&asd=2&return_url=https://example.com?about',
      },
    });
    expect(getSearchParams()).toEqual({
      code: '123',
      return_url: 'https://example.com?about',
      asd: ['1', '2'],
      qwe: '3',
    });
  });
});
