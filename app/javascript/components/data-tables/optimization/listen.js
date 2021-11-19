import { refresh } from './refresh.js';

export function miqOptimizationInit() {
  window.listenToRx((data) => {
    if (data.controller !== 'OptimizationController') {
      return;
    }

    switch (data.action) {
      case 'refresh':
        refresh();
        break;
    }
  });
}
