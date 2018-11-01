import base64js from 'base64-js';

const { TextEncoderLite } = require('text-encoder-lite');

// utf8-capable window.btoa
export function base64encode(str, encoding = 'utf-8') {
  const bytes = new (window.TextEncoder || TextEncoderLite)(encoding).encode(str);
  return base64js.fromByteArray(bytes);
}
