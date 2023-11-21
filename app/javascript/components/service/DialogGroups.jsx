import React from 'react';
import PropTypes from 'prop-types';
import DialogFields from './DialogFields';

/** Component to render the Groups in the Service/DialogTabs component */
const DialogGroups = ({ dialogGroups }) => (
  <>
    {
      dialogGroups.map((item) => (
        <div className="section" key={item.id.toString()}>
          <div className="section-label">
            {item.label}
          </div>
          <div className="section-fields">
            <DialogFields dialogFields={item.dialog_fields} />
          </div>
        </div>
      ))
    }
  </>
);

DialogGroups.propTypes = {
  dialogGroups: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default DialogGroups;
