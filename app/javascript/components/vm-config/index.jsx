import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

/** Renders one or more label/value structured-list tables for a VM config display page. */
const VmConfig = ({ sections = [] }) => (
  <>
    {sections.map(({ title, rows }) => (
      <MiqStructuredList
        key={title}
        title={title}
        rows={rows}
        mode="generic_group"
      />
    ))}
  </>
);

VmConfig.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    rows: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
      icon: PropTypes.string,
      image: PropTypes.string,
    })).isRequired,
  })),
};

export default VmConfig;
