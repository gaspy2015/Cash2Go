import { Form, Formik } from "formik";
import React, { useState } from "react";
import FormNavigation from "./FormNavigation";
import { Step, StepLabel, Stepper } from "@mui/material";
import SuccessComponent from "./SuccessComponent"; // Import your success component

const MultiStepForm1 = ({ children, initialFormValues, onSubmit }) => {
  const [stepNumber, setStepNumber] = useState(1);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const steps = React.Children.toArray(children);
  const [snapshot, setSnapshot] = useState(initialFormValues);
  
  const step = steps[stepNumber];
  const isLastStep = stepNumber === steps.length - 1;

  const next = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber + 1);
    setCompletedSteps({ ...completedSteps, [step.props.stepName]: true });
  };

  const previous = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber - 1);
  };

  const handleSubmit = async (formik, actions) => {

    if (isLastStep) {
      await onSubmit(formik.values);
    } else {
      formik.setTouched({});
      next(formik.values);
    }
    
    if (step.props.onSubmit) {
      await step.props.onSubmit(formik.values);
    }

  };

  const submit = async () => {
    const schema = step.props.schema
    
    step.props.onSubmit()

    if(schema && schema.isValidSync(initialFormValues)) {
      if(isLastStep){
        onSubmit();
      } else {
        next(initialFormValues)
      }
    }else{
      console.log('error', initialFormValues)
    }
  }

  return (
    <div >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Stepper activeStep={stepNumber} style={{ marginBottom: 30 }}>
            {steps.map((currentStep, index) => {
              const label = currentStep.props.stepName;
              const isStepCompleted = completedSteps[label];
              return (
                <Step key={label} completed={isStepCompleted}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </div>
        {!isFormSubmitted && (
        // ? (
          // <SuccessComponent />
        // ) : (
          <>
            {step}
            <FormNavigation
              isLastStep={isLastStep}
              hasPrevious={stepNumber > 0}
              onBackClick={() => {previous(initialFormValues);}}
              submit={submit}
            />
          </>
        )}           
    
    </div>
  );
};

export default MultiStepForm1;

export const FormStep = ({ stepName = "", children }) => children;
