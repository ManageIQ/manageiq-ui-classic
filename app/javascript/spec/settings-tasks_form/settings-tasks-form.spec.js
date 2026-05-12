import React from 'react';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import SettingsTasksForm from '../../components/settings-tasks-form';

import '../helpers/miqAjaxButton';

describe('VM common form component', () => {
  let submitSpy;
  beforeEach(() => {
    submitSpy = jest.spyOn(window, 'miqAjaxButton');
  });
  const timePeriods = [
    ['Today', '0'],
    ['1 Days Ago', '1'],
    ['2 Days Ago', '2'],
    ['3 Days Ago', '3'],
    ['4 Days Ago', '4'],
    ['5 Days Ago', '5'],
    ['6 Days Ago', '6'],
  ];
  const zones = [['All Zones', 'all']];
  const taskStates = [['All States', 'all']];
  const tz = { tzinfo: { info: { identifier: 'America/New_York' } } };
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpy.mockRestore();
  });
  it('should render my tasks form', () => {
    const { container } = renderWithRedux(
      <SettingsTasksForm
        allTasks={false}
        zones={zones}
        users="admin"
        timePeriods={timePeriods}
        taskStates={taskStates}
        tz={tz}
      />
    );
    expect(container).toMatchSnapshot();
  });
  it('should render all tasks form', () => {
    const users = ['admin', '1', 'system'];
    const { container } = renderWithRedux(
      <SettingsTasksForm
        allTasks
        zones={zones}
        users={users}
        timePeriods={timePeriods}
        taskStates={taskStates}
        tz={tz}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
