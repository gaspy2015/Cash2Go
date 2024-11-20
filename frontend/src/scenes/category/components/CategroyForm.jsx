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

const INITIAL_FORM_STATE = {
    name: "",
    code: "",
    type: "",
  };
  
  const FORM_VALIDATION = Yup.object().shape({
    name: Yup.string().required("Required"),
    code: Yup.string().required("Required"),
    type: Yup.string().required("Required"),
  });

export default function CategroyForm({onCategoryAdded, onClosePopup}) {
    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const [initialValues, setInitialValues] = useState(INITIAL_FORM_STATE);

    useEffect(() => {
        if (id) {
          axios
            .get(`/api/category/read/${id}`)
            .then((res) => {
              const { name, code, type } = res.data[0];
              setInitialValues({ name, code, type });
              
            })
            .catch((err) => {
              console.error("Error fetching data:", err);
            });
        }
      }, [id]);

      const handleSubmit = async (values, actions) => {
        // Here the actions object is provided by Formik which contains helpful methods.
        const apiURL = id
          ? `/api/category/edit/${id}`
          : "/api/category/new";
    
        try {
          const res = await axios[id ? "put" : "post"](apiURL, values);
          onCategoryAdded();
          onClosePopup();
          navigate("/category");
    
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
        navigate("/category");
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
              <Textfield name="name" label="Category Name" />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="code" label="Code" />
            </Grid>
            <Grid item xs={12}>
              <Textfield name="type" label="Type" />
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
