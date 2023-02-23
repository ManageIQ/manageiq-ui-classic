import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TimelineOptions from './timeline-options';
import TimelineChart from './timeline-chart';
import TimelineTable from './timeline-table';
import NoRecordsFound from '../no-records-found';
import { buildUrl, buildChartDataObject, buildDataTableObject } from './timeline-helper';

// TODO use timezone to convert the date time to user's set timezone
const TimelinePage = ({ pageFilters, timezone }) => {
  const [{
    timelineChartData, timelineTableData, submitWasPressed,
  }, setState] = useState({
    timelineFormChoices: {},
    timelineResources: [],
    timelineChartData: [],
    timelineTableData: [],
    submitWasPressed: false,
  });

  const submitChosenFormOptions = (formChoices) => {
    miqSparkleOn();
    API.get(buildUrl(formChoices, pageFilters)).then((chartValues) => {
      miqSparkleOff();
      setState((state) => ({
        ...state,
        timelineFormChoices: formChoices,
        timelineResources: chartValues.resources,
        timelineChartData: buildChartDataObject(chartValues),
        timelineTableData: [],
        submitWasPressed: true,
      }));
    });
  };

  const buildTableData = (pointChosen) => {
    setState((state) => ({
      ...state,
      timelineTableData: buildDataTableObject(pointChosen),
    }));
  };

  // eslint-disable-next-line no-nested-ternary
  const timelineComponent = submitWasPressed ? timelineChartData.length === 0 ? <NoRecordsFound />
    : <TimelineChart data={timelineChartData} title={__('Timeline Data')} buildTableData={buildTableData} />
    : <></>;

  const timelineTableComponent = timelineTableData.length === 0 ? <></>
    : <TimelineTable data={timelineTableData} />;

  return (
    <>
      <TimelineOptions submitChosenFormOptions={submitChosenFormOptions} />
      {timelineComponent}
      {timelineTableComponent}
    </>
  );
};

TimelinePage.propTypes = {
  pageFilters: PropTypes.objectOf(PropTypes.any),
};

TimelinePage.defaultProps = {
  pageFilters: {},
};

export default TimelinePage;
