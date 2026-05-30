import { FC } from 'react';
import { useSelector } from '../../services/store';
import {
  getFeedOrdersState,
  getFeedTotalState,
  getFeedTotalTodayState
} from '../../services/slices/feedSlice';
import { TOrder } from '@utils-types';
import { FeedInfoUI } from '../ui/feed-info';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo: FC = () => {
  const orders = useSelector(getFeedOrdersState);
  const total = useSelector(getFeedTotalState);
  const totalToday = useSelector(getFeedTotalTodayState);

  const feed = {
    total,
    totalToday
  };

  const readyOrders = getOrders(orders, 'done');
  const pendingOrders = getOrders(orders, 'pending');

  return (
    <FeedInfoUI
      readyOrders={readyOrders}
      pendingOrders={pendingOrders}
      feed={feed}
    />
  );
};
