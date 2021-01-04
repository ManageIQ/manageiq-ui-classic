import React from 'react';
import { mount } from 'enzyme';
import { componentTypes } from '@@ddf';
import { act } from 'react-dom/test-utils';

import MiqFormRenderer from '../../forms/data-driven-form';

describe('DataDrivenForm', () => {
  let initialProps;

  beforeEach(() => {
    const schema = {
      fields: [{
        component: componentTypes.TEXT_FIELD,
        name: 'name',
      }],
    };
    initialProps = {
      schema,
      store: ManageIQ.redux.store,
    };
  });

  it('should render correctly', () => {
    const wrapper = mount(<MiqFormRenderer {...initialProps} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(1);

    expect(wrapper.html()).toMatchSnapshot();
  });

  it('should set pristine in reducer when changing state', () => {
    const wrapper = mount(<MiqFormRenderer {...initialProps} />);
    const changeInput = value => act(() => {
      wrapper.find('input').first().simulate('change', { target: { value } });
    });

    changeInput('changed-value');

    expect(ManageIQ.redux.store.getState().FormButtons.pristine).toEqual(false);

    changeInput('');

    expect(ManageIQ.redux.store.getState().FormButtons.pristine).toEqual(true);
  });
});
