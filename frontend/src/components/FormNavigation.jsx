import React from "react";
import Button from "@mui/material/Button";
import { tokens } from "../theme";
import { grey } from "@mui/material/colors";

const FormNavigation = (props) => {
  return (
    <div
      style={{
        display: "flex",
        marginTop: 50,
        justifyContent: "space-between",
      }}
    >
      {props.hasPrevious && (
        <Button
          variant="outlined"
          color="primary"
          sx={{
            color: grey[500],
            borderColor: grey[500],
            "&:hover": { borderColor: "white", color: "white" },
          }}
          onClick={props.onBackClick}
        >
          Back
        </Button>
      )}

      <Button
        variant="outlined"
        color="primary"
        sx={{
          color: grey[500],
          borderColor: grey[500],
          "&:hover": { borderColor: "white", color: "white" },
        }}
        onClick={props.submit}
      >
        {props.isLastStep ? "Submit" : "Next"}
      </Button>
    </div>
  );
};

export default FormNavigation;
