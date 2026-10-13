import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

/**
 * Render a group of tags in a table.
 */
const TagGroup = ({ title, items, onClick }) => (
  <MiqStructuredList
    rows={items}
    title={title}
    mode="tag_group"
    onClick={(item, event) => onClick(item, event)}
  />
);

export default TagGroup;

TagGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.any.isRequired,
  onClick: PropTypes.func,
};
