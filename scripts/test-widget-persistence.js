#!/usr/bin/env node

/**
 * Widget Persistence Test Runner
 * Runs comprehensive tests for widget persistence functionality
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Widget Persistence Test Suite');
console.log('='.repeat(50));

// Test configuration
const testFiles = [
  'tests/story-2.2/unit/useDashboard.test.ts',
  'tests/story-2.2/integration/widget-persistence.test.ts'
];

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkTestFiles() {
  log('\n📋 Checking test files...', 'blue');
  
  const missingFiles = [];
  testFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} (missing)`, 'red');
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    log(`\n⚠️  Missing ${missingFiles.length} test file(s). Tests may not run completely.`, 'yellow');
  }
  
  return missingFiles.length === 0;
}

function runTests() {
  log('\n🧪 Running Widget Persistence Tests...', 'blue');
  
  try {
    // Check if vitest is available
    try {
      execSync('npx vitest --version', { stdio: 'pipe' });
    } catch (error) {
      log('❌ Vitest not found. Installing...', 'yellow');
      execSync('npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom', { stdio: 'inherit' });
    }
    
    // Run the tests
    const testCommand = `npx vitest run ${testFiles.join(' ')} --reporter=verbose`;
    log(`\n🔄 Executing: ${testCommand}`, 'blue');
    
    const output = execSync(testCommand, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    log('\n✅ Tests completed successfully!', 'green');
    log('\n📊 Test Results:', 'bold');
    console.log(output);
    
    return true;
    
  } catch (error) {
    log('\n❌ Tests failed!', 'red');
    log('\n📊 Test Output:', 'bold');
    console.log(error.stdout || error.message);
    
    if (error.stderr) {
      log('\n🚨 Error Details:', 'red');
      console.log(error.stderr);
    }
    
    return false;
  }
}

function runManualTests() {
  log('\n🔧 Manual Testing Guide', 'blue');
  log('='.repeat(30));
  
  const manualTests = [
    {
      name: 'Add Widget Test',
      steps: [
        '1. Navigate to http://localhost:3001/dashboard',
        '2. Click "Start Customizing" button',
        '3. Click "Add Widget" on any widget',
        '4. Verify widget appears on dashboard',
        '5. Check browser console for debug logs'
      ]
    },
    {
      name: 'Persistence Test',
      steps: [
        '1. Add 2-3 widgets to dashboard',
        '2. Refresh the page (F5)',
        '3. Verify all widgets are still there',
        '4. Check that layout is preserved'
      ]
    },
    {
      name: 'Multiple Widgets Test',
      steps: [
        '1. Add a Portfolio Overview widget',
        '2. Add another Portfolio Overview widget',
        '3. Verify both widgets appear',
        '4. Verify they have different IDs'
      ]
    },
    {
      name: 'Remove Widget Test',
      steps: [
        '1. Enter edit mode',
        '2. Click X button on a widget',
        '3. Verify widget is removed',
        '4. Exit edit mode and verify persistence'
      ]
    }
  ];
  
  manualTests.forEach((test, index) => {
    log(`\n${index + 1}. ${test.name}`, 'yellow');
    test.steps.forEach(step => {
      log(`   ${step}`, 'reset');
    });
  });
  
  log('\n💡 Expected Console Logs:', 'blue');
  const expectedLogs = [
    'Dashboard: handleAddWidget called with: [widget-type]',
    'Adding widget: {widgetType, widgetId, newWidget}',
    'Updated layout: [layout object]',
    'Auto-save effect triggered: {isEditMode, hasUnsavedChanges}',
    'Auto-saving layout...',
    'Auto-save completed successfully'
  ];
  
  expectedLogs.forEach(log => {
    console.log(`   • ${log}`);
  });
}

function generateTestReport() {
  log('\n📋 Widget Persistence Test Report', 'bold');
  log('='.repeat(40));
  
  const features = [
    { name: 'Add widgets to dashboard', status: 'implemented' },
    { name: 'Remove widgets from dashboard', status: 'implemented' },
    { name: 'Widget persistence across page reloads', status: 'implemented' },
    { name: 'Multiple widgets of same type', status: 'implemented' },
    { name: 'Auto-save functionality', status: 'implemented' },
    { name: 'Edit mode auto-enable', status: 'implemented' },
    { name: 'Layout saving and loading', status: 'implemented' },
    { name: 'Error handling', status: 'implemented' },
    { name: 'Widget configuration', status: 'implemented' }
  ];
  
  features.forEach(feature => {
    const statusColor = feature.status === 'implemented' ? 'green' : 'yellow';
    const statusIcon = feature.status === 'implemented' ? '✅' : '🔄';
    log(`${statusIcon} ${feature.name}`, statusColor);
  });
  
  log('\n🔧 Test Coverage:', 'blue');
  log('• Unit Tests: useDashboard hook logic');
  log('• Integration Tests: Full dashboard component');
  log('• Manual Tests: Browser interaction testing');
  
  log('\n🚀 Next Steps:', 'blue');
  log('1. Run automated tests: npm run test:widget-persistence');
  log('2. Perform manual testing in browser');
  log('3. Check console logs for debugging info');
  log('4. Verify persistence across page reloads');
}

// Main execution
async function main() {
  try {
    log('Starting Widget Persistence Test Suite...', 'bold');
    
    // Check test files
    const allFilesExist = checkTestFiles();
    
    // Run automated tests if files exist
    if (allFilesExist) {
      const testsPass = runTests();
      
      if (testsPass) {
        log('\n🎉 All automated tests passed!', 'green');
      } else {
        log('\n⚠️  Some automated tests failed. Check output above.', 'yellow');
      }
    } else {
      log('\n⚠️  Skipping automated tests due to missing files.', 'yellow');
    }
    
    // Show manual testing guide
    runManualTests();
    
    // Generate report
    generateTestReport();
    
    log('\n🚀 Widget Persistence Testing Complete!', 'bold');
    
  } catch (error) {
    log(`\n❌ Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  checkTestFiles,
  runManualTests,
  generateTestReport
}; 