import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi, getOrderByNumberApi } from '../../utils/burger-api';
import { TOrder } from '@utils-types';
import { RootState } from '../store';

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async () => {
  const response = await getFeedsApi();
  return response;
});

export const fetchOrderByNumber = createAsyncThunk(
  'feed/fetchOrderByNumber',
  async (number: number) => {
    const response = await getOrderByNumberApi(number);
    return response.orders[0];
  }
);

type TFeedState = {
  orders: TOrder[];
  orderByNumber: TOrder | null;
  total: number;
  totalToday: number;
  isLoading: boolean;
  error: string | null | undefined;
};

const initialState: TFeedState = {
  orders: [],
  orderByNumber: null,
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null
};

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    clearOrderByNumber: (state) => {
      state.orderByNumber = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderByNumber = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearOrderByNumber } = feedSlice.actions;

export const getFeedOrdersState = (state: RootState) => state.feed.orders;
export const getOrderByNumberState = (state: RootState) =>
  state.feed.orderByNumber;
export const getFeedTotalState = (state: RootState) => state.feed.total;
export const getFeedTotalTodayState = (state: RootState) =>
  state.feed.totalToday;
export const getFeedLoadingState = (state: RootState) => state.feed.isLoading;

export default feedSlice.reducer;
