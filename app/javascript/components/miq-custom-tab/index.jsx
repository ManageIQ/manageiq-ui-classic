import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';

const MiqCustomTab = ({ containerId, tabLabels, type }) => {
  const [data, setData] = useState({ loading: false });
  const tabConfigurations = (name) => [
    { type: 'CATALOG_SUMMARY' },
    { type: 'CATALOG_EDIT' },
    { type: 'CATALOG_REQUEST_INFO', url: `/miq_request/prov_field_changed?tab_id=${name}&edit_mode=true` },
  ];

  const configuration = (name) => tabConfigurations(name).find((item) => item.type === type);

  const tabIdentifier = (name) => {
    const config = configuration(name);
    const cType = config && config.url ? 'dynamic' : 'static';
    return `${type.toLowerCase()}_${cType}`;
  };

  /** Function to find the tabs dom elements using the container Id. */
  const containerTabs = () => {
    const container = document.getElementById(containerId);
    if (!container) {
      return [];
    }
    return container.getElementsByClassName('tab_content');
  };

  /** Function to clear all tabs content so that, the react component will render a fresh instance */
  const clearTabContents = () => {
    const tabs = containerTabs();
    tabs.forEach((child) => {
      child.innerHTML = '';
    });
  };

  /** Function to load the tab contents which are already available within the page. */
  const staticContents = (name) => {
    const tabs = containerTabs();
    tabs.forEach((child) => {
      if (child.parentElement.id === containerId) {
        child.classList.remove('active');
        if (child.id === `${name}`) {
          child.classList.add('active');
        }
      }
    });
    miqSparkleOff();
  };

  /** Function to load tab contents after a url is executed.
   *  After the url is executed, the selected tab contents are displayes using the staticContents function.
  */
  const dynamicContents = (name, url) => {
    clearTabContents();
    window.miqJqueryRequest(url).then(() => {
      staticContents(name);
      setData({ loading: false });
    });
  };

  /** Function to hande tab click events. */
  const onTabSelect = (name) => {
    if (!data.loading) {
      miqSparkleOn();
      const config = configuration(name);
      return config && config.url ? dynamicContents(name, config.url) : staticContents(name);
    }
    return data;
  };

  /** Function to render the tabs from the tabLabels props */
  const renderTabs = () => tabLabels.map(({ name, text }) => (
    <Tab key={`tab${name}`} label={text} onClick={() => onTabSelect(name)} />
  ));

  return (
    <Tabs className="miq_custom_tabs" id={tabIdentifier('')}>
      {renderTabs()}
    </Tabs>
  );
};

export default MiqCustomTab;

MiqCustomTab.propTypes = {
  containerId: PropTypes.string.isRequired,
  tabLabels: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    text: PropTypes.string,
  })).isRequired,
  type: PropTypes.string.isRequired,
};
