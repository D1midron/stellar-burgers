import { FC, SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../utils/burger-api';
import { ForgotPasswordUI } from '@ui-pages';

export const ForgotPassword: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!email) return;

    forgotPasswordApi({ email })
      .then((res) => {
        if (res.success) {
          localStorage.setItem('forgotPassword', 'true');
          navigate('/reset-password');
        }
      })
      .catch((err) => {
        setError(err.message || 'Произошла ошибка при восстановлении пароля');
      });
  };

  return (
    <ForgotPasswordUI
      errorText={error}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
