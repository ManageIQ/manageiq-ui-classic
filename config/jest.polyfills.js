// Polyfills required before module loading (e.g., for react-router v7 which needs TextEncoder).
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
