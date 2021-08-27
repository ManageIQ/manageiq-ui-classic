import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { mount } from '../helpers/mountForm';
import SettingsTasksForm from '../../components/settings-tasks-form';

require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('VM common form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  const timePeriods = [
    'Today',
    '1 Days Ago',
    '2 Days Ago',
    '3 Days Ago',
    '4 Days Ago',
    '5 Days Ago',
    '6 Days Ago',
  ];
  const tz = { tzinfo: { info: { identifier: 'America/New York' } } };
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });
  it('should render my tasks form', () => {
    const wrapper = shallow(<SettingsTasksForm allTasks={false} zones={[]} users="admin" timePeriods={timePeriods} taskStates={[]} tz={tz} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should render all tasks form', () => {
    const users = [
      'admin',
      '1',
      'system',
    ];
    const wrapper = shallow(<SettingsTasksForm allTasks zones={[]} users={users} timePeriods={timePeriods} taskStates={[]} tz={tz} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
