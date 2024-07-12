import React from 'react';
import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import ProvisionEntryPoint from '../../components/provision-entry-point';

jest.mock('@@ddf', () => ({
  useFieldApi: (props) => ({ meta: {}, input: {}, ...props }),
}));

describe('CodeEditor component', () => {
  let initialProps;
  beforeEach(() => {
    initialProps = {
      id: 'provisioning_entry_point_workflow',
      name: 'provisioning_entry_point_workflow',
      label: 'Provisioning Entry Point',
      field: 'fqname',
      selected: '',
      type: 'provision',
    };
  });

  it('should render correctly', () => {
    const wrapper = shallow(<ProvisionEntryPoint {...initialProps} />);
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });
});
