import { Form, Formik } from "formik";
import React, { useState } from "react";
import FormNavigation from "./FormNavigation";
import { Step, StepLabel, Stepper } from "@mui/material";
import SuccessComponent from "./SuccessComponent"; // Import your success component

const MultiStepForm = ({ children, initialValues, onSubmit }) => {
  const [stepNumber, setStepNumber] = useState(0);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});
  const steps = React.Children.toArray(children);

  const [snapshot, setSnapshot] = useState(initialValues);

  const step = steps[stepNumber];
  const totalSteps = steps.length;
  const isLastStep = stepNumber === totalSteps - 1;

  const next = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber + 1);
    setCompletedSteps({ ...completedSteps, [step.props.stepName]: true });
    // console.log(totalSteps);
  };

  const previous = (values) => {
    setSnapshot(values);
    setStepNumber(stepNumber - 1);
  };

  const handleSubmit = async (formik, actions) => {
    if (step.props.onSubmit) {
      await step.props.onSubmit(formik.values);
    }

    if (isLastStep) {
      await onSubmit(formik.values);
      // setIsFormSubmitted(true);
    } else {
      actions.setTouched({});
      next(formik.values);
    }
  };

  return (
    <div>
      <Formik
        initialValues={snapshot}
        onSubmit={handleSubmit}
        validationSchema={step.props.validationSchema}
      >
        {(formik) => (
          <Form>
            {/* <div style={{ display: 'flex', justifyContent: 'center' }}> */}
            <Stepper
              alternativeLabel
              activeStep={stepNumber}
              style={{ marginBottom: 30,  }}
              
            >
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
            {/* </div> */}
            {isFormSubmitted ? (
              <SuccessComponent />
            ) : (
              <>
                {React.cloneElement(step, { ...formik })}
                <FormNavigation
                  isLastStep={isLastStep}
                  hasPrevious={stepNumber > 0}
                  onBackClick={() => previous(formik.values)}
                />
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MultiStepForm;

export const FormStep = ({ stepName = "", children }) => {
  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child);
      })}
    </div>
  );
};
