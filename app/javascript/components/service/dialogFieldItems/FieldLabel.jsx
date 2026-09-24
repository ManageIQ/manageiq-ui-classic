import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { InformationFilled } from '@carbon/icons-react';
import { Tooltip, Tag } from '@carbon/react';
import ServiceContext from '../ServiceContext';

/** Function to render a Tag when the field refresh is in progress. */
const refreshingLabel = (label) => <Tag className="field-label-refreshing" type="red">{__(`Refreshing ${label}...`)}</Tag>;

/** Function to render a ToolTip when a field description is available. */
const getTooltip = (description) => (
  description ? (
    <div className="field-description">
      <Tooltip label={description} align="right">
        <button type="button" className="tooltip-trigger">
          <InformationFilled />
        </button>
      </Tooltip>
    </div>
  ) : null
);

/** Function to render refreshing label for a field. */
const getFieldLabelContent = (field, data) => {
  if (data.fieldsToRefresh.includes(field.name)) {
    return refreshingLabel(field.label);
  }
  return (
    <>
      {data.isOrderServiceForm && field.required && <span className="field-required">*</span>}
      {field.label}
      {getTooltip(field.description)}
    </>
  );
};

/** Component to render the fields label */
const FieldLabel = React.memo(({ field }) => {
  const { data } = useContext(ServiceContext);
  const labelContent = useMemo(() => getFieldLabelContent(field, data), [field, data]);
  return (
    <div className="field-label">
      {labelContent}
    </div>
  );
});

FieldLabel.propTypes = {
  field: PropTypes.shape({
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default FieldLabel;
