import userReducer, {
  setUser,
  setIsAuthChecked,
  loginUser,
  registerUser,
  logoutUser
} from './userSlice';
import { TUser } from '@utils-types';

describe('Тестирование редьюсера слайса user на Jest', () => {
  const initialState = {
    user: null,
    isAuthChecked: false,
    isLoading: false,
    error: null
  };

  const mockUser: TUser = {
    email: 'testuser@yandex.ru',
    name: 'Тестовый Космонавт'
  };

  describe('Синхронные экшены (Reducers)', () => {
    test('должен возвращать исходное состояние при передаче неизвестного экшена', () => {
      expect(userReducer(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(
        initialState
      );
    });

    test('должен записывать данные пользователя при вызове setUser', () => {
      const newState = userReducer(initialState, setUser(mockUser));
      expect(newState.user).toEqual(mockUser);
    });

    test('должен изменять флаг проверки авторизации при вызове setIsAuthChecked', () => {
      const newState = userReducer(initialState, setIsAuthChecked(true));
      expect(newState.isAuthChecked).toBe(true);
    });
  });

  describe('Асинхронный экшен loginUser', () => {
    test('При вызове экшена Request (pending) переменная isLoading меняется на true', () => {
      const previousState = { ...initialState, error: 'старая ошибка' };
      const action = { type: loginUser.pending.type };

      const newState = userReducer(previousState, action);
      expect(newState.isLoading).toBe(true);
      expect(newState.error).toBeNull();
    });

    test('При вызове экшена Success (fulfilled) данные пользователя записываются, isLoading меняется на false, а isAuthChecked становится true', () => {
      const previousState = { ...initialState, isLoading: true };
      const action = { type: loginUser.fulfilled.type, payload: mockUser };

      const newState = userReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthChecked).toBe(true);
    });

    test('При вызове экшена Failed (rejected) ошибка записывается в стор, isLoading меняется на false', () => {
      const previousState = { ...initialState, isLoading: true };
      const mockError = 'Неверный логин или пароль';
      const action = {
        type: loginUser.rejected.type,
        error: { message: mockError }
      };

      const newState = userReducer(previousState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(mockError);
    });
  });

  describe('Асинхронный экшен registerUser', () => {
    test('При вызове экшена Request (pending) переменная isLoading меняется на true', () => {
      const action = { type: registerUser.pending.type };
      const newState = userReducer(initialState, action);
      expect(newState.isLoading).toBe(true);
    });

    test('При вызове экшена Success (fulfilled) данные нового пользователя записываются в стор', () => {
      const action = { type: registerUser.fulfilled.type, payload: mockUser };
      const newState = userReducer(initialState, action);

      expect(newState.isLoading).toBe(false);
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthChecked).toBe(true);
    });

    test('При вызове экшена Failed (rejected) ошибка регистрации записывается в стор', () => {
      const mockError = 'Пользователь с таким email уже существует';
      const action = {
        type: registerUser.rejected.type,
        error: { message: mockError }
      };

      const newState = userReducer(initialState, action);
      expect(newState.isLoading).toBe(false);
      expect(newState.error).toBe(mockError);
    });
  });

  describe('Асинхронный экшен logoutUser', () => {
    test('при успешном выходе (fulfilled) данные пользователя сбрасываются в null', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthChecked: true
      };

      const action = { type: logoutUser.fulfilled.type };
      const newState = userReducer(stateWithUser, action);

      expect(newState.user).toBeNull();
      // Флаг проверки авторизации при этом остается true, так как проверка была произведена
      expect(newState.isAuthChecked).toBe(true);
    });
  });
});
