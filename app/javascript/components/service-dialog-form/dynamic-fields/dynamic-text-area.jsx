import PropTypes from 'prop-types';
import { TextArea } from '@carbon/react';

const DynamicTextArea = ({ field }) => (
  <TextArea
    id={`field-${field.name}`}
    labelText={field.label}
    value={field.default_value || ''}
    readOnly={field.read_only}
    rows={3}
    // CSS constrains height — no inline style needed; see style.scss
    onChange={() => {}} // display-only in the editor canvas
  />
);

DynamicTextArea.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default DynamicTextArea;
