import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import ScheduleForm from '../../components/schedule-form/index';
import {
  scheduleResponse1,
  scheduleResponse2,
  timezones,
  actionOptions,
  filterOptions,
  resources,
  actionResponse,
  targets,
} from './data';
import { renderWithRedux } from '../helpers/mountForm';

describe('Schedule form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render schedule add form', async() => {
    fetchMock.get('/api', { timezones });

    const { container } = renderWithRedux(
      <ScheduleForm
        recordId="new"
        actionOptions={actionOptions}
        filterOptions={filterOptions}
      />
    );
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(1);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should render edit form when filter_type is not null', async() => {
    fetchMock.getOnce('/api', { timezones });
    fetchMock.getOnce('/ops/schedule_form_fields/1', scheduleResponse1);
    fetchMock.getOnce(
      '/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending',
      { resources }
    );

    const { container } = renderWithRedux(
      <ScheduleForm
        recordId="1"
        actionOptions={actionOptions}
        filterOptions={filterOptions}
      />
    );
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(3);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(
      container.querySelector('[name="attribute_1"]')
    ).not.toBeInTheDocument();
    expect(container.querySelector('[name="value_1"]')).not.toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  it('should render edit form when filter_type is null', async() => {
    const zoneUrl = '/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending';
    fetchMock.getOnce('/api', { timezones });
    fetchMock.getOnce('/ops/schedule_form_fields/1', scheduleResponse2);
    fetchMock.getOnce(zoneUrl, { resources });
    fetchMock.postOnce('/ops/automate_schedules_set_vars/new', actionResponse);
    fetchMock.postOnce('/ops/fetch_target_ids/?target_class=AvailabilityZone', {
      targets,
    });
    fetchMock.getOnce(zoneUrl, { resources }, { overwriteRoutes: false });

    const { container } = renderWithRedux(
      <ScheduleForm
        recordId="1"
        actionOptions={actionOptions}
        filterOptions={filterOptions}
      />
    );
    await waitFor(() => {
      expect(fetchMock.calls()).toHaveLength(6);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    expect(container.querySelector('[name="attribute_1"]')).toBeInTheDocument();
    expect(container.querySelector('[name="value_1"]')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
