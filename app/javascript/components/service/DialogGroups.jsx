import React from 'react';
import PropTypes from 'prop-types';
import { TooltipIcon } from 'carbon-components-react';
import DialogFields from './DialogFields';

/** Component to render the Groups in the Service/DialogTabs component */
const DialogGroups = ({ dialogGroups }) => {
  const itemLabel = ({ label, description }) => (description
    ? <TooltipIcon direction="right" tooltipText={description}>{label}</TooltipIcon>
    : label);

  return (
    <>
      {
        dialogGroups.map((item) => (
          <div className="section" key={item.id.toString()}>
            <div className="section-label">
              {itemLabel(item)}
            </div>
            <div className="section-fields">
              <DialogFields dialogFields={item.dialog_fields} />
            </div>
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
