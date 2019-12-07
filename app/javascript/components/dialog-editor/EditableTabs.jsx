import React, { useState, useContext } from 'react';
import { Icon, TabContainer, Nav, NavItem, TabContent as PfTabContent } from 'patternfly-react';

import { ReducerContext } from 'ddf-editor';
import EditableTabHeader from './EditableTabHeader';
import EditableTabContent from './EditableTabContent';

export default () => {
  const EditableTabs = ({ name: target, fields, formOptions }) => {
    const dispatch = useContext(ReducerContext);

    // Try to retrieve the name of the very first tab
    const firstTab = (() => {
      const [tab] = fields;
      const { name: tabName } = tab || {};
      return tabName;
    })();

    const [activeTab, setActiveTab] = useState(firstTab);

    if (!fields.find(item => item.name === activeTab) && firstTab) {
      setActiveTab(firstTab);
    }

    const renderTabHeader = items => items.map(({ name, title }) => (
      <EditableTabHeader
        key={name}
        active={activeTab === name}
        single={items.length === 1}
        name={name}
        title={title}
        setActiveTab={setActiveTab}
        dispatch={dispatch}
      />
    ));

    return (
      <TabContainer id="dialog-renderer-tabs" activeKey={activeTab} onSelect={() => undefined}>
        <div>
          <Nav bsClass="nav nav-tabs">
            { renderTabHeader(fields) }
            <NavItem eventKey="newTab" onSelect={() => dispatch({ type: 'newTab', target })}>
              <Icon type="fa" name="plus" fixedWidth />
              New Tab
            </NavItem>
          </Nav>
          <PfTabContent animation>
            <div className="spacer" />
            { fields.map(({ name, fields }) => <EditableTabContent key={name} {...{ name, fields, formOptions, dispatch }} />) }
          </PfTabContent>
        </div>
      </TabContainer>
    );
  };

  return EditableTabs;
};
