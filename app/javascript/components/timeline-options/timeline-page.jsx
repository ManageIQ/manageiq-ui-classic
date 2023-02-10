import React, { useState } from 'react';
import TimelineOptions from './timeline-options';
import TimelineChart from './timeline-chart';
import TimelineTable from './timeline-table';
import NoRecordsFound from '../no-records-found';
import { buildUrl, buildChartDataObject, buildDataTableObject } from './timeline-helper';

const TimelinePage = () => {
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
    API.get(buildUrl(formChoices)).then((chartValues) => {
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

export default TimelinePage;
