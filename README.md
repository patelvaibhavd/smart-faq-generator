# 🧠 Smart FAQ Generator

A modern, AI-powered FAQ generator that automatically creates intelligent FAQs from your text content or uploaded documents.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

## ✨ Features

- **Text Input** — Paste any text content and generate relevant FAQs instantly
- **File Upload** — Support for PDF files (up to 10MB)
- **Smart Analysis** — Extracts keywords, identifies topics, and generates multiple FAQ types:
  - Definition-based FAQs (What is...?)
  - Process/How-to FAQs (How does...?)
  - Feature-based FAQs (What features...?)
  - Benefit FAQs (Why should I...?)
  - General topic FAQs
- **Document History** — View and manage previously processed documents
- **Copy to Clipboard** — Easily export your generated FAQs
- **Modern UI** — Beautiful dark theme with smooth animations and responsive design
- **Drag & Drop** — Intuitive file upload experience

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd smart-faq-generator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```

4. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
smart-faq-generator/
├── server.js           # Express server and API routes
├── faqGenerator.js     # Core FAQ generation logic
├── package.json        # Dependencies and scripts
├── public/             # Frontend assets
│   ├── index.html      # Main HTML page
│   ├── app.js          # Frontend JavaScript
│   └── styles.css      # Styles (dark theme)
└── uploads/            # Uploaded files storage
```

## 🔌 API Endpoints

| Method   | Endpoint                        | Description                     |
|----------|----------------------------------|---------------------------------|
| `GET`    | `/api/health`                   | Health check                    |
| `POST`   | `/api/upload`                   | Upload file and generate FAQs   |
| `POST`   | `/api/generate`                 | Generate FAQs from text input   |
| `GET`    | `/api/documents`                | List all documents              |
| `GET`    | `/api/documents/:id`            | Get specific document with FAQs |
| `DELETE` | `/api/documents/:id`            | Delete a document               |
| `POST`   | `/api/documents/:id/regenerate` | Regenerate FAQs for a document  |

### Example: Generate FAQs from Text

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Product",
    "text": "Your product description or documentation here..."
  }'
```

### Example: Upload a PDF File

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@./my-document.pdf"
```

## 🎨 UI Preview

The application features a modern dark theme with:
- Animated gradient backgrounds
- Smooth transitions and micro-interactions
- Accordion-style FAQ display
- Responsive design for mobile and desktop

## 🛠️ How It Works

1. **Text Extraction** — Parses input text into individual sentences
2. **Keyword Analysis** — Identifies the most frequent meaningful words (filtering stop words)
3. **Topic Identification** — Detects main topics from capitalized phrases and keywords
4. **FAQ Generation** — Creates questions based on:
   - Sentence patterns indicating definitions
   - Process indicators (step, guide, procedure, etc.)
   - Feature indicators (function, capability, support, etc.)
   - Benefit indicators (improve, save, efficient, etc.)
5. **Deduplication** — Removes duplicate questions and limits to top 10 FAQs

## 📝 Configuration

| Environment Variable | Default | Description           |
|---------------------|---------|------------------------|
| `PORT`              | `3000`  | Server port            |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ using Node.js & Modern Web Technologies
</p>

