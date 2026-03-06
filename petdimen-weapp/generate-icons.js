#!/usr/bin/env node
/**
 * Generate tabBar icons for PetDimen WeChat Mini-Program
 * Run: node generate-icons.js
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Create assets/icons directory
const iconDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

// Icon definitions: [name, emoji, inactiveColor, activeColor]
const icons = [
  ['home', '🏠', '#999999', '#FF6B6B'],
  ['pet', '🐾', '#999999', '#FF6B6B'],
  ['moments', '📸', '#999999', '#FF6B6B'],
  ['user', '👤', '#999999', '#FF6B6B']
];

// Try using sharp if available, otherwise create placeholder files
try {
  const sharp = require('sharp');
  
  icons.forEach(([name, emoji, inactiveColor, activeColor]) => {
    // Create SVG for inactive icon
    const inactiveSvg = `
      <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" fill="white"/>
        <text x="48" y="60" font-size="48" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      </svg>
    `;
    
    // Create SVG for active icon
    const activeSvg = `
      <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" fill="white"/>
        <circle cx="48" cy="48" r="45" fill="${activeColor}" opacity="0.1"/>
        <text x="48" y="60" font-size="48" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
      </svg>
    `;
    
    // Convert SVG to PNG
    sharp(Buffer.from(inactiveSvg))
      .png()
      .toFile(path.join(iconDir, `${name}.png`))
      .then(() => console.log(`✓ Created ${name}.png`))
      .catch(err => console.error(`✗ Failed to create ${name}.png:`, err.message));
    
    sharp(Buffer.from(activeSvg))
      .png()
      .toFile(path.join(iconDir, `${name}-active.png`))
      .then(() => console.log(`✓ Created ${name}-active.png`))
      .catch(err => console.error(`✗ Failed to create ${name}-active.png:`, err.message));
  });
  
} catch (err) {
  console.log('sharp not installed, creating placeholder PNG files...');
  
  // Create minimal valid PNG files (1x1 transparent pixel)
  const minimalPng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, etc.
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
    0x0D, 0x0A, 0x2D, 0xB4, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk size
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  icons.forEach(([name]) => {
    fs.writeFileSync(path.join(iconDir, `${name}.png`), minimalPng);
    console.log(`✓ Created placeholder ${name}.png`);
    
    fs.writeFileSync(path.join(iconDir, `${name}-active.png`), minimalPng);
    console.log(`✓ Created placeholder ${name}-active.png`);
  });
  
  console.log('\n⚠️  Placeholder PNG files created.');
  console.log('For better quality icons, install sharp: npm install sharp');
}
