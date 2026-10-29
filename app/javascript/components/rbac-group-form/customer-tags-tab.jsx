import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { InlineNotification, Select, SelectItem } from '@carbon/react';
import TagView from '../tagging-editor/tag-view';
import TaggingEditor from '../tagging-editor';
import ExpressionEditor from '../expression-editor';
import { rqbToMiq } from '../expression-editor/expression-adapter';
import { miqExpressionToHuman } from '../expression-editor/expression-human';

// Collects all unique tag paths referenced in a MiqExpression tree.
const collectTagPaths = (miqExp) => {
  if (!miqExp || typeof miqExp !== 'object') {
    return [];
  }
  if (miqExp.and) {
    return miqExp.and.flatMap(collectTagPaths);
  }
  if (miqExp.or) {
    return miqExp.or.flatMap(collectTagPaths);
  }
  if (miqExp.not) {
    return collectTagPaths(miqExp.not);
  }
  const body = Object.values(miqExp)[0] || {};
  return body.tag ? [body.tag] : [];
};

const CustomerTagsTab = ({
  tags,
  assignedTags,
  onAssignedTagsChange,
  useFilterExpression,
  onToggle,
  filterExpression = null,
  onExpressionChange,
  readOnly = false,
}) => {
  const [expressionText, setExpressionText] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const labelMapRef = useRef(new Map());
  const tagValuesCacheRef = useRef(null);

  const handleContextReady = (labelMap, tagValuesCache) => {
    labelMapRef.current = labelMap;
    tagValuesCacheRef.current = tagValuesCache;
    if (filterExpression) {
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      const miqExp = (filterExpression.rules || filterExpression.combinator)
        ? rqbToMiq(filterExpression)
        : filterExpression;
      setExpressionText(miqExp ? miqExpressionToHuman(miqExp, labelMap, tagMap) : '');
    }
  };

  // In read-only mode, proactively fetch tag values for every tag path in
  // the expression so the human summary shows labels (e.g. "2 GB") not raw
  // stored values (e.g. "2048").
  useEffect(() => {
    if (!readOnly || !useFilterExpression || !filterExpression) {
      return;
    }

    const miqExp = (filterExpression.rules || filterExpression.combinator)
      ? rqbToMiq(filterExpression)
      : filterExpression;
    if (!miqExp) {
      return;
    }

    const tagPaths = [...new Set(collectTagPaths(miqExp))];
    if (tagPaths.length === 0) {
      return;
    }

    Promise.all(
      tagPaths.map((tagPath) => http
        .get(`/expression_editor/tag_values?tag=${encodeURIComponent(tagPath)}`, { skipErrors: true })
        .then((data) => {
          const raw = Array.isArray(data) ? data : (data?.tag_values || []);
          const items = raw.map((entry) => (Array.isArray(entry)
            ? { label: entry[0], name: String(entry[1]) }
            : { label: entry.label, name: String(entry.value ?? entry.name) }));
          return [tagPath, items];
        })
        .catch(() => [tagPath, []]))
    ).then((results) => {
      const tagMap = new Map(results);
      setExpressionText(
        miqExpressionToHuman(miqExp, labelMapRef.current, tagMap)
      );
    });
  }, [readOnly, useFilterExpression, filterExpression]);

  const handleQueryChange = (q, errors = []) => {
    setValidationErrors(errors);
    if (errors.length > 0) {
      setExpressionText('');
      onExpressionChange(null, errors);
      return;
    }
    const expression = rqbToMiq(q);
    // tagValuesCacheRef stores the useRef object passed from ExpressionEditor, so .current.current
    // first unwraps our own ref, then unwraps the ExpressionEditor ref to get its Map value.
    const tagMap = tagValuesCacheRef.current ? tagValuesCacheRef.current.current : new Map();
    setExpressionText(expression ? miqExpressionToHuman(expression, labelMapRef.current, tagMap) : '');
    onExpressionChange(expression, errors);
  };

  if (readOnly) {
    if (useFilterExpression) {
      return (
        <div className="customer-tags-tab">
          <div className="customer-tags-tab__expression-section">
            <h4 className="customer-tags-tab__expression-heading">{__('Filter Expression:')}</h4>
            {filterExpression ? (
              <div className="customer-tags-tab__expression-box">
                <div style={{ display: 'none' }}>
                  <ExpressionEditor
                    model="MiqGroup"
                    onlyTags
                    includeModel={false}
                    value={filterExpression}
                    onContextReady={handleContextReady}
                  />
                </div>
                {expressionText
                  ? <p className="customer-tags-tab__expression-text">{expressionText}</p>
                  : <p className="miq-no-record">{__('No Filter Expression defined')}</p>}
              </div>
            ) : (
              <p className="miq-no-record">{__('No Filter Expression defined')}</p>
            )}
          </div>
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
      <div className="cds--form-item customer-tags-tab__filter-mode">
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
            includeModel={false}
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
