import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { InformationFilled } from '@carbon/icons-react';
import { Tooltip, Tag, FormLabel } from '@carbon/react';
import ServiceContext from '../ServiceContext';

/** Returns a plain string label safe for Carbon's labelText / titleText props. */
export const fieldLabelText = (field) => field.label || '';

/** Refreshing indicator rendered above the field, separate from Carbon's label. */
const RefreshingLabel = ({ label }) => (
  <Tag className="field-label-refreshing" type="red">{__(`Refreshing ${label}...`)}</Tag>
);

RefreshingLabel.propTypes = { label: PropTypes.string.isRequired };

/**
 * Renders the full label row above a field — required asterisk, label text,
 * and an optional description tooltip. Rendered outside Carbon's labelText
 * prop so interactive elements (the tooltip trigger button) are allowed.
 * Pass hideLabel to the Carbon component alongside this.
 */
const FieldLabel = React.memo(({ field }) => {
  const { data } = useContext(ServiceContext);

  if (data.fieldsToRefresh.includes(field.name)) {
    return <RefreshingLabel label={field.label} />;
  }

  return (
    <div className="field-label">
      <FormLabel htmlFor={`${field.name}-${field.type}-${field.id}`}>
        {data.isOrderServiceForm && field.required && <span className="field-required">*</span>}
        {field.label}
        {field.description && (
          <Tooltip label={field.description} align="right">
            <button type="button" className="tooltip-trigger" aria-label={field.description}>
              <InformationFilled size={16} />
            </button>
          </Tooltip>
        )}
      </FormLabel>
    </div>
  );
});

FieldLabel.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    label: PropTypes.string.isRequired,
    required: PropTypes.bool,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default FieldLabel;
