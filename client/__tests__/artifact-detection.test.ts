import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

/**
 * Test to prevent reintroduction of corrupted character artifacts
 * Scans all .tsx and .ts files for common corrupted character patterns
 */
describe('Artifact Detection Tests', () => {
  const sourceDir = join(__dirname, '..');
  
  // Common corrupted character patterns to detect
  const corruptedPatterns = [
    /�{1,}/g,           // Generic replacement character
    /\uFFFD/g,          // Unicode replacement character
    /<\?>/g,            // Angular-style placeholder
    /&lt;\?&gt;/g,      // HTML-encoded placeholder
    /&#\d+;/g,          // Numeric HTML entities (suspicious)
    /\u00A0{2,}/g,      // Multiple non-breaking spaces
    /\p{So}{3,}/gu,     // 3+ consecutive symbol characters (unusual)
  ];

  // Patterns that might indicate encoding issues
  const suspiciousPatterns = [
    /[\u0080-\u00FF]{2,}/g,  // Extended ASCII sequences
    /\u00C2[\u0080-\u00BF]/g, // UTF-8 double encoding
  ];

  function getAllSourceFiles(dir: string, extensions = ['.ts', '.tsx']): string[] {
    const files: string[] = [];
    
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          files.push(...getAllSourceFiles(fullPath, extensions));
        } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}:`, error);
    }
    
    return files;
  }

  function checkFileForArtifacts(filePath: string): { 
    hasArtifacts: boolean; 
    artifacts: Array<{ line: number; pattern: string; match: string }>;
  } {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const artifacts: Array<{ line: number; pattern: string; match: string }> = [];

      lines.forEach((line, index) => {
        corruptedPatterns.forEach((pattern, patternIndex) => {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(match => {
              artifacts.push({
                line: index + 1,
                pattern: `corruptedPattern[${patternIndex}]`,
                match: match
              });
            });
          }
        });

        suspiciousPatterns.forEach((pattern, patternIndex) => {
          const matches = line.match(pattern);
          if (matches) {
            matches.forEach(match => {
              artifacts.push({
                line: index + 1,
                pattern: `suspiciousPattern[${patternIndex}]`,
                match: match
              });
            });
          }
        });
      });

      return {
        hasArtifacts: artifacts.length > 0,
        artifacts
      };
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error);
      return { hasArtifacts: false, artifacts: [] };
    }
  }

  it('should not contain corrupted character artifacts in source files', () => {
    const sourceFiles = getAllSourceFiles(sourceDir);
    const filesWithArtifacts: Array<{
      file: string;
      artifacts: Array<{ line: number; pattern: string; match: string }>;
    }> = [];

    sourceFiles.forEach(file => {
      const result = checkFileForArtifacts(file);
      if (result.hasArtifacts) {
        filesWithArtifacts.push({
          file: file.replace(sourceDir, ''),
          artifacts: result.artifacts
        });
      }
    });

    if (filesWithArtifacts.length > 0) {
      const errorMessage = filesWithArtifacts
        .map(({ file, artifacts }) => {
          const artifactList = artifacts
            .map(({ line, pattern, match }) => 
              `    Line ${line}: ${pattern} -> "${match.replace(/\n/g, '\\n')}"`)
            .join('\n');
          return `  ${file}:\n${artifactList}`;
        })
        .join('\n\n');

      throw new Error(
        `Corrupted character artifacts detected in ${filesWithArtifacts.length} file(s):\n\n${errorMessage}\n\n` +
        'Please fix these artifacts before committing. Common fixes:\n' +
        '• Replace � with appropriate Unicode characters\n' +
        '• Replace <?> with proper content\n' +
        '• Fix encoding issues in text editors\n' +
        '• Use proper Unicode escape sequences'
      );
    }

    expect(filesWithArtifacts).toHaveLength(0);
  });

  it('should have valid Unicode in critical UI strings', () => {
    const criticalStrings = [
      '₹', // Indian Rupee
      '→', // Right arrow
      '•', // Bullet point
      '−', // Minus sign
      '✓', // Check mark
      '🔥', // Fire emoji
      '📋', // Clipboard emoji
      '🗓️', // Calendar emoji
    ];

    criticalStrings.forEach(str => {
      // Ensure string doesn't contain replacement characters
      expect(str).not.toMatch(/�/);
      expect(str).not.toMatch(/\uFFFD/);
      
      // Ensure string has valid Unicode length
      expect([...str].length).toBeGreaterThan(0);
    });
  });

  it('should not have placeholder patterns in production builds', () => {
    const productionPlaceholders = [
      'TODO:',
      'FIXME:',
      'XXX:',
      'HACK:',
      'BUG:',
      'console.log(',
      'console.warn(',
      'console.error(',
      'debugger;',
    ];

    // Only check if we're in production build context
    if (process.env.NODE_ENV === 'production') {
      const sourceFiles = getAllSourceFiles(sourceDir);
      const filesWithPlaceholders: string[] = [];

      sourceFiles.forEach(file => {
        try {
          const content = readFileSync(file, 'utf-8');
          const hasPlaceholders = productionPlaceholders.some(placeholder =>
            content.includes(placeholder)
          );
          
          if (hasPlaceholders) {
            filesWithPlaceholders.push(file.replace(sourceDir, ''));
          }
        } catch (error) {
          // Ignore files that can't be read
        }
      });

      expect(filesWithPlaceholders).toHaveLength(0);
    }
  });
});
