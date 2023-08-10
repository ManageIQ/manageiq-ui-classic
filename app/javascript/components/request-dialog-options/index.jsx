import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'carbon-components-react';
import MiqStructuredList from '../miq-structured-list';

/** Component to render the dialog options in Request/show page. */
const RequestDialogOptions = ({ data }) => {
  /** Function to render the tabs from the tabLabels props */
  const renderTabs = () => data.map(({ label, content }, tabIndex) => (
    <Tab className="dialog-option-tab" key={`${tabIndex.toString()}-tabKey`} label={label}>
      {content.map((item, contentIndex) => (
        <MiqStructuredList
          key={`${contentIndex.toString()}-contentKey`}
          title={item.title}
          rows={item.rows}
          mode={item.mode}
        />
      ))}
    </Tab>
  ));

  return (
    <Tabs className="miq_custom_tabs">
      {renderTabs()}
    </Tabs>
  );
};

export default RequestDialogOptions;

RequestDialogOptions.propTypes = {
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
};
