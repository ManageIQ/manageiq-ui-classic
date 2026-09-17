import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import TagCategory from './tag-category';
import TaggingPropTypes from './tagging-prop-types';
import NotificationMessage from '../notification-message';

const TagView = ({
  assignedTags = [],
  onTagDeleteClick = undefined,
  header = __('Assigned tags'),
  hideHeader = false,
  showCloseButton = true,
}) => {
  const view = assignedTags.length > 0
    ? (
      <ul className="list-inline">
        {[...assignedTags]
          .sort((a, b) => (a.label < b.label ? -1 : 1))
          .map((tag) => (
            <li key={tag.id}>
              <TagCategory
                tagCategory={{ id: tag.id, label: tag.label }}
                values={tag.values}
                onTagDeleteClick={onTagDeleteClick}
                showCloseButton={showCloseButton}
              />
            </li>
          ))}
      </ul>
    )
    : <NotificationMessage type="info" message={__('No Assigned Tags')} />;

  return (
    <div id="assignments_div">
      {!hideHeader && (
        <Grid className="tag-modifier-header">
          <Column sm={4} md={8} lg={16}>
            <h4>{header}</h4>
          </Column>
        </Grid>
      )}
      <Grid className="tag-modifier-form assigned-tags" condensed>
        <Column sm={4} md={8} lg={16}>
          {view}
        </Column>
      </Grid>
    </div>
  );
};

TagView.propTypes = {
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func,
  header: PropTypes.string,
  hideHeader: PropTypes.bool,
  showCloseButton: PropTypes.bool,
};

export default TagView;
