import { useTheme } from "@emotion/react";
import { Button, Grid, TextField, Tooltip } from "@mui/material";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import { Bounce, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function NewFacility({onFacilityAdded, onClosePopup}) {

    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [facility, setFacility] = useState({ name: '', code: '' });

    useEffect(() => {
      if (id) {
        axios.get(`/api/facility/read/${id}`)
          .then((res) => {
            console.log('API Response:', res.data);
  
            if (Array.isArray(res.data) && res.data.length > 0) {
              const { name, code } = res.data[0];
              console.log('Facility:', { name, code });
              setFacility({ name, code });
            } else {
              console.error('Invalid data structure returned by the API');
            }
          })
          .catch((err) => console.log(err));
      }
    }, [id]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFacility((prevFacility) => ({
        ...prevFacility,
        [name]: value,
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const apiURL = id ? `/api/facility/edit/${id}` : '/api/facility/new';
      console.log({ facility });
      const axiosMethod = id ? axios.put : axios.post;
  
      axiosMethod(apiURL, { facility: facility })
        .then((res) => {
          console.log(res);
          onFacilityAdded();
          onClosePopup();
          navigate('/facility');
  
          toast.success(res.data.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
          });
        })
        .catch((err) => {
          console.log(err);
          toast.error('Error occurred. Please try again.', {
            position: toast.POSITION.TOP_RIGHT,
            transition: Bounce,
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
          });
        });
    };

  return (
    <Grid container>
      <Grid width={350} item xs={12}>
        <TextField
          variant="outlined"
          label="Facility"
          type="text"
          name="name"
          value={facility.name}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <TextField
          variant="outlined"
          label="Code"
          type="text"
          name="code"
          value={facility.code}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <Grid container justifyContent="flex-end" spacing={1} mt={2}>
          <Grid item>
            <Tooltip title="Add" placement="top">
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
            </Tooltip>
            
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
              {id ? 'Update' : 'Submit'}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
