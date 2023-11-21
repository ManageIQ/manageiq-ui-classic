import React, { useContext } from 'react';
import { Tabs, Tab, Loading } from 'carbon-components-react';
import DialogGroups from './DialogGroups';
import ServiceContext from './ServiceContext';
import { extractDialogTabs } from './helper';

/** Component to render the Tabs in the Service component */
const DialogTabs = () => {
  const { data } = useContext(ServiceContext);
  const dialogTabs = extractDialogTabs(data.apiResponse);

  const tabLabel = (tab, tabIndex) => {
    const { fieldsToRefresh, groupFieldsByTab } = data;
    const refreshInProgress = fieldsToRefresh.some((field) => groupFieldsByTab[tabIndex].includes(field));
    return refreshInProgress
      ? (
        <div className="tab-label">
          {tab.label}
          <Loading active small withOverlay={false} className="loading" />
        </div>
      )
      : tab.label;
  };

  return (
    <Tabs className="miq_custom_tabs">
      {
        dialogTabs.map((tab, tabIndex) => (
          <Tab key={tab.id.toString()} label={tabLabel(tab, tabIndex)}>
            <div className="tabs">
              <DialogGroups dialogGroups={tab.dialog_groups} />
            </div>
          </Tab>
        ))
      }
    </Tabs>
  );
};

export default DialogTabs;
