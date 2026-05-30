import { combineReducers } from '@reduxjs/toolkit';
import { ingredientsSlice } from './slices/ingredientsSlice';
import { constructorSlice } from './slices/constructorSlice';
import { userSlice } from './slices/userSlice';

const rootReducer = combineReducers({
  [ingredientsSlice.name]: ingredientsSlice.reducer,
  [constructorSlice.name]: constructorSlice.reducer,
  [userSlice.name]: userSlice.reducer
});

describe('Тестирование rootReducer', () => {
  test('должен корректно инициализировать начальное состояние', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    expect(initialState).toHaveProperty(ingredientsSlice.name);
    expect(initialState).toHaveProperty(constructorSlice.name);
    expect(initialState).toHaveProperty(userSlice.name);
  });
});
