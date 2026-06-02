import ingredientsReducer, { fetchIngredients } from './ingredientsSlice';
import { TIngredient } from '@utils-types';

describe('Тестирование редьюсера слайса ingredients на Jest', () => {
  // Начальное состояние перед каждым тестом
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null
  };

  // Моковые данные ингредиентов для проверки успешного ответа (Success)
  const mockIngredientsList: TIngredient[] = [
    {
      _id: '643d69a5c3f7b9002cfa093c',
      name: 'Краторная булка N-200i',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: '',
      image_mobile: '',
      image_large: ''
    },
    {
      _id: '643d69a5c3f7b9002cfa0941',
      name: 'Биокотлета из марсианской Магнии',
      type: 'main',
      proteins: 420,
      fat: 142,
      carbohydrates: 242,
      calories: 4242,
      price: 424,
      image: '',
      image_mobile: '',
      image_large: ''
    }
  ];

  test('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
    expect(ingredientsReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
      initialState
    );
  });

  test('При вызове экшена Request (pending) булевая переменная isLoading меняется на true', () => {
    const previousState = {
      ...initialState,
      isLoading: false,
      error: 'предыдущая ошибка' // проверяем, что старая ошибка сбрасывается при новом запросе
    };

    const action = { type: fetchIngredients.pending.type };
    const newState = ingredientsReducer(previousState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.error).toBeNull(); // ошибка должна сброситься в null
  });

  test('При вызове экшена Success (fulfilled) ингредиенты записываются в стор и isLoading меняется на false', () => {
    const previousState = {
      ...initialState,
      isLoading: true // имитируем, что до этого шла загрузка
    };

    const action = {
      type: fetchIngredients.fulfilled.type,
      payload: mockIngredientsList
    };

    const newState = ingredientsReducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.ingredients).toEqual(mockIngredientsList); // данные записались
  });

  test('При вызове экшена Failed (rejected) ошибка записывается в стор и isLoading меняется на false', () => {
    const previousState = {
      ...initialState,
      isLoading: true // имитируем, что до этого шла загрузка
    };

    const mockErrorMessage = 'Ошибка при получении ингредиентов с сервера';
    const action = {
      type: fetchIngredients.rejected.type,
      error: { message: mockErrorMessage }
    };

    const newState = ingredientsReducer(previousState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.error).toBe(mockErrorMessage); // текст ошибки записался
  });
});
