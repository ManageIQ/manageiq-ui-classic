import PropTypes from 'prop-types';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';

/**
 * Generic tab component.
 *
 * Each entry in `tabs` requires:
 *   { id: string, label: string, content: <ReactNode> }
 *
 * Use `initialTab` (0-based index) to set the default selected tab.
 */
const MiqTabs = ({ tabs, initialTab }) => (
  <Tabs defaultSelectedIndex={initialTab}>
    <TabList aria-label="tabs">
      {tabs.map((tab) => (
        <Tab key={tab.id}>{__(tab.label)}</Tab>
      ))}
    </TabList>
    <TabPanels>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          {tab.content}
        </TabPanel>
      ))}
    </TabPanels>
  </Tabs>
);

MiqTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  })).isRequired,
  initialTab: PropTypes.number,
};

MiqTabs.defaultProps = {
  initialTab: 0,
};

export default MiqTabs;
