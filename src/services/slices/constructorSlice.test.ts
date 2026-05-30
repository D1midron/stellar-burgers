import constructorReducer, {
  addIngredient,
  removeIngredient,
  reorderIngredients,
  closeOrderModal,
  orderBurger
} from './constructorSlice';
import { TIngredient, TConstructorIngredient, TOrder } from '@utils-types';

describe('Подробное тестирование слайса burgerConstructor на Jest', () => {
  const initialState = {
    bun: null,
    ingredients: [],
    orderRequest: false,
    orderModalData: null,
    error: null
  };

  const mockBun: TIngredient = {
    _id: 'bun-123',
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
  };

  const mockMain: TIngredient = {
    _id: 'main-456',
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
  };

  const mockConstructorIngredient1: TConstructorIngredient = {
    ...mockMain,
    id: 'uuid-item-1'
  };

  const mockConstructorIngredient2: TConstructorIngredient = {
    _id: 'sauce-789',
    name: 'Соус Space',
    type: 'sauce',
    proteins: 10,
    fat: 10,
    carbohydrates: 10,
    calories: 10,
    price: 100,
    image: '',
    image_mobile: '',
    image_large: '',
    id: 'uuid-item-2'
  };

  describe('Синхронные экшены (Reducers)', () => {
    test('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
      expect(constructorReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
        initialState
      );
    });

    test('функция prepare экшена addIngredient должна генерировать уникальный id', () => {
      const action = addIngredient(mockMain);
      expect(action.payload).toMatchObject(mockMain);
      expect(action.payload.id).toBeDefined();
      expect(typeof action.payload.id).toBe('string');
    });

    test('обработка экшена добавления ингредиента (БУЛКА)', () => {
      const action = {
        type: addIngredient.type,
        payload: { ...mockBun, id: 'some-random-uuid' }
      };
      const state = constructorReducer(initialState, action);
      expect(state.bun).toEqual({ ...mockBun, id: 'some-random-uuid' });
      expect(state.ingredients).toHaveLength(0);
    });

    test('обработка экшена добавления ингредиента (НАЧИНКА)', () => {
      const action = {
        type: addIngredient.type,
        payload: mockConstructorIngredient1
      };
      const state = constructorReducer(initialState, action);
      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toEqual(mockConstructorIngredient1);
    });

    test('обработка экшена удаления ингредиента', () => {
      const filledState = {
        ...initialState,
        ingredients: [mockConstructorIngredient1, mockConstructorIngredient2]
      };
      const state = constructorReducer(
        filledState,
        removeIngredient('uuid-item-1')
      );
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]).toEqual(mockConstructorIngredient2);
    });

    test('обработка экшена изменения порядка ингредиентов в начинке', () => {
      const stateWithItems = {
        ...initialState,
        ingredients: [mockConstructorIngredient1, mockConstructorIngredient2] // Порядок: Котлета (0), Соус (1)
      };

      // Перемещаем элемент с индекса 0 (Котлета) на индекс 1
      const state = constructorReducer(
        stateWithItems,
        reorderIngredients({ from: 0, to: 1 })
      );

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0].id).toBe('uuid-item-2'); // Соус стал первым
      expect(state.ingredients[1].id).toBe('uuid-item-1'); // Котлета стала второй
    });

    test('должен очищать данные модального окна при вызове closeOrderModal', () => {
      const stateWithModal = {
        ...initialState,
        orderModalData: { number: 9999 } as TOrder
      };
      const state = constructorReducer(stateWithModal, closeOrderModal());
      expect(state.orderModalData).toBeNull();
    });
  });

  describe('Асинхронные экшены (ExtraReducers - orderBurger)', () => {
    test('при состоянии pending экшена orderBurger: orderRequest становится true, а error сбрасывается', () => {
      const previousState = {
        ...initialState,
        orderRequest: false,
        error: 'предыдущая ошибка'
      };
      const state = constructorReducer(previousState, {
        type: orderBurger.pending.type
      });
      expect(state.orderRequest).toBe(true);
      expect(state.error).toBeNull();
    });

    test('при состоянии fulfilled экшена orderBurger: записывает заказ, очищает конструктор и сбрасывает orderRequest', () => {
      const stateWithBurger = {
        ...initialState,
        bun: mockBun,
        ingredients: [mockConstructorIngredient1, mockConstructorIngredient2],
        orderRequest: true
      };

      const mockPayloadFromServer = {
        number: 9999,
        _id: 'order-id-123',
        status: 'done',
        name: 'Марсианский Бургер'
      };

      const state = constructorReducer(stateWithBurger, {
        type: orderBurger.fulfilled.type,
        payload: mockPayloadFromServer
      });

      expect(state.orderRequest).toBe(false);
      expect(state.bun).toBeNull(); // Проверяем, что конструктор пуст (булка сброшена)
      expect(state.ingredients).toHaveLength(0); // Проверяем, что начинка очищена
      expect(state.orderModalData).toMatchObject({
        number: 9999,
        _id: 'order-id-123',
        name: 'Марсианский Бургер',
        ingredients: ['bun-123', 'main-456', 'sauce-789', 'bun-123']
      });
    });

    test('при состоянии rejected экшена orderBurger: записывает ошибку в стор и сбрасывает orderRequest', () => {
      const stateWithRequest = { ...initialState, orderRequest: true };
      const mockErrorMessage = 'Ошибка сети';

      const state = constructorReducer(stateWithRequest, {
        type: orderBurger.rejected.type,
        error: { message: mockErrorMessage }
      });

      expect(state.orderRequest).toBe(false);
      expect(state.error).toBe(mockErrorMessage);
    });
  });
});
