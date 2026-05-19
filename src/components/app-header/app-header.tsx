import { FC } from 'react';
import { useSelector } from '../../services/store';
import { getUserState } from '../../services/slices/userSlice';
import { AppHeaderUI } from '@ui';

export const AppHeader: FC = () => {
  const user = useSelector(getUserState);
  const userName = user ? user.name : '';

  return <AppHeaderUI userName={userName} />;
};
