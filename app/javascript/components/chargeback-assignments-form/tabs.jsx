import PropTypes from 'prop-types';
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@carbon/react';
import ChargebackAssignmentsForm from '.';

const ChargebackAssignmentsTabs = ({ initialTab = 0 }) => (
  <div>
    <h1>{__('Chargeback Assignments')}</h1>
    <Tabs defaultSelectedIndex={initialTab}>
      <TabList aria-label="chargeback assignment tabs">
        <Tab key="Compute">{__('Compute')}</Tab>
        <Tab key="Storage">{__('Storage')}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel key="Compute">
          <ChargebackAssignmentsForm rateType="Compute" />
        </TabPanel>
        <TabPanel key="Storage">
          <ChargebackAssignmentsForm rateType="Storage" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
);

ChargebackAssignmentsTabs.propTypes = {
  initialTab: PropTypes.number,
};

export default ChargebackAssignmentsTabs;
