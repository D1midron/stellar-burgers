import { rootReducer } from './store';

describe('Тестирование инициализации rootReducer приложения', () => {
  test('должен возвращать корректное полное начальное состояние при неизвестном экшене', () => {
    const state = rootReducer(undefined, { type: '@@UNKNOWN_ACTION_TEST@@' });

    const expectedInitialState = {
      ingredients: {
        ingredients: [],
        isLoading: false,
        error: null
      },
      user: {
        user: null,
        isAuthChecked: false,
        isLoading: false,
        error: null
      },
      burgerConstructor: {
        bun: null,
        ingredients: [],
        orderRequest: false,
        orderModalData: null,
        error: null
      },
      feed: {
        orders: [],
        orderByNumber: null,
        total: 0,
        totalToday: 0,
        isLoading: false,
        error: null
      },
      profileOrders: {
        orders: [],
        isLoading: false,
        error: null
      }
    };

    expect(state).toEqual(expectedInitialState);
  });
});
