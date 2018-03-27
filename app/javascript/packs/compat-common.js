import base64js from 'base64-js';
const TextEncoderLite = require('text-encoder-lite').TextEncoderLite;

// utf8-capable window.btoa
window.base64encode = (str, encoding = 'utf-8') => {
  let bytes = new (window.TextEncoder || TextEncoderLite)(encoding).encode(str);
  return base64js.fromByteArray(bytes);
};
