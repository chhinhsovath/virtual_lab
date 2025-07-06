import { test, expect } from '@playwright/test';

// Super Admin User Management Tests
test.describe('Super Admin User Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to user management
    await page.goto('/admin/users');
  });

  test('Can view user list with pagination', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('text=User Management')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('text=User')).toBeVisible();
    await expect(page.locator('text=Role')).toBeVisible();
    await expect(page.locator('text=Status')).toBeVisible();
    await expect(page.locator('text=Created')).toBeVisible();
    
    // Verify at least one user is shown
    await expect(page.locator('table tbody tr').first()).toBeVisible();
    
    // Check pagination if there are multiple pages
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(page.locator('text=Page 2')).toBeVisible();
    }
  });

  test('Can search users by name and email', async ({ page }) => {
    // Search by name
    await page.fill('input[placeholder*="Search users"]', 'admin');
    await page.waitForTimeout(1000); // Wait for search debounce
    
    // Verify filtered results
    const userRows = page.locator('table tbody tr');
    await expect(userRows.first()).toContainText('admin');
    
    // Clear search
    await page.fill('input[placeholder*="Search users"]', '');
    await page.waitForTimeout(1000);
    
    // Search by email
    await page.fill('input[placeholder*="Search users"]', '@virtuallab.edu');
    await page.waitForTimeout(1000);
    
    // Verify email search works
    await expect(userRows.first()).toContainText('@virtuallab.edu');
  });

  test('Can filter users by role', async ({ page }) => {
    // Filter by teacher role
    await page.selectOption('select', 'teacher');
    await page.waitForTimeout(1000);
    
    // Verify only teachers are shown
    const roleBadges = page.locator('[class*="badge"]:has-text("TEACHER")');
    const userRows = page.locator('table tbody tr');
    const rowCount = await userRows.count();
    
    if (rowCount > 0) {
      await expect(roleBadges.first()).toBeVisible();
    }
    
    // Filter by admin role
    await page.selectOption('select', 'admin');
    await page.waitForTimeout(1000);
    
    // Verify admin filter works
    const adminBadges = page.locator('[class*="badge"]:has-text("ADMIN")');
    if (await userRows.count() > 0) {
      await expect(adminBadges.first()).toBeVisible();
    }
  });

  test('Can create new user', async ({ page }) => {
    // Click add user button
    await page.click('text=Add User');
    
    // Fill user form
    await page.fill('input[name="full_name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@virtuallab.edu');
    await page.fill('input[name="password"]', 'TestUser123!');
    await page.selectOption('select[name="role"]', 'teacher');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=User created successfully')).toBeVisible();
    
    // Verify user appears in list
    await page.fill('input[placeholder*="Search users"]', 'testuser@virtuallab.edu');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('Can edit existing user', async ({ page }) => {
    // Find and click edit button for first user
    await page.click('table tbody tr:first-child button[title="Edit"]');
    
    // Verify edit dialog opens
    await expect(page.locator('text=Edit User')).toBeVisible();
    
    // Update user information
    const nameInput = page.locator('input[name="full_name"]');
    await nameInput.clear();
    await nameInput.fill('Updated User Name');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=User updated successfully')).toBeVisible();
    
    // Verify changes appear in table
    await expect(page.locator('text=Updated User Name')).toBeVisible();
  });

  test('Can deactivate and reactivate user', async ({ page }) => {
    // Find an active user
    const activeUser = page.locator('table tbody tr:has([class*="text-green"]:has-text("Active"))').first();
    await activeUser.locator('button[title="Edit"]').click();
    
    // Deactivate user
    await page.uncheck('input[name="is_active"]');
    await page.click('button:has-text("Save Changes")');
    
    // Verify user is now inactive
    await expect(page.locator('[class*="text-red"]:has-text("Inactive")')).toBeVisible();
    
    // Reactivate user
    await activeUser.locator('button[title="Edit"]').click();
    await page.check('input[name="is_active"]');
    await page.click('button:has-text("Save Changes")');
    
    // Verify user is active again
    await expect(page.locator('[class*="text-green"]:has-text("Active")')).toBeVisible();
  });

  test('Can change user role', async ({ page }) => {
    // Find a teacher user
    const teacherRow = page.locator('table tbody tr:has([class*="badge"]:has-text("TEACHER"))').first();
    await teacherRow.locator('button[title="Edit"]').click();
    
    // Change role to admin
    await page.selectOption('select[name="role"]', 'admin');
    await page.click('button:has-text("Save Changes")');
    
    // Verify role change
    await expect(page.locator('[class*="badge"]:has-text("ADMIN")')).toBeVisible();
  });

  test('Can delete user with confirmation', async ({ page }) => {
    // Create a test user first
    await page.click('text=Add User');
    await page.fill('input[name="full_name"]', 'Delete Test User');
    await page.fill('input[name="email"]', 'deletetest@virtuallab.edu');
    await page.fill('input[name="password"]', 'DeleteTest123!');
    await page.selectOption('select[name="role"]', 'student');
    await page.click('button[type="submit"]');
    
    // Wait for user to be created
    await expect(page.locator('text=User created successfully')).toBeVisible();
    
    // Search for the user
    await page.fill('input[placeholder*="Search users"]', 'deletetest@virtuallab.edu');
    await page.waitForTimeout(1000);
    
    // Click delete button
    await page.click('button[title="Delete"]:visible');
    
    // Confirm deletion
    await expect(page.locator('text=Delete User')).toBeVisible();
    await page.click('button:has-text("Delete User")');
    
    // Verify success message
    await expect(page.locator('text=User deleted successfully')).toBeVisible();
    
    // Verify user is removed from list
    await expect(page.locator('text=Delete Test User')).not.toBeVisible();
  });

  test('Can export user data', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export');
    
    const download = await downloadPromise;
    
    // Verify file was downloaded
    expect(download.suggestedFilename()).toContain('users');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Validates required fields when creating user', async ({ page }) => {
    // Click add user button
    await page.click('text=Add User');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('Prevents duplicate email addresses', async ({ page }) => {
    // Try to create user with existing email
    await page.click('text=Add User');
    await page.fill('input[name="full_name"]', 'Duplicate Email User');
    await page.fill('input[name="email"]', 'admin@virtuallab.edu'); // Existing email
    await page.fill('input[name="password"]', 'TestUser123!');
    await page.selectOption('select[name="role"]', 'teacher');
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('text=Email already exists')).toBeVisible();
  });
});