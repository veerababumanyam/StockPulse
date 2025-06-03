import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";

// Create a function to capture screenshots
const captureScreenshot = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    return null;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        // Create a link element to download the image
        const link = document.createElement("a");
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        resolve(link.href);
      }, "image/png");
    });
  } catch (error) {
    console.error("Error capturing screenshot:", error);
    return null;
  }
};

// Function to capture dashboard screenshot
export const captureDashboard = () => {
  return captureScreenshot("dashboard-content", "dashboard-screenshot.png");
};

// Function to capture landing page screenshot
export const captureLandingPage = () => {
  return captureScreenshot("landing-content", "landing-screenshot.png");
};

// Function to capture trading page screenshot
export const captureTradingPage = () => {
  return captureScreenshot("trading-content", "trading-screenshot.png");
};

export default {
  captureDashboard,
  captureLandingPage,
  captureTradingPage,
};
