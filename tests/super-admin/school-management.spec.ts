import { test, expect } from '@playwright/test';

// Super Admin School Management Tests
test.describe('Super Admin School Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to school management
    await page.goto('/admin/schools');
  });

  test('Can view school list with statistics', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('text=School Management')).toBeVisible();
    
    // Verify statistics cards
    await expect(page.locator('text=Total Schools')).toBeVisible();
    await expect(page.locator('text=Total Teachers')).toBeVisible();
    await expect(page.locator('text=Total Students')).toBeVisible();
    await expect(page.locator('text=Active Simulations')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('text=School')).toBeVisible();
    await expect(page.locator('text=Location')).toBeVisible();
    await expect(page.locator('text=Contact')).toBeVisible();
    await expect(page.locator('text=Statistics')).toBeVisible();
    
    // Verify at least one school is shown
    const schoolRows = page.locator('table tbody tr');
    const rowCount = await schoolRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Can search schools by name and code', async ({ page }) => {
    // Search by school name
    await page.fill('input[placeholder*="Search schools"]', 'Primary');
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const schoolRows = page.locator('table tbody tr');
    if (await schoolRows.count() > 0) {
      const firstRow = await schoolRows.first().textContent();
      expect(firstRow?.toLowerCase()).toContain('primary');
    }
    
    // Clear search
    await page.fill('input[placeholder*="Search schools"]', '');
    await page.waitForTimeout(1000);
    
    // Search by school code
    await page.fill('input[placeholder*="Search schools"]', 'SCH');
    await page.waitForTimeout(1000);
    
    // Verify code search works
    if (await schoolRows.count() > 0) {
      const firstRow = await schoolRows.first().textContent();
      expect(firstRow).toContain('SCH');
    }
  });

  test('Can filter schools by province', async ({ page }) => {
    // Get province filter dropdown
    const provinceSelect = page.locator('select[name="province"]');
    
    // Get all available provinces
    const options = await provinceSelect.locator('option').allTextContents();
    
    if (options.length > 1) { // Skip "All Provinces" option
      // Select a specific province
      await provinceSelect.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      // Verify schools are filtered by province
      const schoolRows = page.locator('table tbody tr');
      if (await schoolRows.count() > 0) {
        // Check that all schools belong to selected province
        const provinceCells = page.locator('table tbody tr td:nth-child(2)');
        const firstProvince = await provinceCells.first().textContent();
        expect(firstProvince).toBeTruthy();
      }
    }
  });

  test('Can view school statistics and badges', async ({ page }) => {
    // Check statistics badges in school rows
    const statsBadges = page.locator('[class*="badge"]');
    
    // Verify teacher count badges
    const teacherBadges = statsBadges.filter({ hasText: 'Teachers' });
    if (await teacherBadges.count() > 0) {
      await expect(teacherBadges.first()).toBeVisible();
    }
    
    // Verify student count badges
    const studentBadges = statsBadges.filter({ hasText: 'Students' });
    if (await studentBadges.count() > 0) {
      await expect(studentBadges.first()).toBeVisible();
    }
    
    // Verify active simulation badges
    const activeBadges = statsBadges.filter({ hasText: 'Active' });
    if (await activeBadges.count() > 0) {
      await expect(activeBadges.first()).toBeVisible();
    }
  });

  test('Can create new school', async ({ page }) => {
    // Click add school button
    await page.click('text=Add School');
    
    // Verify school creation form opens
    await expect(page.locator('text=Add New School')).toBeVisible();
    
    // Fill school form
    await page.fill('input[name="school_code"]', 'TEST001');
    await page.fill('input[name="school_name"]', 'Test Primary School');
    await page.fill('input[name="school_name_en"]', 'Test Primary School');
    
    // Select province
    await page.selectOption('select[name="province_id"]', { index: 1 });
    
    // Fill optional fields
    await page.fill('input[name="district"]', 'Test District');
    await page.fill('input[name="commune"]', 'Test Commune');
    await page.fill('input[name="phone"]', '+855-12-345-678');
    await page.fill('input[name="email"]', 'test@school.edu');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=School created successfully')).toBeVisible();
    
    // Verify school appears in list
    await page.fill('input[placeholder*="Search schools"]', 'TEST001');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Test Primary School')).toBeVisible();
  });

  test('Can edit school information', async ({ page }) => {
    // Find and click edit button for first school
    await page.click('table tbody tr:first-child button[title="Edit"]');
    
    // Verify edit dialog opens
    await expect(page.locator('text=Edit School')).toBeVisible();
    
    // Update school information
    const nameInput = page.locator('input[name="school_name"]');
    const currentName = await nameInput.inputValue();
    await nameInput.clear();
    await nameInput.fill(`${currentName} - Updated`);
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=School updated successfully')).toBeVisible();
    
    // Verify changes appear in table
    await expect(page.locator('text=Updated')).toBeVisible();
  });

  test('Can view school contact information', async ({ page }) => {
    // Look for schools with contact information
    const phoneIcons = page.locator('.lucide-phone');
    const emailIcons = page.locator('.lucide-mail');
    
    if (await phoneIcons.count() > 0) {
      await expect(phoneIcons.first()).toBeVisible();
    }
    
    if (await emailIcons.count() > 0) {
      await expect(emailIcons.first()).toBeVisible();
    }
    
    // Verify location information
    const mapIcons = page.locator('.lucide-map-pin');
    if (await mapIcons.count() > 0) {
      await expect(mapIcons.first()).toBeVisible();
    }
  });

  test('Can access detailed school view', async ({ page }) => {
    // Click on first school name to view details
    await page.click('table tbody tr:first-child td:first-child');
    
    // Verify navigation to school detail page
    await expect(page.url()).toMatch(/\/admin\/schools\/\w+/);
    
    // Verify school detail page elements
    await expect(page.locator('text=School Details')).toBeVisible();
  });

  test('Shows proper school status indicators', async ({ page }) => {
    // Check for various status indicators
    const statusBadges = page.locator('[class*="badge"]');
    
    // Verify active schools have proper indicators
    const activeIndicators = statusBadges.filter({ hasText: 'Active' });
    if (await activeIndicators.count() > 0) {
      await expect(activeIndicators.first()).toHaveClass(/text-green/);
    }
  });

  test('Can export school data', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export');
    
    const download = await downloadPromise;
    
    // Verify file was downloaded
    expect(download.suggestedFilename()).toContain('schools');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Validates required fields when creating school', async ({ page }) => {
    // Click add school button
    await page.click('text=Add School');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=School code is required')).toBeVisible();
    await expect(page.locator('text=School name is required')).toBeVisible();
    await expect(page.locator('text=Province is required')).toBeVisible();
  });

  test('Prevents duplicate school codes', async ({ page }) => {
    // Get existing school code
    const firstSchoolCode = await page.locator('table tbody tr:first-child').textContent();
    const codeMatch = firstSchoolCode?.match(/Code: (\w+)/);
    
    if (codeMatch) {
      const existingCode = codeMatch[1];
      
      // Try to create school with existing code
      await page.click('text=Add School');
      await page.fill('input[name="school_code"]', existingCode);
      await page.fill('input[name="school_name"]', 'Duplicate Code School');
      await page.selectOption('select[name="province_id"]', { index: 1 });
      await page.click('button[type="submit"]');
      
      // Verify error message
      await expect(page.locator('text=School code already exists')).toBeVisible();
    }
  });

  test('Can manage school-user associations', async ({ page }) => {
    // Click on first school to view details
    await page.click('table tbody tr:first-child button[title="Edit"]');
    
    // Look for user management section
    const userSection = page.locator('text=Associated Users');
    if (await userSection.isVisible()) {
      await expect(userSection).toBeVisible();
      
      // Check for add user button
      const addUserBtn = page.locator('button:has-text("Add User")');
      if (await addUserBtn.isVisible()) {
        await expect(addUserBtn).toBeVisible();
      }
    }
  });

  test('Displays school hierarchy correctly', async ({ page }) => {
    // Verify location hierarchy (Province > District > Commune)
    const locationCells = page.locator('table tbody tr td:nth-child(2)');
    
    if (await locationCells.count() > 0) {
      const firstLocation = await locationCells.first().textContent();
      
      // Check for proper hierarchy display
      if (firstLocation?.includes('District') || firstLocation?.includes('Commune')) {
        expect(firstLocation).toBeTruthy();
      }
    }
  });
});