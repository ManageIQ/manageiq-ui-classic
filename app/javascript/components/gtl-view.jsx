import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { GTLView } from '@manageiq/react-ui-components/dist/gtl';
import '@manageiq/react-ui-components/dist/gtl.css';

/* TODO move the manageiq-specific logic such as communication with the API here */
const GtlView = (props) => {
  return <GTLView />
};

GtlView.propTypes = {
};

export default GtlView;
