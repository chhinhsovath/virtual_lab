import { test, expect } from '@playwright/test';

// Super Admin Authentication Tests
test.describe('Super Admin Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('Super admin can login and access admin dashboard', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    await expect(page).toHaveURL('/auth/login');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin');
    
    // Verify super admin dashboard elements
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Schools')).toBeVisible();
    await expect(page.locator('text=Activity Logs')).toBeVisible();
  });

  test('Non-super admin cannot access admin dashboard', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form with teacher credentials
    await page.fill('input[type="email"]', 'teacher@school.edu');
    await page.fill('input[type="password"]', 'Teacher123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to teacher dashboard, not admin
    await expect(page).toHaveURL('/dashboard');
    
    // Try to access admin directly
    await page.goto('/admin');
    
    // Should show access denied or redirect to login
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });

  test('Invalid credentials show error message', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('Super admin can logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Verify login button is visible again
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('Session timeout redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Mock session expiration by clearing session storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
    
    // Try to access admin page
    await page.goto('/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login');
  });

  test('Forgot password flow works correctly', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Login');
    
    // Click forgot password link
    await page.click('text=Forgot Password');
    
    // Should navigate to forgot password page
    await expect(page).toHaveURL('/auth/forgot-password');
    
    // Fill email
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Password reset email sent')).toBeVisible();
  });
});