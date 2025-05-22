const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Source logo file
const sourceFile = path.resolve(__dirname, '../assets/StockPulseLogo-main.png');

// Output directory
const outputDir = path.resolve(__dirname, '../../packages/frontend/public/assets/logo');
const publicDir = path.resolve(__dirname, '../../packages/frontend/public');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Define the sizes for different purposes
const sizes = {
  favicon: [16, 32, 48, 64],        // Favicon sizes
  apple: [57, 60, 72, 76, 114, 120, 144, 152, 180], // Apple touch icons
  android: [36, 48, 72, 96, 144, 192, 512], // Android icons
  msTile: [70, 150, 310],           // MS Tile icons
  general: [16, 32, 64, 128, 192, 256, 512] // General purpose
};

// Function to resize and save an image
async function resizeAndSave(width, purpose) {
  const outputFile = path.join(outputDir, `${purpose}-${width}.png`);
  
  try {
    await sharp(sourceFile)
      .resize(width, width)
      .toFile(outputFile);
    
    console.log(`Generated ${outputFile}`);
  } catch (error) {
    console.error(`Error generating ${outputFile}:`, error);
  }
}

// Generate all the logo sizes
async function generateAllSizes() {
  // Process each purpose category
  for (const [purpose, widths] of Object.entries(sizes)) {
    for (const width of widths) {
      await resizeAndSave(width, purpose);
    }
  }

  // Generate favicon.ico (multi-size icon) and place it in the public directory
  try {
    // Use 16, 32, and 48 pixel versions for favicon.ico
    const faviconSizes = [16, 32, 48].map(size => 
      sharp(sourceFile).resize(size, size).toBuffer()
    );
    
    const faviconBuffers = await Promise.all(faviconSizes);
    
    // Create favicon.ico file using sharp and save directly to public directory
    const outputFile = path.join(publicDir, 'favicon.ico');
    await sharp(faviconBuffers[0])
      .toFile(outputFile);
    
    console.log(`Generated ${outputFile}`);
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
  }
  
  // Also create standard logo sizes
  const standardSizes = [
    { width: 200, height: 50, name: 'logo-horizontal' },
    { width: 400, height: 100, name: 'logo-horizontal@2x' },
    { width: 100, height: 100, name: 'logo-square' },
    { width: 200, height: 200, name: 'logo-square@2x' }
  ];
  
  for (const { width, height, name } of standardSizes) {
    const outputFile = path.join(outputDir, `${name}.png`);
    try {
      await sharp(sourceFile)
        .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFile(outputFile);
      
      console.log(`Generated ${outputFile}`);
    } catch (error) {
      console.error(`Error generating ${outputFile}:`, error);
    }
  }
}

// Run the script
generateAllSizes()
  .then(() => {
    console.log('All logo assets generated successfully!');
  })
  .catch(err => {
    console.error('Error generating logo assets:', err);
    process.exit(1);
  }); 