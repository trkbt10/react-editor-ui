/**
 * @file PNG export for diagram documents
 */

import type { DiagramDocument } from "../types";
import { exportToSVG } from "./exportToSVG";

/**
 * Export diagram document to PNG blob
 */
export async function exportToPNG(
  document: DiagramDocument,
  scale: number = 2,
): Promise<Blob> {
  // Generate SVG
  const svgString = exportToSVG(document);

  // Parse SVG to get dimensions
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseFloat(svgElement.getAttribute("width") || "100");
  const height = parseFloat(svgElement.getAttribute("height") || "100");

  // Create blob URL for SVG
  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Create canvas
      const canvas = window.document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Fill with white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scale and draw image
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create PNG blob"));
          }
        },
        "image/png",
        1.0,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG image"));
    };

    img.src = url;
  });
}
