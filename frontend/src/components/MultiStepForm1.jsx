import { Form, Formik } from "formik";
import React, { useState } from "react";
import FormNavigation from "./FormNavigation";
import { Step, StepLabel, Stepper } from "@mui/material";
import SuccessComponent from "./SuccessComponent"; // Import your success component

const MultiStepForm1 = ({ children, initialFormValues, onSubmit }) => {
  const [stepNumber, setStepNumber] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const steps = React.Children.toArray(children);
  const [snapshot, setSnapshot] = useState(initialFormValues);
  const [submitButtonState, setSubmitButtonState] = useState(false)
  
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
    
    // console.log('next')
    if(schema && schema.isValidSync(initialFormValues)) {
      // if(isLastStep){
      //   setSubmitButtonState(true)
      //   onSubmit();
      // } else {
      next(initialFormValues)
      // }
    }

    if(step.props.onSubmit) step.props.onSubmit();
    
    if(isLastStep) {
      onSubmit()
      setIsFormSubmitted(true)
    }
    
    if(!schema && !isLastStep) next(initialFormValues);

  }

  return (
    <div >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Stepper activeStep={stepNumber} style={{ marginBottom: 30 }}>
            {steps.map((currentStep, index) => {
              const label = currentStep.props.stepName;
              const isStepCompleted = completedSteps[label];
              return (
                <Step key={label} completed={isStepCompleted} sx={{
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: 'secondary.dark', // circle color (COMPLETED)
                  },
                  '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel':
                    {
                      color: 'grey.500', // Just text label (COMPLETED)
                    },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'secondary.main', // circle color (ACTIVE)
                  },
                  '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel':
                    {
                      color: 'common.white', // Just text label (ACTIVE)
                    },
                  '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                    fill: 'black', // circle's number (ACTIVE)
                  },
                }}>
                  <StepLabel >{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </div>
        {!isFormSubmitted ? (
        // ? (
          // <SuccessComponent />
        // ) : (
          <>
            {step}
            <FormNavigation
              isLastStep={isLastStep}
              hasPrevious={stepNumber > 0}
              onBackClick={() => {previous(initialFormValues);}}
              state={submitButtonState}
              submit={submit}
            />
          </>
        ) : (
          <SuccessComponent/>
        )}           
    
    </div>
  );
};

export default MultiStepForm1;

export const FormStep = ({ stepName = "", children }) => children;
