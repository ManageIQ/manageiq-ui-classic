import React from 'react';
import { mount } from 'enzyme';
import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { layoutMapper } from '@data-driven-forms/pf3-component-mapper';

import formFieldsMapper from '../../forms/mappers/formFieldsMapper';
import DataDrivenForm from '../../forms/data-driven-form';

describe('DataDrivenForm', () => {
  let initialProps;
  let schema;
  let onSubmit;

  beforeEach(() => {
    onSubmit = jest.fn();
    schema = {
      fields: [{
        component: componentTypes.TEXT_FIELD,
        name: 'name',
      }],
    };
    initialProps = {
      layoutMapper,
      formFieldsMapper,
      schema,
      onSubmit,
    };
  });

  afterEach(() => {
    onSubmit.mockReset();
  });

  it('should render correctly', () => {
    const wrapper = mount(<DataDrivenForm {...initialProps} store={ManageIQ.redux.store} />);
    expect(wrapper.find('form')).toHaveLength(1);
    expect(wrapper.find('input')).toHaveLength(1);
  });

  it('should set pristine in reducer when changing state', () => {
    const wrapper = mount(<DataDrivenForm {...initialProps} store={ManageIQ.redux.store} />);
    wrapper.find('input').first().simulate('change', { target: { value: 'changed-value' } });

    expect(ManageIQ.redux.store.getState().formReducer.pristine).toEqual(false);

    wrapper.find('input').first().simulate('change', { target: { value: '' } });

    expect(ManageIQ.redux.store.getState().formReducer.pristine).toEqual(true);
  });
});
