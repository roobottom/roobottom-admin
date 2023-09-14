const fs = require('fs-extra');

async function copyGovUKFonts() {
  try {
    await fs.copy('app/govuk-frontend/assets/fonts', 'app/assets/fonts');
    console.log('Assets have been copied successfully');
  } catch (err) {
    console.error('An error occurred while copying the assets:', err);
  }
}

copyGovUKFonts();