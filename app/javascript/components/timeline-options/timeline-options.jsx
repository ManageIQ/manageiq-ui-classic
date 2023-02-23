import React, { useState, useEffect } from 'react';
import MiqFormRenderer from '@@ddf';
import PropTypes from 'prop-types';
import createSchemaSimple from './timeline-options-simple.schema';
import mapper from '../../forms/mappers/componentMapper';
import validatorMapper from '../../forms/mappers/validatorMapper';

const getOneWeekAgo = () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return [oneWeekAgo];
};

const TimelineOptions = ({ submitChosenFormOptions }) => {
  const [{
    isLoading, timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels, initialValues,
  }, setState] = useState({
    isLoading: true,
    initialValues: {
      startDate: getOneWeekAgo(),
      endDate: [new Date()],
    },
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
    setState((state) => ({
      ...state,
      initialValues: values,
    }));
  };

  return !isLoading && (
    <>
      <input type="hidden" id="ignore_form_changes" />
      <MiqFormRenderer
        componentMapper={mapper}
        validatorMapper={validatorMapper}
        schema={createSchemaSimple(
          timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels,
        )}
        initialValues={initialValues}
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
