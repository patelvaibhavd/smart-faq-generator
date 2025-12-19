/**
 * Smart FAQ Generator - Server
 * Node.js Express backend for FAQ generation
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const FAQGenerator = require('./faqGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize FAQ Generator
const faqGenerator = new FAQGenerator();

// In-memory document storage
const documents = new Map();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not supported. Only PDF files are allowed.`));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

/**
 * API Routes
 */

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload file and generate FAQs
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    
    // Parse PDF file
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const content = pdfData.text;
    
    if (!content.trim()) {
      fs.unlinkSync(filePath); // Clean up empty file
      return res.status(400).json({ error: 'PDF file is empty or could not be parsed' });
    }

    // Generate FAQs
    const faqs = faqGenerator.generateFAQs(content);
    
    // Create document record
    const docId = uuidv4();
    const document = {
      id: docId,
      filename: req.file.originalname,
      filePath: filePath,
      uploadedAt: new Date().toISOString(),
      contentPreview: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      faqs: faqs,
      wordCount: content.split(/\s+/).length,
      characterCount: content.length
    };

    documents.set(docId, document);

    res.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        uploadedAt: document.uploadedAt,
        contentPreview: document.contentPreview,
        wordCount: document.wordCount,
        characterCount: document.characterCount
      },
      faqs: faqs,
      message: `Generated ${faqs.length} FAQs from your document`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process file: ' + error.message });
  }
});

// Generate FAQs from text input
app.post('/api/generate', async (req, res) => {
  try {
    const { text, title } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide at least 50 characters for better FAQ generation' });
    }

    // Generate FAQs
    const faqs = faqGenerator.generateFAQs(text);
    
    // Create document record
    const docId = uuidv4();
    const document = {
      id: docId,
      title: title || 'Text Input',
      content: text,
      uploadedAt: new Date().toISOString(),
      contentPreview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      faqs: faqs,
      wordCount: text.split(/\s+/).length,
      characterCount: text.length
    };

    documents.set(docId, document);

    res.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        uploadedAt: document.uploadedAt,
        contentPreview: document.contentPreview,
        wordCount: document.wordCount,
        characterCount: document.characterCount
      },
      faqs: faqs,
      message: `Generated ${faqs.length} FAQs from your content`
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: 'Failed to generate FAQs: ' + error.message });
  }
});

// Get all documents
app.get('/api/documents', (req, res) => {
  const docList = Array.from(documents.values()).map(doc => ({
    id: doc.id,
    title: doc.title || doc.filename,
    uploadedAt: doc.uploadedAt,
    contentPreview: doc.contentPreview,
    faqCount: doc.faqs.length,
    wordCount: doc.wordCount
  }));
  
  res.json({
    success: true,
    documents: docList.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  });
});

// Get specific document with FAQs
app.get('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    success: true,
    document: {
      id: document.id,
      title: document.title || document.filename,
      uploadedAt: document.uploadedAt,
      contentPreview: document.contentPreview,
      wordCount: document.wordCount,
      characterCount: document.characterCount
    },
    faqs: document.faqs
  });
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Delete file if it exists
  if (document.filePath && fs.existsSync(document.filePath)) {
    try {
      fs.unlinkSync(document.filePath);
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  // Remove from memory
  documents.delete(id);

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// Regenerate FAQs for a document
app.post('/api/documents/:id/regenerate', (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Get content
  let content = document.content;
  if (!content && document.filePath && fs.existsSync(document.filePath)) {
    content = fs.readFileSync(document.filePath, 'utf-8');
  }

  if (!content) {
    return res.status(400).json({ error: 'Unable to retrieve document content' });
  }

  // Regenerate FAQs
  const faqs = faqGenerator.generateFAQs(content);
  document.faqs = faqs;
  documents.set(id, document);

  res.json({
    success: true,
    faqs: faqs,
    message: `Regenerated ${faqs.length} FAQs`
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🧠 Smart FAQ Generator Server                           ║
║                                                           ║
║   Server running at: http://localhost:${PORT}               ║
║                                                           ║
║   API Endpoints:                                          ║
║   • POST /api/upload     - Upload PDF file                ║
║   • POST /api/generate   - Generate FAQs from text        ║
║   • GET  /api/documents  - List all documents             ║
║   • GET  /api/documents/:id - Get document details        ║
║   • DELETE /api/documents/:id - Delete document           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

