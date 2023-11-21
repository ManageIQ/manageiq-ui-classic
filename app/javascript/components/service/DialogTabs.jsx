import React, { useContext } from 'react';
import { Tabs, Tab } from 'carbon-components-react';
import DialogGroups from './DialogGroups';
import ServiceContext from './ServiceContext';
import { extractDialogTabs } from './helper';

/** Component to render the Tabs in the Service component */
const DialogTabs = () => {
  const { data } = useContext(ServiceContext);
  const dialogTabs = extractDialogTabs(data.apiResponse);
  return (
    <Tabs className="miq_custom_tabs">
      {
        dialogTabs.map((tab) => (
          <Tab key={tab.id.toString()} label={tab.label}>
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
