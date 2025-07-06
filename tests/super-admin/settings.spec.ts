import { test, expect } from '@playwright/test';

// Super Admin Settings Tests
test.describe('Super Admin Settings Management', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as super admin before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@virtuallab.edu');
    await page.fill('input[type="password"]', 'SuperAdmin123!');
    await page.click('button[type="submit"]');
    
    // Navigate to settings
    await page.goto('/admin/settings');
  });

  test('Can view and navigate settings tabs', async ({ page }) => {
    // Verify page loads
    await expect(page.locator('text=System Settings')).toBeVisible();
    
    // Verify all tabs are present
    await expect(page.locator('text=General')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Features')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Integrations')).toBeVisible();
    
    // Test tab navigation
    await page.click('text=Security');
    await expect(page.locator('text=Security Settings')).toBeVisible();
    
    await page.click('text=Features');
    await expect(page.locator('text=Feature Settings')).toBeVisible();
    
    await page.click('text=Email');
    await expect(page.locator('text=Email Settings')).toBeVisible();
    
    await page.click('text=Integrations');
    await expect(page.locator('text=Integration Settings')).toBeVisible();
  });

  test('Can update general settings', async ({ page }) => {
    // Ensure we're on general tab
    await page.click('text=General');
    
    // Update site name
    const siteNameInput = page.locator('input[name="site_name"]');
    await siteNameInput.clear();
    await siteNameInput.fill('Updated Virtual Lab');
    
    // Update site description
    const descInput = page.locator('textarea[name="site_description"]');
    await descInput.clear();
    await descInput.fill('Updated description for testing');
    
    // Update admin email
    const adminEmailInput = page.locator('input[name="admin_email"]');
    await adminEmailInput.clear();
    await adminEmailInput.fill('updated-admin@virtuallab.edu');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes persist after refresh
    await page.reload();
    await expect(page.locator('input[name="site_name"]')).toHaveValue('Updated Virtual Lab');
    await expect(page.locator('input[name="admin_email"]')).toHaveValue('updated-admin@virtuallab.edu');
  });

  test('Can configure security settings', async ({ page }) => {
    // Navigate to security tab
    await page.click('text=Security');
    
    // Update session timeout
    const sessionTimeoutInput = page.locator('input[name="session_timeout"]');
    await sessionTimeoutInput.clear();
    await sessionTimeoutInput.fill('48');
    
    // Update max login attempts
    const maxAttemptsInput = page.locator('input[name="max_login_attempts"]');
    await maxAttemptsInput.clear();
    await maxAttemptsInput.fill('3');
    
    // Update password minimum length
    const passwordLengthInput = page.locator('input[name="password_min_length"]');
    await passwordLengthInput.clear();
    await passwordLengthInput.fill('10');
    
    // Toggle 2FA requirement
    const require2FAToggle = page.locator('input[name="require_2fa"]');
    await require2FAToggle.check();
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes persist
    await page.reload();
    await page.click('text=Security');
    await expect(page.locator('input[name="session_timeout"]')).toHaveValue('48');
    await expect(page.locator('input[name="max_login_attempts"]')).toHaveValue('3');
    await expect(page.locator('input[name="password_min_length"]')).toHaveValue('10');
    await expect(page.locator('input[name="require_2fa"]')).toBeChecked();
  });

  test('Can manage feature flags', async ({ page }) => {
    // Navigate to features tab
    await page.click('text=Features');
    
    // Test registration toggle
    const registrationToggle = page.locator('input[name="enable_registration"]');
    const isRegistrationEnabled = await registrationToggle.isChecked();
    
    if (isRegistrationEnabled) {
      await registrationToggle.uncheck();
    } else {
      await registrationToggle.check();
    }
    
    // Test messaging toggle
    const messagingToggle = page.locator('input[name="enable_messaging"]');
    await messagingToggle.check();
    
    // Test simulations toggle
    const simulationsToggle = page.locator('input[name="enable_simulations"]');
    await simulationsToggle.check();
    
    // Test file upload toggle and max size
    const fileUploadToggle = page.locator('input[name="enable_file_upload"]');
    await fileUploadToggle.check();
    
    // Update max file size
    const maxFileSizeInput = page.locator('input[name="max_file_size"]');
    await maxFileSizeInput.clear();
    await maxFileSizeInput.fill('25');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes persist
    await page.reload();
    await page.click('text=Features');
    await expect(page.locator('input[name="enable_messaging"]')).toBeChecked();
    await expect(page.locator('input[name="enable_simulations"]')).toBeChecked();
    await expect(page.locator('input[name="enable_file_upload"]')).toBeChecked();
    await expect(page.locator('input[name="max_file_size"]')).toHaveValue('25');
  });

  test('Can configure email settings', async ({ page }) => {
    // Navigate to email tab
    await page.click('text=Email');
    
    // Update SMTP settings
    const smtpHostInput = page.locator('input[name="smtp_host"]');
    await smtpHostInput.clear();
    await smtpHostInput.fill('smtp.test.com');
    
    const smtpPortInput = page.locator('input[name="smtp_port"]');
    await smtpPortInput.clear();
    await smtpPortInput.fill('465');
    
    const smtpUserInput = page.locator('input[name="smtp_user"]');
    await smtpUserInput.clear();
    await smtpUserInput.fill('noreply@virtuallab.edu');
    
    const fromNameInput = page.locator('input[name="smtp_from_name"]');
    await fromNameInput.clear();
    await fromNameInput.fill('Virtual Lab System');
    
    const fromEmailInput = page.locator('input[name="smtp_from_email"]');
    await fromEmailInput.clear();
    await fromEmailInput.fill('system@virtuallab.edu');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes persist
    await page.reload();
    await page.click('text=Email');
    await expect(page.locator('input[name="smtp_host"]')).toHaveValue('smtp.test.com');
    await expect(page.locator('input[name="smtp_port"]')).toHaveValue('465');
    await expect(page.locator('input[name="smtp_user"]')).toHaveValue('noreply@virtuallab.edu');
  });

  test('Can manage integration settings', async ({ page }) => {
    // Navigate to integrations tab
    await page.click('text=Integrations');
    
    // Toggle PhET simulations
    const phetToggle = page.locator('input[name="phet_enabled"]');
    await phetToggle.check();
    
    // Update TaRL API URL
    const tarlApiInput = page.locator('input[name="tarl_api_url"]');
    await tarlApiInput.clear();
    await tarlApiInput.fill('https://api.tarl.org/v2');
    
    // Enable analytics
    const analyticsToggle = page.locator('input[name="analytics_enabled"]');
    await analyticsToggle.check();
    
    // Set analytics ID
    const analyticsIdInput = page.locator('input[name="analytics_id"]');
    await analyticsIdInput.clear();
    await analyticsIdInput.fill('G-TEST123456');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify success message
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
    
    // Verify changes persist
    await page.reload();
    await page.click('text=Integrations');
    await expect(page.locator('input[name="phet_enabled"]')).toBeChecked();
    await expect(page.locator('input[name="tarl_api_url"]')).toHaveValue('https://api.tarl.org/v2');
    await expect(page.locator('input[name="analytics_enabled"]')).toBeChecked();
    await expect(page.locator('input[name="analytics_id"]')).toHaveValue('G-TEST123456');
  });

  test('Can reset settings to defaults', async ({ page }) => {
    // Make some changes first
    await page.click('text=General');
    const siteNameInput = page.locator('input[name="site_name"]');
    await siteNameInput.clear();
    await siteNameInput.fill('Modified Name');
    
    // Click reset button
    await page.click('button:has-text("Reset")');
    
    // Verify settings are reset to defaults
    await expect(page.locator('input[name="site_name"]')).toHaveValue('Virtual Lab');
  });

  test('Validates email format in settings', async ({ page }) => {
    // Navigate to general tab
    await page.click('text=General');
    
    // Enter invalid email
    const adminEmailInput = page.locator('input[name="admin_email"]');
    await adminEmailInput.clear();
    await adminEmailInput.fill('invalid-email');
    
    // Try to save
    await page.click('button:has-text("Save Changes")');
    
    // Verify validation error
    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('Validates numeric fields in security settings', async ({ page }) => {
    // Navigate to security tab
    await page.click('text=Security');
    
    // Enter invalid values
    const sessionTimeoutInput = page.locator('input[name="session_timeout"]');
    await sessionTimeoutInput.clear();
    await sessionTimeoutInput.fill('-5');
    
    const passwordLengthInput = page.locator('input[name="password_min_length"]');
    await passwordLengthInput.clear();
    await passwordLengthInput.fill('3'); // Too short
    
    // Try to save
    await page.click('button:has-text("Save Changes")');
    
    // Verify validation errors
    await expect(page.locator('text=Session timeout must be positive')).toBeVisible();
    await expect(page.locator('text=Password length must be at least 6')).toBeVisible();
  });

  test('Shows conditional fields based on toggle states', async ({ page }) => {
    // Navigate to features tab
    await page.click('text=Features');
    
    // Enable file upload
    const fileUploadToggle = page.locator('input[name="enable_file_upload"]');
    await fileUploadToggle.check();
    
    // Verify max file size field appears
    await expect(page.locator('input[name="max_file_size"]')).toBeVisible();
    
    // Disable file upload
    await fileUploadToggle.uncheck();
    
    // Verify max file size field is hidden or disabled
    await expect(page.locator('input[name="max_file_size"]')).not.toBeVisible();
    
    // Test analytics conditional field
    await page.click('text=Integrations');
    const analyticsToggle = page.locator('input[name="analytics_enabled"]');
    await analyticsToggle.check();
    
    // Verify analytics ID field appears
    await expect(page.locator('input[name="analytics_id"]')).toBeVisible();
  });

  test('Displays current settings values correctly', async ({ page }) => {
    // Verify all tabs load with current values
    const tabs = ['General', 'Security', 'Features', 'Email', 'Integrations'];
    
    for (const tab of tabs) {
      await page.click(`text=${tab}`);
      
      // Verify inputs have values (not empty)
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="number"], textarea');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = inputs.nth(i);
          const value = await input.inputValue();
          // Most settings should have some default value
          if (await input.getAttribute('required')) {
            expect(value).toBeTruthy();
          }
        }
      }
    }
  });
});