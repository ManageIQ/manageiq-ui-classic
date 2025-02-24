import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import SettingsHelpMenu from '../../components/settings-help-menu-form';

describe('SettingsHelpMenu', () => {
  const settingsHelpMenuMockData = [
    {
      href: 'ops/settings_update_help_menu',
    },
  ];

  const initialValues = [
    {
      title: 'title1',
      href: 'href1',
      type: 'type1',
    },
    {
      title: 'title2',
      href: 'href2',
      type: 'type2',
    },
    {
      title: 'title3',
      href: 'href3',
      type: 'type3',
    },
  ];

  const initialDropdownValues = [
    'type1',
    'type2',
    'type3',
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should submit a help menu change', async() => {
    const wrapper = shallow(<SettingsHelpMenu
      initialValues={initialValues}
      initialDropdownValues={initialDropdownValues}
    />);

    fetchMock.get(`/ops/settings_update_help_menu/`, settingsHelpMenuMockData);
    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});