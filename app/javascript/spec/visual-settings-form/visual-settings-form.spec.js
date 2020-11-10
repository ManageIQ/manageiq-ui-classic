import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import VisualSettingsForm from '../../components/visual-settings-form';
import { mount } from '../helpers/mountForm';

describe('visual settings form', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  window.locales = [];

  const shortcuts = '/api/shortcuts?expand=resources&attributes=description,url';
  const users = '/api/users/1?attributes=settings';

  it('calls the API endpoints to preseed the form', async(done) => {
    fetchMock.get(shortcuts, {
      resources: [
        {
          url: 'foo',
          description: 'bar',
        },
      ],
    });

    fetchMock.get(users, { settings: {} });

    fetchMock.get('/api', { timezones: [] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<VisualSettingsForm recordId="1" />);
    });

    wrapper.update();

    expect(fetchMock.called(shortcuts)).toBe(true);
    expect(fetchMock.called(users)).toBe(true);
    expect(fetchMock.called('/api')).toBe(true);

    done();
  });

  it('matches the snapshot', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = shallow(<VisualSettingsForm recordId="1" />);
    });

    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
