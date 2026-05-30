import feedReducer, {
  clearOrderByNumber,
  fetchFeed,
  fetchOrderByNumber
} from './feedSlice';
import { TOrder } from '@utils-types';

describe('Тестирование редьюсера слайса feed на Jest', () => {
  const initialState = {
    orders: [],
    orderByNumber: null,
    total: 0,
    totalToday: 0,
    isLoading: false,
    error: null
  };

  const mockOrder: TOrder = {
    _id: 'order-1',
    status: 'done',
    name: 'Марсианский бургер',
    createdAt: '2026-05-30',
    updatedAt: '2026-05-30',
    number: 12345,
    ingredients: ['bun-1', 'main-1']
  };

  describe('Синхронные экшены (Reducers)', () => {
    test('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
      expect(feedReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
        initialState
      );
    });

    test('должен очищать orderByNumber при вызове clearOrderByNumber', () => {
      const stateWithOrder = {
        ...initialState,
        orderByNumber: mockOrder
      };

      const newState = feedReducer(stateWithOrder, clearOrderByNumber());
      expect(newState.orderByNumber).toBeNull();
    });
  });

  describe('Асинхронный экшен fetchFeed', () => {
    test('При вызове экшена Request (pending) переменная isLoading меняется на true', () => {
      const previousState = { ...initialState, error: 'старая ошибка' };
      const action = { type: fetchFeed.pending.type };

      const newState = feedReducer(previousState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('При вызове экшена Success (fulfilled) данные записываются в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockPayload = {
        orders: [mockOrder],
        total: 1500,
        totalToday: 15
      };

      const action = { type: fetchFeed.fulfilled.type, payload: mockPayload };
      const newState = feedReducer(previousState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.orders).toEqual([mockOrder]);
      expect(newState.total).toBe(1500);
      expect(newState.totalToday).toBe(15);
    });

    test('При вызове экшена Failed (rejected) ошибка записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockError = 'Ошибка загрузки ленты';
      const action = {
        type: fetchFeed.rejected.type,
        error: { message: mockError }
      };

      const newState = feedReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(mockError);
    });
  });

  describe('Асинхронный экшен fetchOrderByNumber', () => {
    test('При вызове экшена Request (pending) переменная isLoading меняется на true', () => {
      const previousState = { ...initialState, error: 'ошибка' };
      const action = { type: fetchOrderByNumber.pending.type };

      const newState = feedReducer(previousState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('При вызове экшена Success (fulfilled) конкретный заказ записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const action = {
        type: fetchOrderByNumber.fulfilled.type,
        payload: mockOrder
      };

      const newState = feedReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.orderByNumber).toEqual(mockOrder);
    });

    test('При вызове экшена Failed (rejected) ошибка записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockError = 'Заказ не найден';
      const action = {
        type: fetchOrderByNumber.rejected.type,
        error: { message: mockError }
      };

      const newState = feedReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(mockError);
    });
  });
});
