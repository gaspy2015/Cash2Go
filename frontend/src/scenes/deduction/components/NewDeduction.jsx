import { useTheme } from "@emotion/react";
import { Button, Grid, TextField } from "@mui/material";
import { tokens } from "../../../theme";
import { useState } from "react";


export default function newDeduction({ onDeductionAdded, onClosePopup }) {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [deductionType, setDeductionType] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:8000/loans/deduction/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deduction: {
            deductionType: deductionType,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('New deduction ID:', data.id);
        // Handle success, e.g., show a success message or redirect the user
        onDeductionAdded();
        onClosePopup();
      } else {
        // Handle errors, e.g., show an error message
        console.error('Failed to submit deduction');
      }
    } catch (error) {
      console.error('Error during deduction submission:', error);
    }
  };
  return (
    <Grid container>
      <Grid width={350} item xs={12}>
        <TextField
          variant="outlined"
          label="Deduction Type"
          type="text"
          value={deductionType}
          onChange={(e) => setDeductionType(e.target.value)}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <Grid container justifyContent="flex-end" spacing={1} mt={2}>
          <Grid item>
            <Button variant="outlined" 
                sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                    "&:hover": {borderColor: colors.grey[400],
                                backgroundColor: colors.grey[700]        
                    }
                }}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button 
                variant="outlined" 
                onClick={handleSubmit}
                sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                    "&:hover": {borderColor: colors.grey[400],
                                backgroundColor: colors.grey[700]        
                    }
                }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
