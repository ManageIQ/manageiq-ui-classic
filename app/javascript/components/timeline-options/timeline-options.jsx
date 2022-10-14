import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import createSchemaSimple from './timeline-options-simple.schema';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import mapper from '../../forms/mappers/componentMapper';
import { tableData, buildUrl } from './helper';
import MiqDataTable from '../miq-data-table';
import NoRecordsFound from '../no-records-found';

const TimelineOptions = () => {
  const [{
    isLoading, timeline_events, management_group_names, management_group_levels, policy_group_names, policy_group_levels, table_content,
  }, setState] = useState({
    isLoading: true,
    table_content: { headers: [], rows: [] },
  });

  useEffect(() => {
    if (isLoading) {
      API.options(`/api/event_streams`).then((dropdownValues) => {
        const data = dropdownValues.data.timeline_events;
        const management_group_names = []; const management_group_levels = []; const policy_group_names = []; const
          policy_group_levels = [];
        const timeline_events = [
          { label: data.EmsEvent.description, value: 'EmsEvent' },
          { label: data.MiqEvent.description, value: 'MiqEvent' },
        ];

        // Management Events
        for (const [key, value] of Object.entries(data.EmsEvent.group_names)) {
          management_group_names.push({ label: value, value: key });
        }
        for (const [key, value] of Object.entries(data.EmsEvent.group_levels)) {
          management_group_levels.push({ label: value, value: key });
        }

        // Policy Events
        for (const [key, value] of Object.entries(data.MiqEvent.group_names)) {
          policy_group_names.push({ label: value, value: key });
        }
        for (const [key, value] of Object.entries(data.MiqEvent.group_levels)) {
          policy_group_levels.push({ label: value, value: key });
        }

        // TODO: is there a way to make the above more elegant/shorter
        setState((state) => ({
          ...state,
          isLoading: false,
          timeline_events,
          management_group_names,
          management_group_levels,
          policy_group_names,
          policy_group_levels,
        }));
      });
    }
  });

  const onSubmit = (values) => {
    miqSparkleOn();
    API.get(buildUrl(values)).then((results) => {
      miqSparkleOff();
      const { headers, rows } = tableData(results);
      setState((state) => ({
        ...state,
        table_content: { headers, rows },
      }));
    });
  };

  const onReset = () => {
    setState((state) => ({
      ...state,
      table_content: { headers: [], rows: [] },
    }));
  };

  const exitPage = () => {
    miqSparkleOn();
    const returnURL = '/vm_infra/explorer/';
    const message = sprintf(__('Returned to previous page'));
    miqRedirectBack(message, 'warning', returnURL);
  };

  const tableContent = table_content.rows.length > 0 ? (
    <MiqDataTable
      rows={table_content.rows}
      headers={table_content.headers}
      onCellClick={() => {}}
      mode="db-list"
    />
  ) : <NoRecordsFound />;

  return !isLoading && (
    <>
      <MiqFormRenderer
        componentMapper={mapper}
        schema={createSchemaSimple(
          timeline_events, management_group_names, management_group_levels, policy_group_names, policy_group_levels,
        )}
        onSubmit={onSubmit}
        onCancel={exitPage}
        onReset={onReset}
        canReset
      />
      <>{tableContent}</>
    </>
  );
};

export default TimelineOptions;
