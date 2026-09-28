import React from 'react';
import PropTypes from 'prop-types';
import { DefinitionTooltip } from '@carbon/react';
import DialogFields from './DialogFields';

/** Component to render the Groups in the Service/DialogTabs component */
const DialogGroups = ({ dialogGroups }) => {
  const itemLabel = ({ label, description }) => (description
    ? (
      <DefinitionTooltip definition={description} align="bottom-start" openOnHover>
        {label}
      </DefinitionTooltip>
    )
    : label);

  return (
    <>
      {
        dialogGroups.map((item) => (
          <div className="section" key={item.id.toString()}>
            <div className="section-label">
              {itemLabel(item)}
            </div>
            <DialogFields dialogFields={item.dialog_fields} />
          </div>
        ))
      }
    </>
  );
};

DialogGroups.propTypes = {
  dialogGroups: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default DialogGroups;
