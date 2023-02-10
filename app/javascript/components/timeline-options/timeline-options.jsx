import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchemaSimple from './timeline-options-simple.schema';
import mapper from '../../forms/mappers/componentMapper';

const TimelineOptions = ({ submitChosenFormOptions }) => {
  const [{
    isLoading, timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels,
  }, setState] = useState({
    isLoading: true,
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
        // NOTE: data.MiqEvent.group_levels does not have the expected `Both` option
        policyGroupLevels.push({ label: __('Success'), value: 'success' });
        policyGroupLevels.push({ label: __('Failure'), value: 'failure' });
        policyGroupLevels.push({ label: __('Both'), value: 'both' });

        // TODO: is there a way to make the above more elegant/shorter?
        // NOTE: group_names for MiqEvents and MiqEvents includes the 'Other' option,
        // this did not exist in previous versions of the timeline
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
    const categories = values.timelineEvents === 'EmsEvent' ? values.managementGroupNames : values.policyGroupNames;
    const newData = {
      type: values.timelineEvents,
      group: categories,
      group_level: values.managementGroupLevels ? values.managementGroupLevels : [values.policyGroupLevels],
      start_date: values.startDate,
      end_date: values.endDate,
    };
    submitChosenFormOptions(newData);
  };

  return !isLoading && (
    <>
      <MiqFormRenderer
        componentMapper={mapper}
        schema={createSchemaSimple(
          timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels,
        )}
        onSubmit={onSubmit}
        buttonsLabels={{ submitLabel: __('Apply') }}
      />
    </>
  );
};

TimelineOptions.propTypes = {
  submitChosenFormOptions: PropTypes.func,
};

TimelineOptions.defaultProps = {
  submitChosenFormOptions: undefined,
};

export default TimelineOptions;
