import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { InformationFilled16 } from '@carbon/icons-react';
import { TooltipIcon, Tag } from 'carbon-components-react';
import ServiceContext from '../ServiceContext';

const refreshingLabel = (label) => <Tag className="field-label-refreshing" type="red">{__(`Refreshing ${label}...`)}</Tag>;

const getTooltip = (description) => (
  description ? (
    <div className="field-description">
      <TooltipIcon direction="right" tooltipText={description}>
        <InformationFilled16 />
      </TooltipIcon>
    </div>
  ) : null
);

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
