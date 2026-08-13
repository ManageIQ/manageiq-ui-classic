import { useState } from 'react';
import PropTypes from 'prop-types';
import { Grid, Column } from '@carbon/react';
import TagModifier from './tag-modifier';
import CategoryModifier from './category-modifier';
import ValueModifier from './value-modifier';
import TagView from './tag-view';

// Pure-React tagging editor — no Redux.
// Props:
//   tags         – available tag categories + values (read-only catalogue)
//   assignedTags – initially assigned tags
//   onChange     – called with the new assignedTags array on every change
//   hideHeaders  – hide the "Add/Modify tag" / "Assigned tags" headers

// ── pure state helpers (ported from tagging/reducers/reducers.js) ────────────

const addOrChangeTag = (assigned, tagCategory, tagValues) => {
  const rest = assigned.filter((t) => t.id !== tagCategory.id);
  if (!tagValues || tagValues.length === 0) {
    return rest;
  }
  return [...rest, { id: tagCategory.id, label: tagCategory.label, values: tagValues }];
};

const deleteTag = (assigned, tagCategory, tagValue) => {
  const rest = assigned.filter((t) => t.id !== tagCategory.id);
  const existing = assigned.find((t) => t.id === tagCategory.id);
  if (!existing) {
    return rest;
  }
  const remaining = existing.values.filter((v) => v.id !== tagValue.id);
  if (remaining.length === 0) {
    return rest;
  }
  return [...rest, { id: tagCategory.id, label: tagCategory.label, values: remaining }];
};

// ── component ────────────────────────────────────────────────────────────────

const TaggingEditor = ({
  tags = [],
  assignedTags: initialAssignedTags = [],
  onChange,
  hideHeaders = false,
}) => {
  const [assignedTags, setAssignedTags] = useState(initialAssignedTags);
  const [selectedTagCategory, setSelectedTagCategory] = useState({});

  const tagCategories = tags.map(({ id, label, singleValue }) => ({ id, label, singleValue }));

  const findCategory = (cat) => tags.find((t) => t.id === cat.id);

  const getCategoryValues = () => (findCategory(selectedTagCategory) || {}).values || [];

  const getSelectedCategoryValues = () => (
    assignedTags.find((t) => t.id === selectedTagCategory.id) || { values: [] }
  ).values;

  const isMulti = (cat) => {
    const found = findCategory(cat);
    if (!found) {
      return true;
    }
    return !found.singleValue;
  };

  const notify = (next) => {
    setAssignedTags(next);
    if (onChange) {
      onChange(next);
    }
  };

  const onTagCategoryChange = (cat) => setSelectedTagCategory(cat);

  const onTagValueChange = ({ tagCategory, tagValue }) => {
    notify(addOrChangeTag(assignedTags, tagCategory, tagValue));
  };

  const onSingleTagValueChange = ({ tagCategory, tagValue }) => {
    // single-value: clear all assigned tags first, then set the new one
    notify(addOrChangeTag([], tagCategory, tagValue));
  };

  const onTagDeleteClick = ({ tagCategory, tagValue }) => {
    notify(deleteTag(assignedTags, tagCategory, tagValue));
  };

  return (
    <Grid className="tagging-row-wrapper tagging-form" condensed>
      <Column sm={4} md={4} lg={8} className="tagging-block-outer">
        <TagModifier hideHeader={hideHeaders}>
          <CategoryModifier
            tagCategories={tagCategories}
            selectedTagCategory={selectedTagCategory}
            onTagCategoryChange={onTagCategoryChange}
          />
          <ValueModifier
            selectedTagCategory={selectedTagCategory}
            onTagValueChange={
              isMulti(selectedTagCategory)
                ? (val) => onTagValueChange({ tagCategory: selectedTagCategory, tagValue: val })
                : (val) => onSingleTagValueChange({ tagCategory: selectedTagCategory, tagValue: val })
            }
            selectedTagValues={getSelectedCategoryValues()}
            multiValue={isMulti(selectedTagCategory)}
            values={getCategoryValues()}
          />
        </TagModifier>
      </Column>
      <Column sm={4} md={4} lg={8} className="tagging-block-outer">
        <TagView
          hideHeader={hideHeaders}
          assignedTags={assignedTags}
          onTagDeleteClick={(tagCategory, tagValue) => onTagDeleteClick({ tagCategory, tagValue })}
          showCloseButton
        />
      </Column>
    </Grid>
  );
};

TaggingEditor.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    singleValue: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
  })),
  assignedTags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
  })),
  onChange: PropTypes.func,
  hideHeaders: PropTypes.bool,
};

export default TaggingEditor;
