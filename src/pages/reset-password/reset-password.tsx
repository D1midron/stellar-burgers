import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '../../utils/burger-api';
import { ResetPasswordUI } from '@ui-pages';

export const ResetPassword: FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!localStorage.getItem('forgotPassword')) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!password || !token) return;

    resetPasswordApi({ password, token })
      .then((res) => {
        if (res.success) {
          localStorage.removeItem('forgotPassword');
          navigate('/login', { replace: true });
        }
      })
      .catch((err) => {
        setError(err.message || 'Произошла ошибка при сбросе пароля');
      });
  };

  return (
    <ResetPasswordUI
      errorText={error}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
