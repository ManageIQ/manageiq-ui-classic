import React from 'react';
import PropTypes from 'prop-types';

import fieldsMapper from '../../forms/mappers/formFieldsMapper';
import { componentTypes } from '@@ddf';

const Component = fieldsMapper[componentTypes.BUTTON];

const DetectButton = ({ formOptions, dependencies, target, FormSpyProvider, ...props }) => {
  return <span/>;

  // const onClick = () => {
  //   // TODO: api('detect endpoint data').then('store in form using formOptions');
  // };
  // return <Component formOptions={formOptions} {...props} onClick={onClick} />;
};

export default DetectButton;
