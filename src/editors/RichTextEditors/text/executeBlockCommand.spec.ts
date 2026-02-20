/**
 * @file Test executeBlockCommand with createBlockDocumentWithStyles
 */

import { describe, it, expect } from 'vitest';
import { createBlockDocumentWithStyles, DEFAULT_STYLE_DEFINITIONS } from '../block/blockDocument';
import { executeBlockCommand } from './commands';

describe('executeBlockCommand with createBlockDocumentWithStyles', () => {
  it('should have DEFAULT_STYLE_DEFINITIONS with bold', () => {
    expect(DEFAULT_STYLE_DEFINITIONS.bold).toEqual({ fontWeight: "bold" });
  });

  it('should create document with styleDefinitions', () => {
    const doc = createBlockDocumentWithStyles('Hello World');
    expect(doc.styleDefinitions.bold).toEqual({ fontWeight: "bold" });
    expect(doc.styleDefinitions.italic).toEqual({ fontStyle: "italic" });
  });

  it('should apply bold style to text', () => {
    const doc = createBlockDocumentWithStyles('Hello World');

    // Apply bold to "Hello" (chars 0-5)
    const newDoc = executeBlockCommand(doc, 'bold', 0, 5);

    expect(newDoc).not.toBe(doc);
    expect(newDoc.version).toBe(doc.version + 1);
    expect(newDoc.blocks[0].styles.length).toBe(1);
    expect(newDoc.blocks[0].styles[0]).toEqual({
      start: 0,
      end: 5,
      style: { fontWeight: "bold" },
    });
  });

  it('should apply italic style to text', () => {
    const doc = createBlockDocumentWithStyles('Hello World');

    // Apply italic to "World" (chars 6-11)
    const newDoc = executeBlockCommand(doc, 'italic', 6, 11);

    expect(newDoc.blocks[0].styles.length).toBe(1);
    expect(newDoc.blocks[0].styles[0]).toEqual({
      start: 6,
      end: 11,
      style: { fontStyle: "italic" },
    });
  });

  it('should toggle bold off when already applied', () => {
    const doc = createBlockDocumentWithStyles('Hello World');

    // Apply bold
    const docWithBold = executeBlockCommand(doc, 'bold', 0, 5);
    expect(docWithBold.blocks[0].styles.length).toBe(1);

    // Toggle bold off
    const docWithoutBold = executeBlockCommand(docWithBold, 'bold', 0, 5);
    expect(docWithoutBold.blocks[0].styles.length).toBe(0);
  });
});
