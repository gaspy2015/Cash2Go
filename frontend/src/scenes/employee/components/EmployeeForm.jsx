import React, { useEffect, useState } from "react";
import { useTheme } from "@emotion/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button, Grid, Tooltip } from "@mui/material";
import Textfield from "../../../components/FormUI/Textfield";
import axios from "axios";
import { tokens } from "../../../theme";
import { toast, Bounce } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Autocomplete from "../../../components/FormUI/Autocomplete"

const INITIAL_FORM_STATE = {
    fname: "",
    mname: "",
    lname: "",
    role: "",
  };
  
  const FORM_VALIDATION = Yup.object().shape({
    fname: Yup.string().required("Required"),
    mname: Yup.string().required("Required"),
    lname: Yup.string().required("Required"),
    role: Yup.string().required("Required"),
  });

export default function EmployeeForm({onEmployeeAdded, onClosePopup}) {
    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const [initialValues, setInitialValues] = useState(INITIAL_FORM_STATE);

    const options = [
        { value: 'Prepared by', label: 'Prepared by' },
        { value: 'Checked by', label: 'Checked by' },
        { value: 'Approved by', label: 'Approved by' },
];

    useEffect(() => {
        if (id) {
          axios
            .get(`/api/employee/read/${id}`)
            .then((res) => {
              const { fname, mname, lname, role } = res.data[0];
              setInitialValues({ fname, mname, lname, role });
              
            })
            .catch((err) => {
              console.error("Error fetching data:", err);
            });
        }
      }, [id]);

      const handleSubmit = async (values, actions) => {
        // Here the actions object is provided by Formik which contains helpful methods.
        const apiURL = id
          ? `/api/employee/edit/${id}`
          : "/api/employee/new";
    
        try {
          const res = await axios[id ? "put" : "post"](apiURL, values);
          onEmployeeAdded();
          onClosePopup();
          navigate("/employee");
    
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
        navigate("/employee");
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
              <Textfield name="fname" label="First Name" />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="mname" label="Middle Name" />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="lname" label="Last Name" />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete variant="standard" name="role" options={options} label="Role" />
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
  )
}
