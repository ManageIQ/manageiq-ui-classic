import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';
import { useDispatch } from 'react-redux';
import { miqCustomTabActions } from '../../miq-redux/actions/miq-custom-tab-actions';
import { labelConfig, tabText } from './helper';

const MiqCustomTab = ({ containerId, tabLabels, type }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ loading: false });

  /** Labels used for a Tab found from the 'type'. */
  const selectedLabels = labelConfig(type);

  /** Configuration for tabs using this component.
   * type: Unique string used to identify the tab component.
   * js: Returns a function that gets executed on tab onClick event.
   * url: Redirects to the specified url on tab onClick event.
   */
  const tabConfigurations = (name) => [
    { type: 'AE-RESOLVE-OPTIONS' },
    { type: 'CATALOG_SUMMARY' },
    { type: 'CATALOG_EDIT', js: () => name === 'detail' && dispatch(miqCustomTabActions.incrementClickCount()) },
    { type: 'CATALOG_REQUEST_INFO', url: `/miq_request/prov_field_changed?tab_id=${name}&edit_mode=true` },
    { type: 'UTILIZATION' },
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
  const staticContents = (name, config) => {
    const tabs = containerTabs();
    tabs.forEach((child) => {
      if (child.parentElement.id === containerId) {
        child.classList.remove('active');
        if (child.id === `${name}`) {
          child.classList.add('active');
          if (config.js) config.js();
        }
      }
    });
    miqSparkleOff();
  };

  /** Function to load tab contents after a url is executed.
   *  After the url is executed, the selected tab contents are displays using the staticContents function.
  */
  const dynamicContents = (name, config) => {
    clearTabContents();
    window.miqJqueryRequest(config.url).then(() => {
      staticContents(name, config);
      setData({ loading: false });
    });
  };

  /** Function to handle tab click events. */
  const onTabSelect = (name) => {
    if (!data.loading) {
      miqSparkleOn();
      const config = configuration(name);
      return config && config.url ? dynamicContents(name, config) : staticContents(name, config);
    }
    return data;
  };

  /** Function to render the tabs from the tabLabels props */
  const renderTabs = () => tabLabels.map((label) => (
    <Tab key={`tab${label}`} label={`${tabText(selectedLabels, label)}`} onClick={() => onTabSelect(label)} />
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
  tabLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  type: PropTypes.string.isRequired,
};
