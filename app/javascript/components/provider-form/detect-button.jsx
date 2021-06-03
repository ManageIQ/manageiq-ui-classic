import React from 'react';

import { componentTypes, useFormApi } from '@@ddf';
import componentMapper from '../../forms/mappers/componentMapper';

// eslint-disable-next-line no-unused-vars
const Component = componentMapper[componentTypes.BUTTON];

// eslint-disable-next-line no-unused-vars, react/prop-types
const DetectButton = ({ dependencies, target, ...props }) => {
  // eslint-disable-next-line no-unused-vars
  const formOptions = useFormApi();
  return <span />;

  // const onClick = () => {
  //   // TODO: api('detect endpoint data').then('store in form using formOptions');
  // };
  // return <Component formOptions={formOptions} {...props} onClick={onClick} />;
};

export default DetectButton;
