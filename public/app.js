/**
 * Smart FAQ Generator - Frontend Application
 * Handles UI interactions and API communication
 */

// DOM Elements
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  
  // Text Input
  titleInput: document.getElementById('title-input'),
  textInput: document.getElementById('text-input'),
  charCounter: document.getElementById('char-counter'),
  generateBtn: document.getElementById('generate-btn'),
  
  // File Upload
  uploadZone: document.getElementById('upload-zone'),
  fileInput: document.getElementById('file-input'),
  selectedFile: document.getElementById('selected-file'),
  fileName: document.getElementById('file-name'),
  removeFileBtn: document.getElementById('remove-file'),
  uploadBtn: document.getElementById('upload-btn'),
  
  // Results
  resultsSection: document.getElementById('results-section'),
  resultsMeta: document.getElementById('results-meta'),
  faqList: document.getElementById('faq-list'),
  copyBtn: document.getElementById('copy-btn'),
  deleteBtn: document.getElementById('delete-btn'),
  
  // History
  historySection: document.getElementById('history-section'),
  historyList: document.getElementById('history-list'),
  refreshHistoryBtn: document.getElementById('refresh-history'),
  
  // Loading & Toast
  loadingOverlay: document.getElementById('loading-overlay'),
  toast: document.getElementById('toast')
};

// State
let currentDocumentId = null;
let selectedFile = null;

// API Base URL
const API_BASE = '/api';

/**
 * Initialize the application
 */
function init() {
  setupEventListeners();
  loadDocumentHistory();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Tab switching
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Text input
  elements.textInput.addEventListener('input', updateCharCounter);
  elements.generateBtn.addEventListener('click', generateFromText);

  // File upload
  elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
  elements.uploadZone.addEventListener('dragover', handleDragOver);
  elements.uploadZone.addEventListener('dragleave', handleDragLeave);
  elements.uploadZone.addEventListener('drop', handleDrop);
  elements.fileInput.addEventListener('change', handleFileSelect);
  elements.removeFileBtn.addEventListener('click', removeSelectedFile);
  elements.uploadBtn.addEventListener('click', uploadFile);

  // Results actions
  elements.copyBtn.addEventListener('click', copyFAQs);
  elements.deleteBtn.addEventListener('click', deleteCurrentDocument);

  // History
  elements.refreshHistoryBtn.addEventListener('click', loadDocumentHistory);
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  elements.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  elements.tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

/**
 * Update character counter
 */
function updateCharCounter() {
  const count = elements.textInput.value.length;
  elements.charCounter.textContent = count.toLocaleString();
}

/**
 * Generate FAQs from text input
 */
async function generateFromText() {
  const text = elements.textInput.value.trim();
  const title = elements.titleInput.value.trim();

  if (text.length < 50) {
    showToast('Please enter at least 50 characters', 'error');
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, title })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate FAQs');
    }

    currentDocumentId = data.document.id;
    displayResults(data);
    showToast(data.message, 'success');
    loadDocumentHistory();
  } catch (error) {
    console.error('Generation error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
  e.preventDefault();
  elements.uploadZone.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
  e.preventDefault();
  elements.uploadZone.classList.remove('drag-over');
}

/**
 * Handle file drop
 */
function handleDrop(e) {
  e.preventDefault();
  elements.uploadZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    selectFile(files[0]);
  }
}

/**
 * Handle file select from input
 */
function handleFileSelect(e) {
  if (e.target.files.length > 0) {
    selectFile(e.target.files[0]);
  }
}

/**
 * Select a file for upload
 */
function selectFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (ext !== '.pdf') {
    showToast('Only PDF files are supported', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit', 'error');
    return;
  }

  selectedFile = file;
  elements.fileName.textContent = file.name;
  elements.uploadZone.style.display = 'none';
  elements.selectedFile.style.display = 'flex';
  elements.uploadBtn.disabled = false;
}

/**
 * Remove selected file
 */
function removeSelectedFile(e) {
  e.stopPropagation();
  selectedFile = null;
  elements.fileInput.value = '';
  elements.uploadZone.style.display = 'block';
  elements.selectedFile.style.display = 'none';
  elements.uploadBtn.disabled = true;
}

/**
 * Upload file and generate FAQs
 */
async function uploadFile() {
  if (!selectedFile) {
    showToast('Please select a file first', 'error');
    return;
  }

  showLoading(true);

  const formData = new FormData();
  formData.append('file', selectedFile);

  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload file');
    }

    currentDocumentId = data.document.id;
    displayResults(data);
    showToast(data.message, 'success');
    loadDocumentHistory();

    // Reset file input
    removeSelectedFile({ stopPropagation: () => {} });
  } catch (error) {
    console.error('Upload error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Display FAQ results
 */
function displayResults(data) {
  elements.resultsSection.style.display = 'block';

  // Update meta information
  elements.resultsMeta.innerHTML = `
    <span>📄 ${data.document.title || data.document.filename}</span>
    <span>📝 ${data.document.wordCount.toLocaleString()} words</span>
    <span>❓ ${data.faqs.length} FAQs</span>
  `;

  // Render FAQs
  if (data.faqs.length === 0) {
    elements.faqList.innerHTML = `
      <div class="empty-state">
        <p>No FAQs could be generated. Try adding more detailed content.</p>
      </div>
    `;
    return;
  }

  elements.faqList.innerHTML = data.faqs.map((faq, index) => `
    <div class="faq-item" data-index="${index}">
      <div class="faq-question" onclick="toggleFAQ(${index})">
        <span class="faq-number">${index + 1}</span>
        <h3>${escapeHtml(faq.question)}</h3>
        <svg class="faq-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </div>
      <div class="faq-answer">
        <p>${escapeHtml(faq.answer)}</p>
      </div>
    </div>
  `).join('');

  // Auto-expand first FAQ
  const firstFaq = document.querySelector('.faq-item');
  if (firstFaq) {
    firstFaq.classList.add('open');
  }

  // Scroll to results
  elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Toggle FAQ item open/closed
 */
function toggleFAQ(index) {
  const faqItem = document.querySelector(`.faq-item[data-index="${index}"]`);
  if (faqItem) {
    faqItem.classList.toggle('open');
  }
}

// Make toggleFAQ available globally
window.toggleFAQ = toggleFAQ;

/**
 * Copy all FAQs to clipboard
 */
async function copyFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length === 0) {
    showToast('No FAQs to copy', 'error');
    return;
  }

  const faqText = Array.from(faqItems).map((item, index) => {
    const question = item.querySelector('h3').textContent;
    const answer = item.querySelector('.faq-answer p').textContent;
    return `Q${index + 1}: ${question}\nA: ${answer}`;
  }).join('\n\n');

  try {
    await navigator.clipboard.writeText(faqText);
    showToast('FAQs copied to clipboard!', 'success');
  } catch (error) {
    console.error('Copy error:', error);
    showToast('Failed to copy FAQs', 'error');
  }
}

/**
 * Delete current document
 */
async function deleteCurrentDocument() {
  if (!currentDocumentId) {
    showToast('No document selected', 'error');
    return;
  }

  if (!confirm('Are you sure you want to delete this document and its FAQs?')) {
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_BASE}/documents/${currentDocumentId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete document');
    }

    currentDocumentId = null;
    elements.resultsSection.style.display = 'none';
    showToast(data.message, 'success');
    loadDocumentHistory();
  } catch (error) {
    console.error('Delete error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Load document history
 */
async function loadDocumentHistory() {
  try {
    const response = await fetch(`${API_BASE}/documents`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load history');
    }

    renderHistory(data.documents);
  } catch (error) {
    console.error('History error:', error);
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <p>Failed to load document history</p>
      </div>
    `;
  }
}

/**
 * Render document history
 */
function renderHistory(documents) {
  if (documents.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </svg>
        <p>No documents yet. Upload content to get started!</p>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = documents.map(doc => `
    <div class="history-item" data-id="${doc.id}">
      <div class="history-info">
        <span class="history-title">${escapeHtml(doc.title)}</span>
        <div class="history-meta">
          <span>${formatDate(doc.uploadedAt)}</span>
          <span>${doc.faqCount} FAQs</span>
          <span>${doc.wordCount.toLocaleString()} words</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn btn-ghost" onclick="loadDocument('${doc.id}')" title="View FAQs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
        <button class="btn btn-ghost" onclick="deleteDocument('${doc.id}', event)" title="Delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Load a specific document
 */
async function loadDocument(id) {
  showLoading(true);

  try {
    const response = await fetch(`${API_BASE}/documents/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load document');
    }

    currentDocumentId = id;
    displayResults(data);
  } catch (error) {
    console.error('Load document error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// Make loadDocument available globally
window.loadDocument = loadDocument;

/**
 * Delete a specific document from history
 */
async function deleteDocument(id, event) {
  event.stopPropagation();

  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }

  showLoading(true);

  try {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete document');
    }

    // Hide results if this was the current document
    if (currentDocumentId === id) {
      currentDocumentId = null;
      elements.resultsSection.style.display = 'none';
    }

    showToast(data.message, 'success');
    loadDocumentHistory();
  } catch (error) {
    console.error('Delete error:', error);
    showToast(error.message, 'error');
  } finally {
    showLoading(false);
  }
}

// Make deleteDocument available globally
window.deleteDocument = deleteDocument;

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
  elements.loadingOverlay.classList.toggle('active', show);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toast = elements.toast;
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

