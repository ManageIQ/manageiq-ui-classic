import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, Select, SelectItem } from '@carbon/react';
import TagView from '../tagging-editor/tag-view';
import TaggingEditor from '../tagging-editor';
import ExpressionEditor from '../expression-editor';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import { miqExpressionToHuman } from '../expression-editor/expression-human';

const CustomerTagsTab = ({
  tags,
  assignedTags,
  onAssignedTagsChange,
  useFilterExpression,
  onToggle,
  filterExpression,
  onExpressionChange,
  readOnly,
}) => {
  const [expressionText, setExpressionText] = useState(() => '');
  const [validationErrors, setValidationErrors] = useState([]);
  const labelMapRef = useRef(new Map());
  const tagValuesCacheRef = useRef(null);

  const handleContextReady = (labelMap, tagValuesCache) => {
    labelMapRef.current = labelMap;
    tagValuesCacheRef.current = tagValuesCache;
    if (filterExpression) {
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      setExpressionText(miqExpressionToHuman(filterExpression, labelMap, tagMap));
    }
  };

  const handleQueryChange = (q, errors = []) => {
    setValidationErrors(errors);
    if (errors.length > 0) {
      setExpressionText('');
      onExpressionChange(q, errors);
      return;
    }
    const expression = rqbToMiq(q);
    const tagMap = tagValuesCacheRef.current ? tagValuesCacheRef.current.current : new Map();
    setExpressionText(expression ? miqExpressionToHuman(expression, labelMapRef.current, tagMap) : '');
    onExpressionChange(q, errors);
  };

  if (readOnly) {
    if (useFilterExpression) {
      return (
        <div className="customer-tags-tab">
          <p>{__('Filter Expression:')}</p>
          {filterExpression
            ? <pre>{JSON.stringify(filterExpression, null, 2)}</pre>
            : <p className="miq-no-record">{__('No Filter Expression defined')}</p>}
        </div>
      );
    }
    return (
      <div className="customer-tags-tab">
        <p>{__('This user is limited to items with the selected tags.')}</p>
        <TagView
          assignedTags={tags.assignedTags || []}
          hideHeader
          showCloseButton={false}
        />
      </div>
    );
  }

  return (
    <div className="customer-tags-tab">
      <div className="cds--form-item" style={{ marginBottom: '1rem' }}>
        <Select
          id="use-filter-expression"
          labelText={__('This user is limited to')}
          value={useFilterExpression ? 'expression' : 'tags'}
          onChange={(e) => onToggle(e.target.value === 'expression')}
        >
          <SelectItem value="tags" text={__('Specific Tags')} />
          <SelectItem value="expression" text={__('Tags Based On Expression')} />
        </Select>
      </div>

      {useFilterExpression ? (
        <>
          <ExpressionEditor
            model="MiqGroup"
            onlyTags
            value={filterExpression}
            onQueryChange={handleQueryChange}
            onContextReady={handleContextReady}
            seedEmpty
          />
          {validationErrors.length > 0 && (
            <InlineNotification
              kind="error"
              title={__('Expression incomplete')}
              subtitle={validationErrors.join(' ')}
              hideCloseButton
              lowContrast
            />
          )}
          {validationErrors.length === 0 && (
            expressionText
              ? (
                <div className="exp-preview">
                  <div className="exp-preview__label">{__('Preview')}</div>
                  <div>{expressionText}</div>
                </div>
              )
              : (
                <InlineNotification
                  kind="info"
                  title={__('No filter expression defined.')}
                  hideCloseButton
                  lowContrast
                />
              )
          )}
        </>
      ) : (
        <div className="tagging-container">
          <TaggingEditor
            tags={tags.tags || []}
            assignedTags={assignedTags}
            onChange={onAssignedTagsChange}
          />
        </div>
      )}
    </div>
  );
};

CustomerTagsTab.propTypes = {
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    assignedTags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    affectedItems: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  assignedTags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
  onAssignedTagsChange: PropTypes.func.isRequired,
  useFilterExpression: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  filterExpression: PropTypes.shape({}),
  onExpressionChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

export default CustomerTagsTab;
