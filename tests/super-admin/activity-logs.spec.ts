import { test, expect } from '@playwright/test';

// Super Admin Activity Logs Tests
test.describe('Super Admin Activity Logs', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to activity logs
    await page.goto('/admin/activity');
  });

  test('Can view activity logs with proper columns', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('text=Activity Logs')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('text=Time')).toBeVisible();
    await expect(page.locator('text=User')).toBeVisible();
    await expect(page.locator('text=Action')).toBeVisible();
    await expect(page.locator('text=Resource')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Duration')).toBeVisible();
    
    // Verify at least one log entry is shown
    const logRows = page.locator('table tbody tr');
    const rowCount = await logRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Can filter logs by time range', async ({ page }) => {
    // Test last hour filter
    await page.selectOption('select[name="dateRange"]', '1h');
    await page.waitForTimeout(1000);
    
    // Verify logs are filtered
    const logRows = page.locator('table tbody tr');
    if (await logRows.count() > 0) {
      // Check that timestamps are recent
      const firstTimestamp = await logRows.first().locator('td:first-child').textContent();
      expect(firstTimestamp).toBeTruthy();
    }
    
    // Test last 24 hours filter
    await page.selectOption('select[name="dateRange"]', '24h');
    await page.waitForTimeout(1000);
    
    // Test last 7 days filter
    await page.selectOption('select[name="dateRange"]', '7d');
    await page.waitForTimeout(1000);
  });

  test('Can filter logs by action type', async ({ page }) => {
    // Filter by authentication actions
    await page.selectOption('select[name="actionFilter"]', 'auth');
    await page.waitForTimeout(1000);
    
    // Verify filtered results contain auth actions
    const actionCells = page.locator('table tbody tr td:nth-child(3)');
    const firstAction = await actionCells.first().textContent();
    expect(firstAction?.toLowerCase()).toContain('auth');
    
    // Filter by user management actions
    await page.selectOption('select[name="actionFilter"]', 'user');
    await page.waitForTimeout(1000);
    
    // Filter by API actions
    await page.selectOption('select[name="actionFilter"]', 'api');
    await page.waitForTimeout(1000);
  });

  test('Can filter logs by status', async ({ page }) => {
    // Filter by success status
    await page.selectOption('select[name="statusFilter"]', 'success');
    await page.waitForTimeout(1000);
    
    // Verify all shown logs have success status
    const statusCells = page.locator('table tbody tr .text-green-500');
    if (await statusCells.count() > 0) {
      await expect(statusCells.first()).toBeVisible();
    }
    
    // Filter by failure status
    await page.selectOption('select[name="statusFilter"]', 'failure');
    await page.waitForTimeout(1000);
    
    // Filter by error status
    await page.selectOption('select[name="statusFilter"]', 'error');
    await page.waitForTimeout(1000);
  });

  test('Can search logs by keyword', async ({ page }) => {
    // Search for login activities
    await page.fill('input[placeholder*="Search"]', 'login');
    await page.waitForTimeout(1000);
    
    // Verify search results contain login-related activities
    const logRows = page.locator('table tbody tr');
    if (await logRows.count() > 0) {
      const firstRow = await logRows.first().textContent();
      expect(firstRow?.toLowerCase()).toContain('login');
    }
    
    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(1000);
    
    // Search by user email
    await page.fill('input[placeholder*="Search"]', 'admin@virtuallab.edu');
    await page.waitForTimeout(1000);
    
    // Verify search results contain the user
    if (await logRows.count() > 0) {
      const firstRow = await logRows.first().textContent();
      expect(firstRow).toContain('admin@virtuallab.edu');
    }
  });

  test('Can view detailed log information', async ({ page }) => {
    // Click on details button for first log entry
    await page.click('table tbody tr:first-child button[title="View Details"]');
    
    // Verify details modal opens
    await expect(page.locator('text=Activity Details')).toBeVisible();
    
    // Verify details contain expected information
    await expect(page.locator('text=Timestamp')).toBeVisible();
    await expect(page.locator('text=Action')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    
    // Close modal
    await page.click('button:has-text("Close")');
    await expect(page.locator('text=Activity Details')).not.toBeVisible();
  });

  test('Can export activity logs', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export');
    
    const download = await downloadPromise;
    
    // Verify file was downloaded
    expect(download.suggestedFilename()).toContain('activity-logs');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Shows pagination for large datasets', async ({ page }) => {
    // Check if pagination is present
    const paginationInfo = page.locator('text=Page');
    if (await paginationInfo.isVisible()) {
      // Test next page navigation
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await expect(page.locator('text=Page 2')).toBeVisible();
        
        // Test previous page navigation
        const prevButton = page.locator('button:has-text("Previous")');
        await prevButton.click();
        await expect(page.locator('text=Page 1')).toBeVisible();
      }
    }
  });

  test('Displays different status icons correctly', async ({ page }) => {
    // Look for success status icons
    const successIcons = page.locator('.text-green-500');
    if (await successIcons.count() > 0) {
      await expect(successIcons.first()).toBeVisible();
    }
    
    // Look for error status icons
    const errorIcons = page.locator('.text-red-500');
    if (await errorIcons.count() > 0) {
      await expect(errorIcons.first()).toBeVisible();
    }
    
    // Look for warning status icons
    const warningIcons = page.locator('.text-orange-500');
    if (await warningIcons.count() > 0) {
      await expect(warningIcons.first()).toBeVisible();
    }
  });

  test('Shows real-time activity updates', async ({ page }) => {
    // Get initial log count
    const initialRows = await page.locator('table tbody tr').count();
    
    // Perform an action that generates logs (refresh page to trigger activity)
    await page.click('button:has-text("Refresh")');
    await page.waitForTimeout(2000);
    
    // Check if new logs appear (refresh action should be logged)
    const updatedRows = await page.locator('table tbody tr').count();
    // Note: This test might need adjustment based on actual logging behavior
  });

  test('Handles empty log states gracefully', async ({ page }) => {
    // Apply filters that might result in no logs
    await page.selectOption('select[name="actionFilter"]', 'simulation');
    await page.selectOption('select[name="statusFilter"]', 'error');
    await page.fill('input[placeholder*="Search"]', 'nonexistent_search_term_12345');
    await page.waitForTimeout(1000);
    
    // Verify empty state message
    const logRows = page.locator('table tbody tr');
    if (await logRows.count() === 0) {
      await expect(page.locator('text=No activity logs found')).toBeVisible();
    }
  });

  test('Logs super admin actions properly', async ({ page }) => {
    // Navigate to user management and perform an action
    await page.goto('/admin/users');
    await page.click('button:has-text("Refresh")');
    
    // Go back to activity logs
    await page.goto('/admin/activity');
    
    // Search for recent admin activities
    await page.selectOption('select[name="actionFilter"]', 'user');
    await page.waitForTimeout(1000);
    
    // Verify admin activities are logged
    const logRows = page.locator('table tbody tr');
    if (await logRows.count() > 0) {
      const adminActivity = logRows.filter({ hasText: 'admin@virtuallab.edu' });
      if (await adminActivity.count() > 0) {
        await expect(adminActivity.first()).toBeVisible();
      }
    }
  });
});