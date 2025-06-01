import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Clean up any test data or sessions if needed
  // For now, we'll just log the completion
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown; 