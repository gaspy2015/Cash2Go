import { useTheme } from "@emotion/react";
import { Button, Grid, TextField, Tooltip } from "@mui/material";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import { Bounce, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function NewCategory({onCategoryAdded, onClosePopup}) {

    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [category, setCategory] = useState({ name: '', code: '', type: '' });

    // Start useEffect
    useEffect(() => {
        if (id) {
            axios.get(`/api/category/read/${id}`)
            .then((res) => {
                console.log('API Response:', res.data);
                
                if (Array.isArray(res.data) && res.data.length > 0) {
                    const { name, code, type } = res.data[0];
                    console.log('Category:', { name, code, type });
                    setCategory({ name, code, type });
                } else {
                    console.error('Invalid data structure returned by the API');
                }
            })
            .catch((err) => console.log(err));
        }
    }, [id]);
    // End useEffect

    // Start HandleChange
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory((prevCategory) => ({
          ...prevCategory,
          [name]: value,
        }));
      };
    // End HandleChange

    // Start handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiURL = id ? `/api/category/edit/${id}` : '/api/category/new';
        console.log({ category });
        const axiosMethod = id ? axios.put : axios.post;
    
        axiosMethod(apiURL, { category: category })
          .then((res) => {
            console.log(res);
            onCategoryAdded();
            onClosePopup();
            navigate('/category');
    
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
    // End handleSubmit

    const handleCancel = () => {
      onClosePopup();
      navigate('/category');
    };

  return (
    <Grid container>
      <Grid width={350} item xs={12}>
        <TextField
          variant="outlined"
          label="Facility"
          type="text"
          name="name"
          value={category.name}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <TextField
          variant="outlined"
          label="Code"
          type="text"
          name="code"
          value={category.code}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <TextField
          variant="outlined"
          label="Type"
          type="text"
          name="type"
          value={category.type}
          onChange={handleChange}
          fullWidth
          sx={{ width: "95%", margin: 1 }}
        />
        <Grid container justifyContent="flex-end" spacing={1} mt={2}>
          <Grid item>
            <Tooltip title="Add" placement="top">
                <Button variant="outlined" 
                  onClick={handleCancel}
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
