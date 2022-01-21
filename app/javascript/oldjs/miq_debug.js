import { renderToastWrapper, setupErrorHandlers } from '../components/miq_debug';

const { miqSparkleOff } = window;

// CTRL+SHIFT+X stops the spinner
const keysPressed = {};
window.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
  if (keysPressed.Shift && keysPressed.Control && event.key === 'X') {
    miqSparkleOff;
  }
});
window.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});

// Warn for duplicate DOM IDs
window.addEventListener('DOMContentLoaded', () => {
  (function() {
    const { send } = XMLHttpRequest.prototype;
    XMLHttpRequest.prototype.send = function() {
      this.addEventListener('load', () => {
        const elms = document.getElementsByTagName('*'); let i; let len; const ids = {}; const idsDom = {};
        let id;
        for (i = 0, len = elms.length; i < len; i += 1) {
          id = elms[i].id || null;
          if (id) {
            const arrPush = (arr, val) => {
              arr.push(val);
              return arr;
            };
            ids[id] = Object.prototype.hasOwnProperty.call(ids, id) ? ids[id] += 1 : 0;
            idsDom[id] = Object.prototype.hasOwnProperty.call(idsDom, id) ? arrPush(idsDom[id], elms[i]) : [elms[i]];
          }
        }
        for (const id in ids) {
          if (ids.hasOwnProperty(id)) {
            if (ids[id]) {
              idsDom[id].forEach((dom) => {
                console.warn(`Duplicate DOM ID --> #${id} `, dom);
              });
            }
          }
        }
        // add your global handler here
      });
      return send.apply(this, arguments);
    };
  }());

  // toast on error
  (function() {
    const e = document.createElement('div');
    e.classList.add('toast-wrapper');
    document.body.appendChild(e);
    renderToastWrapper(e);
    setupErrorHandlers();
  }());
});
