import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import MiqFormRenderer from '@@ddf';
import createSchema from './control-simulation-form.schema';

const ControlSimulationForm = ({ sb_rsop }) => {
  const [{
    typeId,
    filterTypeId,
    eventSelectionTypeArray,
  }, setState] = useState({});

  useEffect(() => {
    // eslint-disable-next-line camelcase
    API.get(`/api/event_definition_sets?expand=resources`).then((valuesReceived) => {
      const eventDescription = [];
      valuesReceived.resources.forEach((element) => {
        eventDescription.push({
          label: element.description,
          value: element.id,
        });
      });
      eventDescription.sort(function(a,b){
        var textA = a.label;
        var textB = b.label;
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;    
      })
      setState((state) => ({
        ...state,
        eventSelectionTypeArray: eventDescription,
      }));
    });
  }, []);

  const onSubmit = (values) => {
    miqSparkleOn();
    const payload = {
      action: 'simulate_policy',
      resources: [
        { id: values.filter_value.value, event: values.type_event },
      ],
    };
    // const payload = {
    //   action: 'simulate_vm_policy',
    //   event: values.type_event,
    //   resources: [
    //     { id: values.filter_value },
    //   ],
    // };
    API.post(`/api/vms`, payload).then((valuesReceived) => {
      const taskId = valuesReceived.results[0].task_id;
      if (taskId !== '-1') {
        API.wait_for_task(taskId).then((results) => {
          miqSparkleOff();
          sendDataWithRx({ type: 'policySimulationResults', namedScope: results });
        });
      }
    });
    // API.post(`/api/cluster`, payload).then((valuesReceived) => {
    //   const taskId = valuesReceived.results[0].task_id;
    //   if (taskId != '-1') {
    //     API.wait_for_task(taskId).then((results) => {
    //       miqSparkleOff();
    //       sendDataWithRx({ type: 'policySimulationResults', namedScope: results });
    //     });
    //   }
    // });
  };

  const onReset = () => {
    sendDataWithRx({ type: 'resetPolicySimulationResults' });
  };

  return (
    <MiqFormRenderer
      schema={createSchema(
        { sb_rsop }, // information brough in from Ruby
        typeId,
        filterTypeId,
        setState,
        eventSelectionTypeArray,
      )}
      canReset
      onReset={onReset}
      onSubmit={onSubmit}
    />

  );
};

ControlSimulationForm.propTypes = {
  recordId: PropTypes.string,
};
ControlSimulationForm.defaultProps = {
  recordId: undefined,
};

export default ControlSimulationForm;
