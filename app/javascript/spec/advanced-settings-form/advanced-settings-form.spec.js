import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';

import AdvancedSettingsForm from '../../components/advanced-settings-form';
import { mount } from '../helpers/mountForm';

describe('AdvancedSettingsForm component', () => {
  const url = '/api/foo';

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('matches the snapshot', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = shallow(<AdvancedSettingsForm url={url} />);
    });

    wrapper.update();
    expect(toJson(wrapper)).toMatchSnapshot();

    done();
  });

  it('loads the data via the API', async(done) => {
    fetchMock.get(url, { foo: 'bar' });

    let wrapper;
    await act(async() => {
      wrapper = mount(<AdvancedSettingsForm url={url} />);
    });

    wrapper.update();
    expect(fetchMock.called(url)).toBe(true);

    done();
  });
});
