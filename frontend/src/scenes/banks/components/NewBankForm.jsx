import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import { Button, Checkbox, FormControlLabel, Grid, Tooltip } from "@mui/material";
import Textfield from "../../../components/FormUI/Textfield";
import axios from "axios";
import { tokens } from "../../../theme";
import { toast, Bounce } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const INITIAL_FORM_STATE = {
  name: "",
  check_location: "",
  owner : false
};

const FORM_VALIDATION = Yup.object().shape({
  name: Yup.string().required("Required"),
  check_location: Yup.string().required("Required"),
});

const Cash2GoCheckBox = ({name}) =>{
  const [field, meta] = useField(name);
  return (
    <FormControlLabel sx={{color : 'white'}} label='Cash 2 Go Bank'control={<Checkbox {...field} checked={field.value} />} />
  )
}


export default function BankForm({ onBankAdded, onClosePopup }) {
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    console.log(`/api/banks/read/${id}`)
    if (id) {
      axios
        .get(`/api/banks/read/${id}`)
        .then((res) => {
          const { name, check_location, owner } = res.data[0];
          // Update INITIAL_FORM_STATE with the fetched data
          // INITIAL_FORM_STATE.name = name;
          // INITIAL_FORM_STATE.check_location = check_location;
          setInitialValues({ name, check_location, owner : Boolean(owner) });
          
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
        });
    }
  }, [id]);

  const handleSubmit = async (values, actions) => {
    // Here the actions object is provided by Formik which contains helpful methods.
    const apiURL = id
      ? `/api/banks/edit/${id}`
      : "/api/banks/new";

    try {
      const res = await axios[id ? "put" : "post"](apiURL, values);
      onBankAdded();
      onClosePopup();
      navigate("/banks");

      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    } catch (err) {
      toast.error("Error occurred. Please try again.", {
        position: "top-right",
        transition: Bounce,
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      });
      actions.setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClosePopup();
    navigate("/banks");
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={FORM_VALIDATION}
      onSubmit={handleSubmit}
      enableReinitialize // This is important when initialValues should be re-initialized
    >
      {(formikProps) => (
        <Form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Textfield name="name" label="Bank Name" />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="check_location" label="Location" />
            </Grid>
            <Grid item xs={12}>
              <Cash2GoCheckBox name='owner'/>
            </Grid>
          </Grid>
          <Grid container justifyContent="flex-end" spacing={1} mt={2}>
            <Grid item>
              <Tooltip title="Cancel" placement="top">
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{
                    backgroundColor: colors.blueAccent[700],
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                    "&:hover": {
                      borderColor: colors.grey[400],
                      backgroundColor: colors.grey[700],
                    },
                  }}
                >
                  Cancel
                </Button>
              </Tooltip>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                type="submit"
                sx={{
                  backgroundColor: colors.blueAccent[700],
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                  "&:hover": {
                    borderColor: colors.grey[400],
                    backgroundColor: colors.grey[700],
                  },
                }}
              >
                {id ? "Update" : "Submit"}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}