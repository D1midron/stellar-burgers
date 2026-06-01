import { test, expect } from '@playwright/test';
import mockIngredients from './ingredients.json';

const API_INGREDIENTS = '**/ingredients';
const API_USER = '**/auth/user';
const API_TOKEN = '**/auth/token';
const API_ORDERS = '**/orders';

test.describe('Интеграционные тесты страницы конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Ингредиенты перехватываем глобально для каждого теста
    await page.route(/\/ingredients/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        json: mockIngredients
      });
    });
  });

  test('Протестировано добавление ingredient из списка в конструктор', async ({
    page
  }) => {
    await page.goto('/');
    await page.waitForSelector('text="Краторная булка N-200i"', {
      timeout: 10000
    });

    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' });
    const mainCard = page.locator('li', {
      hasText: 'Биокотлета из марсианской Магнии'
    });

    await bunCard.locator('button:has-text("Добавить")').click();
    await mainCard.locator('button:has-text("Добавить")').click();

    const constructorSection = page.locator('section').nth(1);

    await expect(
      constructorSection.locator('text=/Краторная булка N-200i.*/').first()
    ).toBeVisible();
    await expect(
      constructorSection
        .locator('text=/Биокотлета из марсианской Магнии.*/')
        .first()
    ).toBeVisible();
  });

  test('Протестирована работа модальных окон', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text="Краторная булка N-200i"', {
      timeout: 10000
    });

    const ingredientLink = page
      .locator('a:has-text("Краторная булка N-200i")')
      .first();
    await ingredientLink.click();

    const modalContent = page
      .locator('text="Детали ингредиента"')
      .or(page.locator('text="Калории"'))
      .first();
    await expect(modalContent).toBeVisible();

    const closeButton = page
      .locator('button[class*="close"], [class*="Close"], button svg')
      .first();
    await closeButton.click({ force: true });
    await expect(modalContent).not.toBeVisible();

    await ingredientLink.click();
    await page.waitForTimeout(500);

    const overlay = page
      .locator('[class*="overlay"], [class*="Overlay"]')
      .first();
    if (await overlay.isVisible()) {
      await overlay.click({ force: true });
    } else {
      await page.mouse.click(10, 10);
    }
    await expect(modalContent).not.toBeVisible();
  });

  test('Создание заказа', async ({ page, context }) => {
    // Наполняем куки сетевого контекста
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'mocked-access-token-xyz789',
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'accessToken',
        value: 'Bearer%20mocked-access-token-xyz789',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Внедряем куки и localStorage ДО первого захода на сайт в этом тесте
    await page.addInitScript(() => {
      document.cookie = 'accessToken=mocked-access-token-xyz789; path=/';
      document.cookie = 'accessToken=Bearer mocked-access-token-xyz789; path=/';
      window.localStorage.setItem('refreshToken', 'mocked-refresh-token-12345');
      window.localStorage.setItem(
        'accessToken',
        'Bearer mocked-access-token-xyz789'
      );
      window.localStorage.setItem('isAuthorized', 'true');
    });

    // Настраиваем перехват профиля пользователя
    await page.route(/\/auth\/user/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        json: {
          success: true,
          user: { email: 'testuser@yandex.ru', name: 'Тестовый Юзер' }
        }
      });
    });

    // Настраиваем перехват создания заказа
    await page.route(/\/orders/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        json: {
          success: true,
          name: 'Марсианский Бургер',
          order: { number: 9999 }
        }
      });
    });

    // Открываем страницу
    await page.goto('/');
    await page.waitForSelector('text="Краторная булка N-200i"', {
      timeout: 10000
    });

    // Добавляем ингредиенты в конструктор
    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' });
    const mainCard = page.locator('li', {
      hasText: 'Биокотлета из марсианской Магнии'
    });

    await bunCard.locator('button:has-text("Добавить")').click();
    await mainCard.locator('button:has-text("Добавить")').click();

    // Оформляем заказ
    const orderButton = page
      .locator('button:has-text("Оформить заказ")')
      .first();
    await orderButton.click();

    // Даем реакту время обработать состояния orderRequest и orderModalData
    await page.waitForTimeout(1000);

    // мы возвращаем тест на главную страницу и пробуем кликнуть повторно, когда стейт точно стабилен
    if (page.url().includes('/login')) {
      await page.goto('/');
      await bunCard.locator('button:has-text("Добавить")').click();
      await mainCard.locator('button:has-text("Добавить")').click();
      await orderButton.click();
    }

    // Ищем номер заказа по регулярному выражению (ловит 9999, 009999, #009999) [1]
    const orderNumber = page.locator('text=/.*9999.*/').first();
    await expect(orderNumber).toBeVisible({ timeout: 15000 });

    // Закрываем окно заказа
    const closeButton = page
      .locator('button[class*="close"], [class*="Close"], button svg')
      .first();
    await closeButton.click({ force: true });
    await expect(orderNumber).not.toBeVisible();

    // Проверяем, что конструктор очистился и показывает дефолтный текст
    const constructorSection = page.locator('section').nth(1);
    await expect(
      constructorSection.locator('text="Выберите булки"').first()
    ).toBeVisible();
  });
});
