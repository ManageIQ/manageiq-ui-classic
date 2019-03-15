import React, { useState } from 'react';
import { validatorTypes } from '@data-driven-forms/react-form-renderer';
import { Wizard as PfWizard, Modal, Icon } from 'patternfly-react';
import ProviderIcon from './provider-icon';
import WizardStep from './wizard-step';

const defaultButtonLabels = {
  cancel: 'Cancel',
  back: 'Back',
  next: 'Next',
  submit: 'Submit',
};

const stepsHeaders = {
  ec2: [{
    title: 'General Information',
  }, {
    title: 'Endpoints',
  }, {
    title: 'Summary',
  }],
  azure: [{
    title: 'General Information',
  }, {
    title: 'Credentials',
  }, {
    title: 'Summary',
  }],
  gce: [{
    title: 'General Information',
  }, {
    title: 'Endpoints',
  }, {
    title: 'Summary',
  }],
  openstack: [{
    title: 'General Information',
  }, {
    title: 'Endpoints',
  }, {
    title: 'Events',
  }, {
    title: 'RSA key pair',
  }, {
    title: 'Summary',
  }],
  vmware_cloud: [{
    title: 'General Information',
  }, {
    title: 'Endpoints',
  }, {
    title: 'Summary',
  }],
};

const StepsInfo = ({ steps, prevSteps, startStep }) => (
  <PfWizard.Steps steps={steps.map(({ title }, stepIndex) => (
    <PfWizard.Step
      activeStep={prevSteps.length - startStep}
      title={title}
      label={`${stepIndex + 1}`}
      step={stepIndex}
      key={stepIndex}
      stepIndex={stepIndex + 1}
    />))}
  />
);

StepsInfo.defaultProps = {
  prevSteps: [],
  steps: [],
  startStep: 0,
};

const handleNextStep = (prevSteps, activeStep) => [...prevSteps, activeStep];

export const InitialWizardStep = ({ providers, FieldProvider, validate }) => (
  <FieldProvider name="emstype" validate={validate}>
    {({ input, meta }) => (
      <div>
        {providers.map(item => <ProviderIcon key={item.value} active={input.value === item.value} {...item} onClick={() => input.onChange(item.value)} />)}
        {meta.error && meta.error}
      </div>
    )}
  </FieldProvider>
);

const findCurrentStep = (activeStep, fields) => fields.find(({ stepKey }) => stepKey === activeStep);


const MiqWizard = ({
  FieldProvider,
  formOptions,
  providers,
  fields,
  stepKey,
  hideStepperSteps,
}) => {
  const [activeStep, setActiveStep] = useState(stepKey);
  const [prevSteps, setPrevSteps] = useState([]);
  const [registeredFields, setRegisteredFields] = useState([]);
  const [fullSteps] = useState([{
    name: 'provider-select',
    nextStep: 'general',
    fields: [{
      component: 'provider-initial-step',
      name: 'provider-initial-step',
      providers,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    }],
    stepKey,
  }, ...fields]);

  return (
    <PfWizard.Body>
      {!hideStepperSteps.includes(activeStep) && (
        <FieldProvider name="emstype">
          {({ input: { value } }) => (
            <StepsInfo steps={stepsHeaders[value]} prevSteps={prevSteps} startStep={hideStepperSteps.length} />
          )}
        </FieldProvider>
      )}
      <WizardStep
        handleNext={(nextStep) => {
          setRegisteredFields([...registeredFields, formOptions.getRegisteredFields()]);
          setActiveStep(nextStep);
          setPrevSteps(handleNextStep(prevSteps, activeStep));
        }}
        handlePrev={() => {
          registeredFields.pop();
          setActiveStep(prevSteps.pop());
          setRegisteredFields([...registeredFields]);
          setPrevSteps([...prevSteps]);
        }}
        disableBack={prevSteps.length === 0}
        buttonLabels={defaultButtonLabels}
        {...findCurrentStep(activeStep, fullSteps)}
        formOptions={formOptions}
        FieldProvider={FieldProvider}
        registeredFields={registeredFields}
      />
    </PfWizard.Body>
  );
};

MiqWizard.defaultProps = {
  stepKey: 'initial',
  hideStepperSteps: ['initial'],
};

export default MiqWizard;
