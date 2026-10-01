import PropTypes from 'prop-types';
import Tag from './tag';
import TaggingPropTypes from './tagging-prop-types';

const defaultTruncate = (str) => (str.length > 18 ? `${str.substring(0, 18)}...` : str);

const TagCategory = ({
  onTagDeleteClick,
  tagCategory,
  values,
  categoryTruncate = defaultTruncate,
  valueTruncate = defaultTruncate,
  showCloseButton = true,
}) => (
  <ul className="tag-category list-inline">
    <li key={tagCategory.id} id={`tag_category_${tagCategory.id}`}>
      <div className="category-label" title={tagCategory.label}>
        {categoryTruncate(tagCategory.label)}
      </div>
    </li>
    {[...values]
      .sort((a, b) => (a.label < b.label ? -1 : 1))
      .map((tagValue) => (
        <Tag
          key={tagValue.id}
          tagCategory={tagCategory}
          tagValue={tagValue}
          onTagDeleteClick={onTagDeleteClick}
          truncate={valueTruncate}
          showCloseButton={showCloseButton}
        />
      ))}
  </ul>
);

TagCategory.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: TaggingPropTypes.category,
  values: PropTypes.arrayOf(TaggingPropTypes.category).isRequired,
  categoryTruncate: PropTypes.func,
  valueTruncate: PropTypes.func,
  showCloseButton: PropTypes.bool,
};

export default TagCategory;
