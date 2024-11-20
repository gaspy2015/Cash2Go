import { Bounce, toast } from 'react-toastify';

export const toastSucc = (message, sec = 1) =>{
  toast.success(message, {
    position: "top-right",
    autoClose: sec * 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
  });
}

export const toastErr = (message, sec = 1) => {
  toast.error(message, {
    position: "top-right",
    autoClose: sec * 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
  });
}


export const formatNumber = Intl.NumberFormat(undefined,  {minimumFractionDigits: 2, maximumFractionDigits: 2})