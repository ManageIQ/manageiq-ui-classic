import React from 'react';
import PropTypes from 'prop-types';

import componentMapper from '../../forms/mappers/componentMapper';
import { componentTypes, useFormApi } from '@@ddf';

const Component = componentMapper[componentTypes.BUTTON];

const DetectButton = ({ dependencies, target, FormSpyProvider, ...props }) => {
  const formOptions = useFormApi();
  return <span/>;

  // const onClick = () => {
  //   // TODO: api('detect endpoint data').then('store in form using formOptions');
  // };
  // return <Component formOptions={formOptions} {...props} onClick={onClick} />;
};

export default DetectButton;
