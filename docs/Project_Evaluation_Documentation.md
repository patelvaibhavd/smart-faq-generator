# Smart FAQ Generator

## Transform Your Content into Intelligent FAQs Instantly

---

# Scope of the Project

## Project Title
**Smart FAQ Generator: Automated FAQ Generation System with NLP**

## Project Objectives

1. **Content Processing**: Enable users to upload PDF documents or paste text content and automatically extract, analyze, and process it for FAQ generation.

2. **Intelligent FAQ Generation**: Implement an NLP-based system that identifies topics, extracts keywords, and generates relevant question-answer pairs from content.

3. **Multiple Input Methods**: Support both file upload (PDF) and direct text input for flexible content ingestion.

4. **RESTful API**: Provide a clean, well-documented REST API for seamless integration with frontend applications or other services.

5. **Document Management**: Allow users to manage, view, and delete their processed documents and generated FAQs.

## Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1 | PDF Upload API | Endpoint to upload and process PDF documents |
| 2 | Text Input API | Endpoint to generate FAQs from pasted text content |
| 3 | FAQ Generator Engine | NLP-based module for intelligent FAQ generation |
| 4 | Document Management | APIs to list, retrieve, and delete documents |
| 5 | Modern Web UI | Responsive dark-themed frontend with drag-and-drop |
| 6 | Copy & Export | Ability to copy generated FAQs to clipboard |

---

# Design

## Design Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SMART FAQ GENERATOR ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   User/Client   │
                              │   (Browser)     │
                              └────────┬────────┘
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS.JS SERVER                               │
│  ┌────────────┐  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │   CORS     │  │  JSON Parser   │  │ Error Handler  │  │    Multer     │  │
│  │ Middleware │  │   Middleware   │  │   Middleware   │  │ File Upload   │  │
│  └────────────┘  └────────────────┘  └────────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
         ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
         │   /api/upload    │ │  /api/generate   │ │  /api/documents  │
         │                  │ │                  │ │                  │
         │  • POST (PDF)    │ │  • POST (text)   │ │  • GET /         │
         │                  │ │                  │ │  • GET /:id      │
         │                  │ │                  │ │  • DELETE /:id   │
         │                  │ │                  │ │  • POST /:id/    │
         │                  │ │                  │ │    regenerate    │
         └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘
                  │                    │                    │
                  ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICES LAYER                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        FAQ GENERATOR MODULE                            │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │ │
│  │  │   Sentence   │  │   Keyword    │  │    Topic     │  │    FAQ     │ │ │
│  │  │  Extraction  │  │  Extraction  │  │Identification│  │ Generation │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                  │                    │
                  ▼                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│         File System (uploads/)       │  │      In-Memory Document Store    │
│         PDF Storage                  │  │      (Map<id, document>)         │
└──────────────────────────────────────┘  └──────────────────────────────────┘
```

## Design Description

### PDF Upload & Processing Module
- Accepts PDF files via multipart form upload (max 10MB)
- Extracts text using **pdf-parse** library
- Validates file type (PDF only) and file size
- Stores uploaded files in `/uploads` directory
- Generates unique document ID using UUID

### FAQ Generator Engine
- **Sentence Extraction**: Splits text into meaningful sentences (min 20 chars)
- **Keyword Extraction**: Identifies top 15 frequent words (excluding stop words)
- **Topic Identification**: Detects main topics from capitalized phrases and keywords
- **FAQ Generation**: Creates multiple FAQ types:
  - Definition FAQs (What is...?)
  - Process FAQs (How does...?)
  - Feature FAQs (What features...?)
  - Benefit FAQs (Why should I...?)
  - General FAQs (Can I...?, What are the requirements...?)

### Document Management
- In-memory storage using JavaScript Map
- Stores document metadata, content preview, and generated FAQs
- Supports CRUD operations on documents
- Automatic cleanup of files on document deletion

---

## Workflow

### PDF Upload & FAQ Generation Flow

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Upload    │────▶│  Validate PDF   │────▶│  Extract     │────▶│   Store      │
│   PDF File  │     │  (Type & Size)  │     │  Text        │     │   File       │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
                                                                        │
                                                                        ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Response   │◀────│  Store in       │◀────│  Generate    │◀────│   Parse      │
│  with FAQs  │     │  Memory Map     │     │   FAQs       │     │   Content    │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```

### FAQ Generation Algorithm Flow

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Input     │────▶│    Extract      │────▶│   Extract    │────▶│  Identify    │
│   Text      │     │   Sentences     │     │   Keywords   │     │   Topics     │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
                                                                        │
                                                                        ▼
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│  Return     │◀────│   Remove        │◀────│  Generate    │◀────│   Match      │
│  Top 10     │     │   Duplicates    │     │  Q&A Pairs   │     │   Patterns   │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```

### Text Input Flow

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│   Paste     │────▶│   Validate      │────▶│   Generate   │────▶│   Store &    │
│   Text      │     │   (≥50 chars)   │     │   FAQs       │     │   Respond    │
└─────────────┘     └─────────────────┘     └──────────────┘     └──────────────┘
```

---

# Test Cases

## Positive Test Cases

| TC # | Test Case Name | Description | Expected Result |
|------|----------------|-------------|-----------------|
| TC-01 | PDF Upload Success | Upload a valid PDF document | Document indexed with unique ID, FAQs returned |
| TC-02 | Text Input Success | Submit text with ≥50 characters | FAQs generated from text content |
| TC-03 | FAQ Generation | Upload content-rich PDF | Multiple relevant Q&A pairs generated |
| TC-04 | Document Listing | GET /api/documents | List of all processed documents |
| TC-05 | Document Retrieval | GET /api/documents/:id | Document details with FAQs |
| TC-06 | Document Deletion | DELETE /api/documents/:id | Document and file removed successfully |
| TC-07 | FAQ Regeneration | POST /api/documents/:id/regenerate | New FAQs generated from same content |
| TC-08 | Health Check | GET /api/health | Status: ok with timestamp |
| TC-09 | Copy FAQs | Click copy button in UI | All FAQs copied to clipboard |
| TC-10 | Drag & Drop Upload | Drag PDF file to upload zone | File accepted and processed |

## Negative Test Cases

| TC # | Test Case Name | Description | Expected Result |
|------|----------------|-------------|-----------------|
| TC-11 | Upload No File | POST /api/upload without file | 400 Error: "No file uploaded" |
| TC-12 | Upload Invalid Format | Upload non-PDF file (.txt, .doc) | 400 Error: "Only PDF files are allowed" |
| TC-13 | Upload Oversized File | Upload file > 10MB | 400 Error: "File size too large" |
| TC-14 | Empty Text Input | POST /api/generate with empty text | 400 Error: "Text content is required" |
| TC-15 | Short Text Input | POST with < 50 characters | 400 Error: "Please provide at least 50 characters" |
| TC-16 | Get Non-existent Doc | GET /api/documents/:invalidId | 404 Error: "Document not found" |
| TC-17 | Delete Non-existent | DELETE /api/documents/:invalidId | 404 Error: "Document not found" |
| TC-18 | Empty PDF Upload | Upload PDF with no text content | 400 Error: "PDF file is empty or could not be parsed" |
| TC-19 | Regenerate Invalid | POST /api/documents/:invalidId/regenerate | 404 Error: "Document not found" |
| TC-20 | Invalid File Extension | Attempt to bypass with renamed file | 400 Error: File type validation failure |

---

# Tools and Code Details

## Third Party Tools/Libraries

| Tool/Library | Open Source/Licensed | URL | Purpose |
|--------------|---------------------|-----|---------|
| Express.js | Open Source (MIT) | https://expressjs.com/ | REST API framework |
| pdf-parse | Open Source (MIT) | https://www.npmjs.com/package/pdf-parse | PDF text extraction |
| Multer | Open Source (MIT) | https://www.npmjs.com/package/multer | File upload handling |
| UUID | Open Source (MIT) | https://www.npmjs.com/package/uuid | Unique ID generation |
| CORS | Open Source (MIT) | https://www.npmjs.com/package/cors | Cross-origin requests |

## Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Backend runtime environment |
| JavaScript (CommonJS) | ES2022 | Programming language |
| Express.js | 4.18.2 | Web application framework |
| HTML5 | - | Frontend markup |
| CSS3 | - | Styling with CSS variables |
| Vanilla JavaScript | ES6+ | Frontend interactivity |
| REST API | - | API architecture |

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with timestamp |
| POST | `/api/upload` | Upload PDF and generate FAQs |
| POST | `/api/generate` | Generate FAQs from text input |
| GET | `/api/documents` | List all processed documents |
| GET | `/api/documents/:id` | Get document details with FAQs |
| DELETE | `/api/documents/:id` | Delete document and file |
| POST | `/api/documents/:id/regenerate` | Regenerate FAQs for document |

---

# Project Structure

```
smart-faq-generator/
├── server.js                 # Express server & API routes
├── faqGenerator.js           # FAQ generation engine (NLP)
├── package.json              # Dependencies & scripts
├── package-lock.json         # Dependency lock file
├── README.md                 # Project readme
├── .gitignore                # Git ignore rules
├── docs/
│   └── Project_Evaluation_Documentation.md
├── public/                   # Frontend assets
│   ├── index.html            # Main HTML page
│   ├── app.js                # Frontend JavaScript
│   └── styles.css            # CSS (dark theme)
└── uploads/                  # PDF file storage
```

---

# Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `MAX_FILE_SIZE` | 10MB | Maximum upload file size |
| `ALLOWED_TYPES` | .pdf | Accepted file extensions |
| `MIN_TEXT_LENGTH` | 50 | Minimum characters for text input |
| `MAX_FAQS` | 10 | Maximum FAQs to generate |
| `MIN_SENTENCE_LENGTH` | 20 | Minimum sentence length to consider |
| `TOP_KEYWORDS` | 15 | Number of keywords to extract |
| `MAX_TOPICS` | 8 | Maximum topics to identify |

---

# FAQ Generation Algorithm

## Question Patterns Supported

| Pattern Type | Question Prefix | Example |
|--------------|-----------------|---------|
| Definition | "What is" | What is [Topic]? |
| Process | "How do" | How does [Topic] work? |
| Reason | "Why" | Why should I use [Topic]? |
| Features | "What features" | What features does [Topic] offer? |
| Requirements | "What are the requirements" | What are the requirements for [Topic]? |
| Customization | "Can I" | Can I customize [Topic]? |
| Location | "Where can I" | Where can I find more information about [Topic]? |

## Stop Words Filtered

The system filters out 80+ common English stop words including:
- Articles: a, an, the
- Prepositions: in, on, at, by, for, with
- Conjunctions: and, but, or, if
- Pronouns: I, you, he, she, it, they
- Common verbs: is, are, was, were, be, have, do

---

# UI Features

| Feature | Description |
|---------|-------------|
| Dark Theme | Modern deep space color scheme with gradient accents |
| Tab Navigation | Switch between text input and file upload |
| Drag & Drop | Intuitive file upload with visual feedback |
| Accordion FAQs | Expandable/collapsible FAQ items |
| Loading States | Animated spinner during processing |
| Toast Notifications | Success/error feedback messages |
| Copy to Clipboard | One-click copy all FAQs |
| Document History | View and manage previous documents |
| Responsive Design | Mobile and desktop optimized |
| Smooth Animations | CSS transitions and keyframe animations |

---

<div align="center">

## Thank You

**Smart FAQ Generator** - Transform Your Content into Intelligent FAQs

Built with ❤️ using Node.js & Modern Web Technologies

</div>

