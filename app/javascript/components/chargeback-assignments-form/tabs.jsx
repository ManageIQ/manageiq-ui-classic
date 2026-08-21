import PropTypes from 'prop-types';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import ChargebackAssignmentsForm from '.';

const tabs = [
  { id: 'Compute', label: 'Compute', content: <ChargebackAssignmentsForm rateType="Compute" /> },
  { id: 'Storage', label: 'Storage', content: <ChargebackAssignmentsForm rateType="Storage" /> },
];

const ChargebackAssignmentsTabs = ({ initialTab = 0 }) => (
  <Tabs defaultSelectedIndex={initialTab}>
    <TabList aria-label="chargeback assignment tabs">
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

ChargebackAssignmentsTabs.propTypes = {
  initialTab: PropTypes.number,
};

export default ChargebackAssignmentsTabs;
