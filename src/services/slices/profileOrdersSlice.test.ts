import profileOrdersReducer, { fetchProfileOrders } from './profileOrdersSlice';
import { orderBurger } from './constructorSlice';
import { TOrder } from '@utils-types';

describe('Тестирование редьюсера слайса profileOrders на Jest', () => {
  const initialState = {
    orders: [],
    isLoading: false,
    error: null
  };

  const mockOrder1: TOrder = {
    _id: 'order-1',
    status: 'done',
    name: 'Марсианский бургер',
    createdAt: '2026-05-30',
    updatedAt: '2026-05-30',
    number: 1111,
    ingredients: ['bun-1', 'main-1']
  };

  const mockOrder2: TOrder = {
    _id: 'order-2',
    status: 'done',
    name: 'Космический соусный бургер',
    createdAt: '2026-05-30',
    updatedAt: '2026-05-30',
    number: 2222,
    ingredients: ['bun-1', 'sauce-1']
  };

  test('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
    expect(profileOrdersReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
      initialState
    );
  });

  describe('Асинхронный экшен fetchProfileOrders (Загрузка истории)', () => {
    test('При вызове экшена Request (pending) переменная isLoading меняется на true', () => {
      const previousState = { ...initialState, error: 'старая ошибка' };
      const action = { type: fetchProfileOrders.pending.type };

      const newState = profileOrdersReducer(previousState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('При вызове экшена Success (fulfilled) массив заказов записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockPayload = [mockOrder1, mockOrder2];

      const action = {
        type: fetchProfileOrders.fulfilled.type,
        payload: mockPayload
      };
      const newState = profileOrdersReducer(previousState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.orders).toEqual(mockPayload);
    });

    test('При вызове экшена Failed (rejected) ошибка записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockError = 'Ошибка авторизации или сети';
      const action = {
        type: fetchProfileOrders.rejected.type,
        error: { message: mockError }
      };

      const newState = profileOrdersReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(mockError);
    });
  });

  describe('Сквозной экшен orderBurger.fulfilled (Создание нового заказа)', () => {
    test('при успешном создании заказа новый заказ должен добавляться в начало списка истории (unshift)', () => {
      // Имитируем, что в истории уже лежит один старый заказ
      const previousState = {
        ...initialState,
        orders: [mockOrder2]
      };

      // Payload ответа сервера при создании заказа
      const mockServerPayload = {
        _id: 'order-new-123',
        status: 'done',
        name: 'Новый собранный бургер',
        number: 7777
      };

      // Список ID ингредиентов, переданный в thunk (meta.arg)
      const mockIngredientsIds = ['bun-1', 'main-1', 'bun-1'];

      const action = {
        type: orderBurger.fulfilled.type,
        payload: mockServerPayload,
        meta: {
          arg: mockIngredientsIds
        }
      };

      const newState = profileOrdersReducer(previousState, action);

      // В массиве должно стать 2 заказа
      expect(newState.orders).toHaveLength(2);

      // Новый заказ должен встать на ПЕРВОЕ место (индекс 0)
      expect(newState.orders[0]).toMatchObject({
        _id: 'order-new-123',
        name: 'Новый собранный бургер',
        number: 7777,
        ingredients: mockIngredientsIds
      });

      // Старый заказ сместился на второе место (индекс 1)
      expect(newState.orders[1]).toEqual(mockOrder2);
    });
  });
});
