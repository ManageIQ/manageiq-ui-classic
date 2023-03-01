import React from 'react';

import { FormSpy } from '../forms/data-driven-form';
import Select from '../components/select';

const enhancedSelect = (props) => <FormSpy subscription={{ values: true }}>{() => <Select {...props} />}</FormSpy>;

export default enhancedSelect;
