import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';

const MiqCustomTab = ({ containerId, tabLabels }) => {
  const onTabSelect = (name) => {
    const container = document.getElementById(containerId);
    const tabs = container.getElementsByClassName('tab_content');
    tabs.forEach((child) => {
      child.classList.remove('active');
      if (child.id === `tab_${name}`) {
        child.classList.add('active');
      }
    });
  };

  const renderTabs = () => tabLabels.map(({ name, text }) => (
    <Tab key={`tab${name}`} label={text} onClick={() => onTabSelect(name)} />
  ));

  return (
    <Tabs className="miq_custom_tabs">{renderTabs()}</Tabs>
  );
};

export default MiqCustomTab;

MiqCustomTab.propTypes = {
  containerId: PropTypes.string.isRequired,
  tabLabels: PropTypes.arrayOf({
    name: PropTypes.string,
    text: PropTypes.string,
  }).isRequired,
};
