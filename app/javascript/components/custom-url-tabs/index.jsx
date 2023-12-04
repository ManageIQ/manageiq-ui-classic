import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs, Modal } from 'carbon-components-react';
import { checkForFormChanges } from './helper';

const CustomURLTabs = ({
  tabs, path, currentTab, checkForChanges,
}) => {
  const [{ selectedTab, showConfirm, url }, setState] = useState({ selectedTab: 0, showConfirm: false });
  const activeTabClassName = 'bx--tabs--scrollable__nav-item--selected';

  const onTabClick = (id) => {
    if (currentTab !== id) {
      if (checkForChanges && checkForFormChanges()) {
        setState((state) => ({
          ...state,
          showConfirm: true,
          url: `${path}${id}?uib-tab=${id}`,
        }));
        document.getElementById(id).parentElement.classList.add(activeTabClassName);
      } else {
        window.location.replace(`${path}${id}?uib-tab=${id}`);
      }
    }
  };

  const fixTabStyling = () => {
    document.getElementsByClassName(activeTabClassName).forEach((element) => {
      element.classList.remove(activeTabClassName);
    });
    document.getElementsByClassName('selected')[0].classList.add(activeTabClassName);
  };

  useEffect(() => {
    const currentTabIndex = tabs.findIndex((tab) => tab[0] === currentTab);
    if (currentTabIndex) {
      setState((state) => ({
        ...state,
        selectedTab: currentTabIndex,
      }));
    }
  }, []);

  useEffect(() => {
    if (showConfirm) {
      document.getElementsByClassName('selected')[0].classList.remove(activeTabClassName);
    } else if (document.getElementsByClassName('selected').length > 0) {
      fixTabStyling();
    }
  }, [showConfirm]);

  return (
    <div className="custom-url-tabs">
      <Modal
        open={showConfirm}
        primaryButtonText={__('OK')}
        secondaryButtonText={__('Cancel')}
        onRequestClose={() => {
          setState((state) => ({
            ...state,
            showConfirm: false,
          }));
        }}
        onRequestSubmit={() => window.location.replace(url)}
        onSecondarySubmit={() => {
          setState((state) => ({
            ...state,
            showConfirm: false,
          }));
          fixTabStyling();
        }}
      >
        {__('Abandon changes?')}
      </Modal>
      <Tabs selected={selectedTab}>
        {tabs.map((tab) => (
          <Tab
            key={tab[0]}
            id={tab[0]}
            className={`${tab[0]}` === currentTab ? 'selected' : 'not-selected'}
            label={__(tab[1])}
            onClick={() => onTabClick(tab[0])}
          />
        ))}
      </Tabs>
    </div>
  );
};

CustomURLTabs.propTypes = {
  tabs: PropTypes.arrayOf(String).isRequired,
  path: PropTypes.string.isRequired,
  currentTab: PropTypes.string,
  checkForChanges: PropTypes.bool,
};

CustomURLTabs.defaultProps = {
  currentTab: '0',
  checkForChanges: false,
};

export default CustomURLTabs;
