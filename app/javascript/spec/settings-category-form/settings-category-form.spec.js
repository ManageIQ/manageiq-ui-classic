import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';

import { mount } from '../helpers/mountForm';
import SettingsCategoryForm from '../../components/settings-category-form';

describe('SettingsCategoryForm Component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render a new SettingsCategoryForm form', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsCategoryForm recordId="new" />);
    });
    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render edit SettingsCategoryForm', async(done) => {
    fetchMock.getOnce('/api/categories/100', {});
    let wrapper;
    await act(async() => {
      wrapper = mount(<SettingsCategoryForm recordId="100" />);
    });
    expect(fetchMock.calls()).toHaveLength(1);
    expect(fetchMock.called('/api/categories/100')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
