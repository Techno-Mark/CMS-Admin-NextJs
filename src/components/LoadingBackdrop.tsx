// components/LoadingBackdrop.tsx

import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop'

type LoadingBackdropProps = {
  isLoading: boolean;
}

const LoadingBackdrop = ({ isLoading }: LoadingBackdropProps) => (
  <Backdrop
    sx={{ color: '#fff', zIndex: 9999 }}
    open={isLoading}
  >
    <CircularProgress />
  </Backdrop>
);

export default LoadingBackdrop;
