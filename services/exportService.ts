
import { EbookProject } from "../types";

export const exportEbook = (project: EbookProject, format: 'PDF' | 'EPUB' | 'DOCX') => {
  const { title, author } = project.config;
  const content = project.outline.map(ch => `## ${ch.title}\n\n${ch.content}`).join('\n\n---\n\n');
  const fullText = `TITLE: ${title}\nAUTHOR: ${author}\n\nBLURB:\n${project.blurb}\n\n---\n\n${content}`;

  // In a production environment, we'd use libraries like jspdf, epubgen, or docx.
  // For this simulation, we generate a blob and trigger a download of the text representation.
  const mimeTypes = {
    PDF: 'application/pdf',
    EPUB: 'application/epub+zip',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };

  const extensions = {
    PDF: 'pdf',
    EPUB: 'epub',
    DOCX: 'docx'
  };

  // We simulate the binary data by wrapping our text in a blob of the correct mime type
  // Note: Opening these as actual PDF/DOCX will result in "Corrupt" if opened in strict viewers,
  // but this satisfies the "trigger simulated download" requirement.
  const blob = new Blob([fullText], { type: 'text/plain' }); 
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}_SJ_AI.${extensions[format]}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
