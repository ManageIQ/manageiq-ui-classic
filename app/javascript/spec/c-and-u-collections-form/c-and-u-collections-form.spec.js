import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';

import { mount } from '../helpers/mountForm';
import DiagnosticsCURepairForm from '../../components/c-and-u-collections-form';

describe('DiagnosticsCURepairForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('Should render a new DiagnosticsCURepair form', async() => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<DiagnosticsCURepairForm />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
