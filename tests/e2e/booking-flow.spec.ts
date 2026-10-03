import { test, expect } from '@playwright/test';

test.describe('Nail Studio PWA End-to-End Booking & Isolation Flow', () => {
  test('Complete flow: Studio open -> Service select -> Master select -> Slot pick -> Booking submit -> Verification in Owner Portal', async ({ page }) => {
    // 1. Open Lumi Nail Studio
    await page.goto('/s/lumi-nail-studio/');
    await expect(page).toHaveTitle(/DEMO BEAUTY STUDIO/);

    // Verify studio header & address
    await expect(page.locator('h1')).toContainText('DEMO BEAUTY STUDIO');
    await expect(page.getByText('ул. Большая Никитская, 14/2')).toBeVisible();

    // 2. Click on primary service card
    const firstServiceCard = page.locator('text=Комплекс «Маникюр + гель-лак + выравнивание»').first();
    await expect(firstServiceCard).toBeVisible();
    await firstServiceCard.click();

    // Verify sticky bottom booking bar appears
    const stickyBar = page.getByRole('button', { name: /Выбрать время/i });
    await expect(stickyBar).toBeVisible();

    // 3. Open Slot Picker
    await stickyBar.click();

    // Verify SlotPicker modal is open
    await expect(page.getByText('Выбор даты и времени')).toBeVisible();

    // Pick first available time slot button (e.g. 10:00 or similar)
    const slotButton = page.locator('button:has-text(":")').first();
    await expect(slotButton).toBeVisible();
    await slotButton.click();

    // 4. Fill in Customer Details in BookingFormModal
    await expect(page.getByText('Подтверждение записи')).toBeVisible();

    await page.fill('input[placeholder="Как к вам обращаться"]', 'Екатерина Тестовая');
    await page.fill('input[placeholder="+7 (___) ___-__-__"]', '+7 (999) 777-66-55');

    // Submit booking
    const submitBtn = page.getByRole('button', { name: /Подтвердить запись/i });
    await submitBtn.click();

    // 5. Verification on Client Status Page (/s/lumi-nail-studio/b/:token)
    await page.waitForURL(/\/s\/lumi-nail-studio\/b\//);
    await expect(page.getByText('Вы записаны!')).toBeVisible();
    await expect(page.getByText('Екатерина Тестовая')).toBeHidden(); // Client screen is private, shows appointment details
    await expect(page.getByText(/Комплекс «Маникюр/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Добавить в календарь/i })).toBeVisible();

    // 6. Verification in Owner Portal (/s/lumi-nail-studio/owner/)
    await page.goto('/s/lumi-nail-studio/owner/');
    await expect(page.getByText('Кабинет управления студией')).toBeVisible();

    // Switch to "Записи" tab
    await page.getByRole('button', { name: 'Записи' }).click();

    // Verify our booked client is listed in the owner database
    await expect(page.getByText('Екатерина Тестовая')).toBeVisible();
    await expect(page.getByText('+7 (999) 777-66-55')).toBeVisible();
  });

  test('Tenant Isolation: Aura Nail Bar has distinct theme, services, and zero data leakage', async ({ page }) => {
    await page.goto('/s/aura-nail-bar/');
    await expect(page).toHaveTitle(/AURA NAIL BAR/);

    // Verify distinct branding and address
    await expect(page.locator('h1')).toContainText('AURA NAIL BAR');
    await expect(page.getByText('Невский проспект, 78')).toBeVisible();

    // Must NOT contain Lumi's services
    await expect(page.getByText('Комплекс «Маникюр + гель-лак + выравнивание»')).toBeHidden();

    // Must contain Aura's services
    await expect(page.getByText('Скоростной экспресс-маникюр')).toBeVisible();

    // Verify owner dashboard of Aura does not contain Lumi's client
    await page.goto('/s/aura-nail-bar/owner/');
    await page.getByRole('button', { name: 'Записи' }).click();
    await expect(page.getByText('Екатерина Тестовая')).toBeHidden();
  });
});
