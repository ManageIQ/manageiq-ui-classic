import React from 'react';
import { components } from '@data-driven-forms/pf3-component-mapper';

export default props => <components.Select placeholder={`<${__('Choose')}>`} {...props} />;
