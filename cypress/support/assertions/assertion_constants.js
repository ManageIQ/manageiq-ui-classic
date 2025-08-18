/**
 * Map of flash message types to their corresponding CSS class names.
 * Used by the expect_flash command to validate flash messages.
 * @example
 * cy.expect_flash(flashClassMap.success);
 * cy.expect_flash(flashClassMap.error, 'failed');
 */
export const flashClassMap = {
  warning: 'warning',
  error: 'danger',
  info: 'info',
  success: 'success',
};
