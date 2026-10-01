// Keep the Materials-only acceptance command available with the integrated layout.
process.env.ACCEPTANCE_SCOPE='materials';
await import('./browser-course-enrichment.mjs');
