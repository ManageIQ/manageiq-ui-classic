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
    isLoading, timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels, tableContent,
  }, setState] = useState({
    isLoading: true,
    tableContent: { headers: [], rows: [] },
  });

  useEffect(() => {
    if (isLoading) {
      API.options(`/api/event_streams`).then((dropdownValues) => {
        const data = dropdownValues.data.timeline_events;
        const managementGroupNames = []; const managementGroupLevels = []; const policyGroupNames = []; const
          policyGroupLevels = [];
        const timelineEvents = [
          { label: data.EmsEvent.description, value: 'EmsEvent' },
          { label: data.MiqEvent.description, value: 'MiqEvent' },
        ];

        // Management Events
        Object.entries(data.EmsEvent.group_names).forEach((entry) => {
          const [key, value] = entry;
          managementGroupNames.push({ label: value, value: key });
        });
        Object.entries(data.EmsEvent.group_levels).forEach((entry) => {
          const [key, value] = entry;
          managementGroupLevels.push({ label: value, value: key });
        });

        // Policy Events
        Object.entries(data.MiqEvent.group_names).forEach((entry) => {
          const [key, value] = entry;
          policyGroupNames.push({ label: value, value: key });
        });
        Object.entries(data.MiqEvent.group_levels).forEach((entry) => {
          const [key, value] = entry;
          policyGroupLevels.push({ label: value, value: key });
        });

        // TODO: is there a way to make the above more elegant/shorter
        setState((state) => ({
          ...state,
          isLoading: false,
          timelineEvents,
          managementGroupNames,
          managementGroupLevels,
          policyGroupNames,
          policyGroupLevels,
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
        tableContent: { headers, rows },
      }));
    });
  };

  const onReset = () => {
    setState((state) => ({
      ...state,
      tableContent: { headers: [], rows: [] },
    }));
  };

  const exitPage = () => {
    miqSparkleOn();
    const returnURL = '/vm_infra/explorer/';
    const message = sprintf(__('Returned to previous page'));
    miqRedirectBack(message, 'warning', returnURL);
  };

  const miqTableContent = tableContent.rows.length > 0 ? (
    <MiqDataTable
      rows={tableContent.rows}
      headers={tableContent.headers}
      onCellClick={() => {}}
      mode="db-list"
    />
  ) : <NoRecordsFound />;

  return !isLoading && (
    <>
      <MiqFormRenderer
        componentMapper={mapper}
        schema={createSchemaSimple(
          timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels,
        )}
        onSubmit={onSubmit}
        onCancel={exitPage}
        onReset={onReset}
        canReset
      />
      <>{miqTableContent}</>
    </>
  );
};

export default TimelineOptions;
