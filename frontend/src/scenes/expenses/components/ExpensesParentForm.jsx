import { Box, Button, Step, StepLabel, Stepper } from '@mui/material'
import React from 'react'

export default function ExpensesParentForm({ children, activeStep }) {
  const steps = React.Children.toArray(children)
  const currentStep = steps[activeStep]

  const isActiveStep = (step) => {
    return step === activeStep ? true : false
  }

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((child, index) => {
          return <Step key={child.props.label} active={isActiveStep(index)}>
            <StepLabel >
              {child.props.label}
            </StepLabel>
          </Step> 
        })}
      </Stepper>
      <Box mt='10px'>
        {currentStep}      
      </Box>
    </>
    
  )
}
