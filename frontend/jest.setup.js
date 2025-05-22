import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock window.alert
window.alert = jest.fn();

// Mock window.prompt
window.prompt = jest.fn();

// Mock window.confirm
window.confirm = jest.fn();