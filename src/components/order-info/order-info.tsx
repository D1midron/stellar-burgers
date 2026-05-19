import { FC, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { getIngredientsState } from '../../services/slices/ingredientsSlice';
import {
  getFeedOrdersState,
  getOrderByNumberState,
  fetchOrderByNumber,
  clearOrderByNumber
} from '../../services/slices/feedSlice';
import { getProfileOrdersState } from '../../services/slices/profileOrdersSlice';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useDispatch();

  const ingredients = useSelector(getIngredientsState);
  const feedOrders = useSelector(getFeedOrdersState);
  const profileOrders = useSelector(getProfileOrdersState);
  const directOrderData = useSelector(getOrderByNumberState);

  useEffect(() => {
    if (!number) return;
    const orderNumber = parseInt(number, 10);

    const foundInStore =
      feedOrders.find((item) => item.number === orderNumber) ||
      profileOrders.find((item) => item.number === orderNumber);

    if (!foundInStore) {
      dispatch(fetchOrderByNumber(orderNumber));
    }

    return () => {
      dispatch(clearOrderByNumber());
    };
  }, [number, feedOrders, profileOrders, dispatch]);

  const orderData = useMemo(() => {
    if (!number) return null;
    const orderNumber = parseInt(number, 10);

    const foundInFeed = feedOrders.find((item) => item.number === orderNumber);
    if (foundInFeed) return foundInFeed;

    const foundInProfile = profileOrders.find(
      (item) => item.number === orderNumber
    );
    if (foundInProfile) return foundInProfile;

    return directOrderData;
  }, [number, feedOrders, profileOrders, directOrderData]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
