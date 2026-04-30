import React from 'react';

import { componentTypes, useFormApi } from '@@ddf';
import componentMapper from '../../forms/mappers/componentMapper';

const _Component = componentMapper[componentTypes.BUTTON];

// eslint-disable-next-line react/prop-types
const DetectButton = ({ dependencies: _dependencies, target: _target, ..._props }) => {
  const _formOptions = useFormApi();
  return <span />;

  // const onClick = () => {
  //   // TODO: api('detect endpoint data').then('store in form using formOptions');
  // };
  // return <Component formOptions={formOptions} {...props} onClick={onClick} />;
};

export default DetectButton;
