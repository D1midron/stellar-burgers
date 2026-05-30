import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';
import { RootState } from '../store';

export const orderBurger = createAsyncThunk(
  'constructor/orderBurger',
  async (ingredientsIds: string[]) => {
    const res = await orderBurgerApi(ingredientsIds);
    return res.order;
  }
);

type TConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null | undefined;
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
  orderRequest: false,
  orderModalData: null,
  error: null
};

export const constructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addIngredient: {
      reducer: (state, action: PayloadAction<TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
        } else {
          state.ingredients.push(action.payload);
        }
      },
      prepare: (ingredient: TIngredient) => ({
        payload: { ...ingredient, id: crypto.randomUUID() }
      })
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (item) => item.id !== action.payload
      );
    },

    reorderIngredients: (
      state,
      action: PayloadAction<{ from: number; to: number }>
    ) => {
      const { from, to } = action.payload;
      const ingredients = [...state.ingredients];
      const [movedItem] = ingredients.splice(from, 1);
      ingredients.splice(to, 0, movedItem);
      state.ingredients = ingredients;
    },
    closeOrderModal: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false;

        const ingredientsIds = [
          state.bun ? state.bun._id : '',
          ...state.ingredients.map((item) => item._id),
          state.bun ? state.bun._id : ''
        ].filter(Boolean);

        state.orderModalData = {
          ...action.payload,
          ingredients: ingredientsIds
        } as unknown as TOrder;

        state.bun = null;
        state.ingredients = [];
      })
      .addCase(orderBurger.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message;
      });
  }
});

export const {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  closeOrderModal
} = constructorSlice.actions;

export const getConstructorItemsState = (state: RootState) => ({
  bun: state.burgerConstructor.bun,
  ingredients: state.burgerConstructor.ingredients
});

export const getOrderRequestState = (state: RootState) =>
  state.burgerConstructor.orderRequest;
export const getOrderModalDataState = (state: RootState) =>
  state.burgerConstructor.orderModalData;

export default constructorSlice.reducer;
