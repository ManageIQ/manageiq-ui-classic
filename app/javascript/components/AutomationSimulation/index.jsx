import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';
import NotificationMessage from '../notification-message';
import MiqStructuredList from '../miq-structured-list';

/** Component to render the summary contents displayed in the Automation / Embedded Automate / Simulation */
const AutomationSimulation = ({ data }) => {
  const [tabConfig, setTabConfig] = useState([]);
  useEffect(() => {
    if (Object.keys(data).length > 1) {
      const config = Object.keys(data).map((name) => ({ name, text: data[name].text }));
      setTabConfig(config);
    }
  }, [data]);

  /** Function to render the tabs contents. */
  const renderTabContent = (name) => {
    const config = tabConfig.find((item) => item.name === name);
    return (config || data[name].rows.length > 0
      ? <MiqStructuredList title={config.text} rows={data[name].rows} mode={`miq_summary ${name}`} />
      : <NotificationMessage type="info" message={__('Tab details not found.')} />);
  };

  /** Function to render the tab and its contents */
  const renderTabs = () =>
    (
      <Tabs className="automation_simulation_tab">
        {
          tabConfig.map(({ name, text }) => (
            <Tab key={`tab${name}`} label={`${text}`}>
              {
                renderTabContent(name)
              }
            </Tab>
          ))
        }
      </Tabs>
    );

  return Object.keys(data).length <= 1
    ? <NotificationMessage type="info" message={data.notice} />
    : renderTabs();
};

AutomationSimulation.propTypes = {
  data: PropTypes.shape({
    notice: PropTypes.string,
  }).isRequired,
};

export default AutomationSimulation;
