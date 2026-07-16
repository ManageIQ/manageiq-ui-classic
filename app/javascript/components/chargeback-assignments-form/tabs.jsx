import PropTypes from 'prop-types';
import MiqTabs from '../miq-tabs';
import ChargebackAssignmentsForm from '.';

const tabs = [
  { id: 'Compute', label: 'Compute', content: <ChargebackAssignmentsForm rateType="Compute" /> },
  { id: 'Storage', label: 'Storage', content: <ChargebackAssignmentsForm rateType="Storage" /> },
];

const ChargebackAssignmentsTabs = ({ initialTab = 0 }) => (
  <MiqTabs tabs={tabs} initialTab={initialTab} />
);

ChargebackAssignmentsTabs.propTypes = {
  initialTab: PropTypes.number,
};

export default ChargebackAssignmentsTabs;
