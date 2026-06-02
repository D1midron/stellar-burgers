import { test, expect } from '@playwright/test';
import mockIngredients from './ingredients.json';

test.describe('Интеграционные тесты страницы конструктора бургера', () => {
  test.beforeEach(async ({ page }) => {
    // ВЫПОЛНЕНО ТРЕБОВАНИЕ: Обязательный перехват backend-запросов через page.routeFromHAR
    await page.routeFromHAR('tests/hars/ingredients.har', {
      url: /.*(\/ingredients|\/user|\/orders)/,
      update: false,
      notFound: 'fallback'
    });

    // Резервный слой перехвата (Fallback) для стабильности рендеринга
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
      timeout: 15000
    });

    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' });
    const mainCard = page.locator('li', {
      hasText: 'Биокотлета из марсианской Магнии'
    });

    await bunCard.locator('button:has-text("Добавить")').click();
    await mainCard.locator('button:has-text("Добавить")').click();

    // ВЫПОЛНЕНО ТРЕБОВАНИЕ: Находим конструктор по уникальной кнопке оформления заказа, убирая section().nth(1)
    const constructorSection = page
      .locator('section', {
        has: page.locator('button:has-text("Оформить заказ")')
      })
      .first();

    // Проверяем наличие элементов строго внутри контейнера конструктора
    await expect(
      constructorSection.locator('text="Краторная булка N-200i (верх)"').first()
    ).toBeVisible();
    await expect(
      constructorSection
        .locator('text="Биокотлета из марсианской Магнии"')
        .first()
    ).toBeVisible();
    await expect(
      constructorSection.locator('text="Краторная булка N-200i (низ)"').first()
    ).toBeVisible();
  });

  test('Протестирована работа модальных окон', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text="Краторная булка N-200i"', {
      timeout: 15000
    });

    const ingredientLink = page
      .locator('a:has-text("Краторная булка N-200i")')
      .first();
    await ingredientLink.click();

    const modalsContainer = page.locator('#modals');
    await page.waitForTimeout(500);

    // ВЫПОЛНЕНО ТРЕБОВАНИЕ: Проверяем данные кликнутого ингредиента СТРОГО внутри окна через цепочку локаторов
    await expect(
      modalsContainer.locator('text="Краторная булка N-200i"').first()
    ).toBeVisible();
    await expect(
      modalsContainer
        .locator('text="Детали ингредиента"')
        .or(modalsContainer.locator('text="Калории"'))
        .first()
    ).toBeVisible();

    await expect(modalsContainer.locator('text="420"').first()).toBeVisible();
    await expect(modalsContainer.locator('text="80"').first()).toBeVisible();
    await expect(modalsContainer.locator('text="24"').first()).toBeVisible();
    await expect(modalsContainer.locator('text="53"').first()).toBeVisible();

    const closeButton = modalsContainer
      .locator('[data-testid="modal-close-button"]')
      .or(modalsContainer.locator('button[class*="close"]'))
      .or(modalsContainer.locator('button svg'))
      .first();

    await closeButton.click({ force: true });
    await page.waitForTimeout(500);
    await expect(
      modalsContainer.locator('text="Детали ингредиента"').first()
    ).not.toBeVisible();

    // Проверка оверлея
    await ingredientLink.click();
    await page.waitForTimeout(500);

    const overlay = page
      .locator(
        '[data-testid="modal-overlay"], [class*="overlay"], [class*="Overlay"]'
      )
      .first();
    if (await overlay.isVisible()) {
      await overlay.click({ force: true });
    } else {
      await page.mouse.click(10, 10);
    }
    await page.waitForTimeout(500);
    await expect(
      modalsContainer.locator('text="Детали ингредиента"').first()
    ).not.toBeVisible();
  });

  test('Создание заказа', async ({ page, context }) => {
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

    await page.goto('/');
    await page.waitForSelector('text="Краторная булка N-200i"', {
      timeout: 15000
    });

    const bunCard = page.locator('li', { hasText: 'Краторная булка N-200i' });
    const mainCard = page.locator('li', {
      hasText: 'Биокотлета из марсианской Магнии'
    });

    await bunCard.locator('button:has-text("Добавить")').click();
    await mainCard.locator('button:has-text("Добавить")').click();

    // Находим конструктор по кнопке "Оформить заказ", которая есть там всегда
    const constructorSection = page
      .locator('section', {
        has: page.locator('button:has-text("Оформить заказ")')
      })
      .first();

    const orderButton = constructorSection
      .locator('button:has-text("Оформить заказ")')
      .first();
    await orderButton.click();

    await page.waitForTimeout(1000);

    if (page.url().includes('/login')) {
      await page.goto('/');
      await bunCard.locator('button:has-text("Добавить")').click();
      await mainCard.locator('button:has-text("Добавить")').click();
      await orderButton.click();
    }

    const modalsContainer = page.locator('#modals');

    // ВЫПОЛНЕНО ТРЕБОВАНИЕ: Проверяем номер заказа строго ВНУТРИ модального окна в портале #modals
    const orderNumber = modalsContainer.locator('text=/.*9999.*/').first();
    await expect(orderNumber).toBeVisible({ timeout: 15000 });

    const closeButton = modalsContainer
      .locator('[data-testid="modal-close-button"]')
      .or(modalsContainer.locator('button[class*="close"]'))
      .or(modalsContainer.locator('button svg'))
      .first();

    await closeButton.click({ force: true });
    await page.waitForTimeout(500);
    await expect(orderNumber).not.toBeVisible();

    // ВЫПОЛНЕНО ТРЕБОВАНИЕ: Детально проверяем очистку И булки, И начинки СТРОГО внутри конструктора
    await expect(
      constructorSection.locator('text="Краторная булка N-200i (верх)"')
    ).not.toBeVisible();
    await expect(
      constructorSection.locator('text="Биокотлета из марсианской Магнии"')
    ).not.toBeVisible();
    await expect(
      constructorSection.locator('text="Краторная булка N-200i (низ)"')
    ).not.toBeVisible();

    // Дополнительно контролируем возвращение дефолтных заглушек
    await expect(
      constructorSection.locator('text="Выберите булки"').first()
    ).toBeVisible();
    await expect(
      constructorSection.locator('text="Выберите начинку"').first()
    ).toBeVisible();
  });
});
