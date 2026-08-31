import PropTypes from 'prop-types';

export const FormRow = ({ label, children }) => (
  <div className="report-editor-row">
    <span className="report-editor-row__label">{label}</span>
    <div className="report-editor-row__content">{children}</div>
  </div>
);

FormRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export const LabeledSection = ({ title, children }) => (
  <div className="report-editor-section">
    {title && <h4 className="report-editor-section__heading">{title}</h4>}
    {children}
  </div>
);

LabeledSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};
