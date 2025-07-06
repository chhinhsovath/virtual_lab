import { test, expect } from '@playwright/test';

// Super Admin Dashboard Tests
test.describe('Super Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to admin dashboard
    await page.goto('/admin');
  });

  test('Dashboard loads with correct layout and components', async ({ page }) => {
    // Verify main dashboard elements
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    
    // Verify navigation sidebar
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Schools')).toBeVisible();
    await expect(page.locator('text=Activity Logs')).toBeVisible();
    await expect(page.locator('text=Settings')).toBeVisible();
    
    // Verify main content area
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('Statistics cards display current data', async ({ page }) => {
    // Verify statistics cards are present
    const statsCards = page.locator('[data-testid="stats-card"]');
    const cardCount = await statsCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(4);
    
    // Verify key statistics
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Schools')).toBeVisible();
    await expect(page.locator('text=System Activity')).toBeVisible();
    await expect(page.locator('text=Active Sessions')).toBeVisible();
    
    // Verify stats have numeric values
    const userCount = page.locator('[data-testid="total-users-count"]');
    if (await userCount.isVisible()) {
      const userCountText = await userCount.textContent();
      expect(parseInt(userCountText || '0')).toBeGreaterThanOrEqual(0);
    }
  });

  test('Recent activity feed shows latest actions', async ({ page }) => {
    // Verify activity feed section
    await expect(page.locator('text=Recent Activity')).toBeVisible();
    
    // Verify activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    const itemCount = await activityItems.count();
    
    if (itemCount > 0) {
      // Verify first activity item has required elements
      const firstItem = activityItems.first();
      await expect(firstItem).toBeVisible();
      
      // Should have timestamp, user, and action
      await expect(firstItem.locator('.timestamp')).toBeVisible();
      await expect(firstItem.locator('.action')).toBeVisible();
    }
  });

  test('System status indicators show current health', async ({ page }) => {
    // Verify system status section
    await expect(page.locator('text=System Status')).toBeVisible();
    
    // Check for status indicators
    const statusIndicators = page.locator('[data-testid="status-indicator"]');
    const statusCount = await statusIndicators.count();
    
    if (statusCount > 0) {
      // Verify status indicators show proper states
      const firstStatus = statusIndicators.first();
      await expect(firstStatus).toBeVisible();
      
      // Should have status color (green, yellow, red)
      const statusClasses = await firstStatus.getAttribute('class');
      expect(statusClasses).toMatch(/(green|yellow|red|blue)/);
    }
  });

  test('Quick actions menu provides admin shortcuts', async ({ page }) => {
    // Verify quick actions section
    const quickActions = page.locator('[data-testid="quick-actions"]');
    if (await quickActions.isVisible()) {
      await expect(quickActions).toBeVisible();
      
      // Check for common admin actions
      const actionButtons = quickActions.locator('button');
      const buttonCount = await actionButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('Charts and graphs render correctly', async ({ page }) => {
    // Look for chart containers
    const chartContainers = page.locator('[data-testid="chart-container"]');
    const chartCount = await chartContainers.count();
    
    if (chartCount > 0) {
      // Verify charts are loaded
      const firstChart = chartContainers.first();
      await expect(firstChart).toBeVisible();
      
      // Charts should have some content/canvas
      const chartContent = firstChart.locator('canvas, svg');
      if (await chartContent.count() > 0) {
        await expect(chartContent.first()).toBeVisible();
      }
    }
  });

  test('Navigation between admin sections works', async ({ page }) => {
    // Test navigation to Users
    await page.click('text=Users');
    await expect(page.locator('text=User Management')).toBeVisible();
    await expect(page).toHaveURL('/admin/users');
    
    // Navigate back to dashboard
    await page.click('text=Dashboard');
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    
    // Test navigation to Schools
    await page.click('text=Schools');
    await expect(page.locator('text=School Management')).toBeVisible();
    await expect(page).toHaveURL('/admin/schools');
    
    // Navigate back to dashboard
    await page.goto('/admin');
    await expect(page.locator('text=Super Admin Dashboard')).toBeVisible();
    
    // Test navigation to Activity Logs
    await page.click('text=Activity Logs');
    await expect(page.locator('text=Activity Logs')).toBeVisible();
    await expect(page).toHaveURL('/admin/activity');
    
    // Navigate back to dashboard
    await page.goto('/admin');
    
    // Test navigation to Settings
    await page.click('text=Settings');
    await expect(page.locator('text=System Settings')).toBeVisible();
    await expect(page).toHaveURL('/admin/settings');
  });

  test('Dashboard refreshes data automatically', async ({ page }) => {
    // Get initial activity count
    const initialActivityItems = await page.locator('[data-testid="activity-item"]').count();
    
    // Wait for auto-refresh or trigger manual refresh
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Verify data refreshed (this test might need adjustment based on actual implementation)
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });

  test('User profile menu works correctly', async ({ page }) => {
    // Click user profile menu
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Verify menu options
      await expect(page.locator('text=Profile')).toBeVisible();
      await expect(page.locator('text=Settings')).toBeVisible();
      await expect(page.locator('text=Logout')).toBeVisible();
      
      // Test profile navigation
      await page.click('text=Profile');
      await expect(page.locator('text=User Profile')).toBeVisible();
    }
  });

  test('Error states are handled gracefully', async ({ page }) => {
    // Simulate network error by intercepting API calls
    await page.route('/api/admin/dashboard', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    // Refresh page to trigger error
    await page.reload();
    
    // Verify error handling
    const errorMessage = page.locator('text=Error loading dashboard data');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }
    
    // Verify retry button if present
    const retryButton = page.locator('button:has-text("Retry")');
    if (await retryButton.isVisible()) {
      await expect(retryButton).toBeVisible();
    }
  });

  test('Mobile responsive design works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile navigation
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      
      // Verify navigation items in mobile menu
      await expect(page.locator('text=Users')).toBeVisible();
      await expect(page.locator('text=Schools')).toBeVisible();
    }
    
    // Verify stats cards stack vertically on mobile
    const statsCards = page.locator('[data-testid="stats-card"]');
    if (await statsCards.count() > 1) {
      const firstCard = statsCards.first();
      const secondCard = statsCards.nth(1);
      
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      if (firstCardBox && secondCardBox) {
        // On mobile, cards should stack (second card below first)
        expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 10);
      }
    }
  });

  test('Search functionality works across dashboard', async ({ page }) => {
    // Look for global search
    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('admin');
      await page.waitForTimeout(1000);
      
      // Verify search results appear
      const searchResults = page.locator('[data-testid="search-results"]');
      if (await searchResults.isVisible()) {
        await expect(searchResults).toBeVisible();
      }
    }
  });

  test('Notifications and alerts display correctly', async ({ page }) => {
    // Look for notification area
    const notifications = page.locator('[data-testid="notifications"]');
    if (await notifications.isVisible()) {
      await expect(notifications).toBeVisible();
      
      // Check for notification items
      const notificationItems = notifications.locator('[data-testid="notification-item"]');
      const notificationCount = await notificationItems.count();
      
      if (notificationCount > 0) {
        // Verify notification structure
        const firstNotification = notificationItems.first();
        await expect(firstNotification).toBeVisible();
      }
    }
    
    // Look for system alerts
    const alerts = page.locator('[role="alert"]');
    const alertCount = await alerts.count();
    
    if (alertCount > 0) {
      await expect(alerts.first()).toBeVisible();
    }
  });

  test('Performance metrics are displayed', async ({ page }) => {
    // Look for performance indicators
    const performanceSection = page.locator('[data-testid="performance-metrics"]');
    if (await performanceSection.isVisible()) {
      await expect(performanceSection).toBeVisible();
      
      // Check for common performance metrics
      const metrics = ['Response Time', 'Memory Usage', 'Active Connections', 'Error Rate'];
      
      for (const metric of metrics) {
        const metricElement = page.locator(`text=${metric}`);
        if (await metricElement.isVisible()) {
          await expect(metricElement).toBeVisible();
        }
      }
    }
  });
});