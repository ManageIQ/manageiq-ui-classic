import React from 'react';
import PropTypes from 'prop-types';
import { Icon, Wizard, Button } from 'patternfly-react';

const SimpleNext = ({
  next,
  handleNext,
  buttonLabels,
  disabled,
}) => (
  <Button
    bsStyle="primary"
    type="button"
    onClick={() => (handleNext(next))}
    disabled={disabled}
  >
    { buttonLabels.next }
    <Icon type="fa" name="angle-right" />
  </Button>
);

SimpleNext.propTypes = {
  next: PropTypes.string,
  valid: PropTypes.bool,
  handleNext: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired,
  buttonLabels: PropTypes.object.isRequired,
};

const ConditionalNext = ({
  nextStep,
  FieldProvider,
  ...rest
}) => (
  <FieldProvider
    name={nextStep.when}
    subscription={{ value: true }}
  >
    { ({ input: { value } }) => <SimpleNext next={nextStep.stepMapper[value]} {...rest} /> }
  </FieldProvider>
);

ConditionalNext.propTypes = {
  nextStep: PropTypes.shape({
    when: PropTypes.string.isRequired,
    stepMapper: PropTypes.object.isRequired,
  }).isRequired,
  FieldProvider: PropTypes.func.isRequired,
};

const getOnlyVisited = (values, registeredFields) => {
  console.log(registeredFields);
  return registeredFields.reduce((acc, curr) => [...acc, ...curr], [])
    .reduce((acc, curr) => ({ ...acc, [curr]: values[curr] }), {});
};

const submitButton = (handleSubmit, submitText, registeredFields, valid, getState) => (
  <Button type="button" bsStyle="primary" onClick={() => handleSubmit(getOnlyVisited(getState().values, registeredFields))} disabled={!valid}>
    { submitText }
  </Button>
);

const renderNextButton = ({
  nextStep,
  handleSubmit,
  onSubmit,
  buttonLabels,
  valid,
  registeredFields,
  getState,
  ...rest
}) =>
  (!nextStep
    ? submitButton(onSubmit, buttonLabels.submit, registeredFields, valid, getState)
    : typeof nextStep === 'object'
      ? <ConditionalNext nextStep={nextStep} buttonLabels={buttonLabels} {...rest} disabled={!valid} />
      : <SimpleNext next={nextStep} buttonLabels={buttonLabels} {...rest} disabled={!valid} />);

const WizardStepButtons = ({
  formOptions, disableBack, handlePrev, nextStep, FieldProvider, handleNext, buttonLabels, registeredFields,
}) => (
  <Wizard.Footer>
    { formOptions.onCancel && (
      <Button
        style={{ marginRight: 20 }}
        type="button"
        variant="contained"
        color="secondary"
        onClick={formOptions.onCancel}
      >
        { buttonLabels.cancel }
      </Button>
    ) }

    <Button
      type="button"
      variant="contained"
      disabled={disableBack}
      onClick={handlePrev}
    >
      <Icon type="fa" name="angle-left" />
      { buttonLabels.back }
    </Button>
    { renderNextButton({
      ...formOptions,
      handleNext,
      nextStep,
      FieldProvider,
      buttonLabels,
      registeredFields,
    }) }
  </Wizard.Footer>
);

WizardStepButtons.propTypes = {
  formOptions: PropTypes.shape({
    onCancel: PropTypes.func,
    handleSubmit: PropTypes.func,
  }),
  disableBack: PropTypes.bool,
  handlePrev: PropTypes.func.isRequired,
  handleNext: PropTypes.func.isRequired,
  nextStep: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      when: PropTypes.string.isRequired,
      stepMapper: PropTypes.object.isRequired,
    }),
  ]),
  FieldProvider: PropTypes.func.isRequired,
  buttonLabels: PropTypes.object.isRequired,
};

WizardStepButtons.defaultProps = {
  formOptions: undefined,
};

export default WizardStepButtons;
