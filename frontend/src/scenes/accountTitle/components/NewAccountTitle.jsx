import { useTheme } from "@emotion/react";
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import { tokens } from "../../../theme";
import { useEffect, useState } from "react";
import { Bounce, toast } from 'react-toastify';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

export default function NewAccountTitle({ onAccountTitleAdded, onClosePopup }) {

    const { id } = useParams();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [accountTitle, setAccountTitle] = useState({account_category_id: '', account_title: '', account_code: ''});

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Start useEffect
    useEffect(() => {
      if (id) {
        axios.get(`/api/account-title/read/${id}`)
          .then((res) => {
            console.log('API Response:', res.data);
    
            if (Array.isArray(res.data) && res.data.length > 0) {
              const accountData = res.data[0];
              console.log('Account Title:', accountData);
              setAccountTitle((prevAccountTitle) => ({
                ...prevAccountTitle,
                account_category_id: accountData.account_category_id,
                account_title: accountData.account_title,
                account_code: accountData.account_code
              }));
    
              // Find the category object based on account_category_id
              const selectedCategoryObject = categories.find(category => category.id === accountData.account_category_id);
    
              // Update selectedCategory
              setSelectedCategory(selectedCategoryObject || null);
              //handleChangeCategory();
            } else {
              console.error('Invalid data structure returned by the API');
            }
          })
          .catch((err) => console.log(err));
      }
    }, [categories, id]);
    
    // End useEffect

  useEffect(() => {
    axios.get('/api/account-category')
      .then(response => {
        setCategories(response.data);
        console.log('Categories:', response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []); 

  useEffect(() => {
    setAccountTitle((prevAccountTitle) => ({
      ...prevAccountTitle,
      account_category_id: selectedCategory ? selectedCategory.id : null,
    }));
  }, [selectedCategory]);

  const handleChangeCategory = (e) => {
    const selectedCategoryId = e.target.value;
  
    // Find the category object based on account_name
    const selectedCategoryObject = categories.find(category => category.account_name === selectedCategoryId);
  
    setSelectedCategory(selectedCategoryObject || null);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountTitle((prevAccountTitle) => ({
      ...prevAccountTitle,
      [name]: value,
    }));
  };
  
  
  
const handleSubmit = async (e) => {
  e.preventDefault();
  const apiURL = id ? `/api/account-title/edit/${id}` : '/api/account-title/new'
  console.log({accountTitle});
  const axiosMethod = id ? axios.put : axios.post;

  // const payload = {
  //   ...accountTitle,
  //   account_category_id: selectedCategory ? selectedCategory.id : null,
  // };

  axiosMethod(apiURL, {accountTitle: accountTitle})
    .then((res) => {
      console.log(res);
      onAccountTitleAdded();
      onClosePopup();
      navigate('/account-title');

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
      console.log(err)
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

const handleCancel = () => {
  onClosePopup();
  navigate('/account-title');
};

  return (
    <Grid container spacing={2}>
    <Grid width={350} item xs={12} spacing={2}>

    <FormControl fullWidth>
      <InputLabel id="category-select-label">Category</InputLabel>
      <Select
        labelId="category-select-label"
        id="category-select"
        label="Account Category"
        name="category_name"
        value={selectedCategory ? selectedCategory.account_name : ''}
        onChange={handleChangeCategory}
      >
        {categories.map(category => (
          <MenuItem key={category.id} value={category.account_name}>
            {category.account_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

      <TextField
        variant="outlined"
        label="Account Title"
        type="text"
        name="account_title"
        value={accountTitle.account_title}
        onChange={handleChange}
        fullWidth
        sx={{ width: "100%", mt: 2 }}
      />
      <TextField
        variant="outlined"
        label="Account Code"
        type="text"
        name="account_code"
        value={accountTitle.account_code}
        onChange={handleChange}
        fullWidth
        sx={{ width: "100%", mt: 2 }}
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
