// TODO: Remove this entire file once TypeScript migration is complete

/**
 * Enable PropTypes validation for React 19
 *
 * React 19 removed automatic PropTypes checking. This module restores it
 * by monkey-patching React.createElement to manually call checkPropTypes
 * for components from third-party libraries).
 *
 * This only runs in development mode and has no effect in production.
 */

import React from 'react';
import { checkPropTypes } from 'prop-types';

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'development') {
  const originalCreateElement = React.createElement;

  React.createElement = function(type, props, ...children) {
    // Check PropTypes for function/class components that have propTypes defined
    // eslint-disable-next-line react/forbid-foreign-prop-types
    if (type && typeof type === 'function' && type.propTypes) {
      checkPropTypes(
        // eslint-disable-next-line react/forbid-foreign-prop-types
        type.propTypes,
        props || {},
        'prop',
        type.displayName || type.name || 'Component'
      );
    }

    return originalCreateElement(type, props, ...children);
  };
}
