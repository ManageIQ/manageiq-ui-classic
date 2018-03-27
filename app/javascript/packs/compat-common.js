import base64js from 'base64-js';
import TextEncoderLite from 'text-encoder-lite';

// utf8-capable window.btoa
window.base64encode = (str, encoding = 'utf-8') => {
  let bytes = new (TextEncoder || TextEncoderLite)(encoding).encode(str);
  return base64js.fromByteArray(bytes);
};
