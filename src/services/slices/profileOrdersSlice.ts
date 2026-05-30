import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { orderBurger } from './constructorSlice';
import { TOrder } from '@utils-types';
import { RootState } from '../store';

export const fetchProfileOrders = createAsyncThunk(
  'profileOrders/fetchProfileOrders',
  async () => {
    const response = await getOrdersApi();
    return response;
  }
);

type TProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null | undefined;
};

const initialState: TProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null
};

export const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        if (action.payload) {
          const meta = action.meta.arg;
          const completedOrder: TOrder = {
            ...action.payload,
            ingredients: meta
          } as unknown as TOrder;

          state.orders.unshift(completedOrder);
        }
      });
  }
});

export const getProfileOrdersState = (state: RootState) =>
  state.profileOrders.orders;
export const getProfileOrdersLoadingState = (state: RootState) =>
  state.profileOrders.isLoading;

export default profileOrdersSlice.reducer;
