import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Wizard as PfWizard } from 'patternfly-react';
import WizardStepButtons from './step-buttons';

const WizardStep = ({
  fields,
  formOptions,
  registeredFields,
  ...rest
}) => (
  <Fragment>
    <PfWizard.Row>
      <PfWizard.Main>
        <div className="form-horizontal">
          { fields.map(item => formOptions.renderForm([item], formOptions)) }
        </div>
      </PfWizard.Main>
    </PfWizard.Row>
    <WizardStepButtons
      formOptions={formOptions}
      registeredFields={registeredFields}
      {...rest}
    />
  </Fragment>
);

WizardStep.propTypes = {
  fields: PropTypes.array,
  formOptions: PropTypes.shape({
    renderForm: PropTypes.func,
  }),
};

WizardStep.defaultProps = {
  formOptions: undefined,
  fields: [],
};

export default WizardStep;
