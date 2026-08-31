import type { FormRowProps, LabeledSectionProps } from './report-editor-types';

export const FormRow = ({ label, children }: FormRowProps) => (
  <div className="report-editor-row">
    <span className="report-editor-row__label">{label}</span>
    <div className="report-editor-row__content">{children}</div>
  </div>
);

export const LabeledSection = ({ title, children }: LabeledSectionProps) => (
  <div className="report-editor-section">
    {title && <h4 className="report-editor-section__heading">{title}</h4>}
    {children}
  </div>
);
