import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  // Redirect to login component which handles both login and register
  React.useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default Register;