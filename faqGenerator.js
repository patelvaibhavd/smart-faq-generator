/**
 * Smart FAQ Generator Module
 * Analyzes text content and generates relevant FAQs
 */

class FAQGenerator {
  constructor() {
    // Common question patterns
    this.questionPatterns = [
      { pattern: /what is|what are|what's/i, prefix: "What is" },
      { pattern: /how to|how do|how does|how can/i, prefix: "How do" },
      { pattern: /why is|why do|why does|why are/i, prefix: "Why" },
      { pattern: /when is|when do|when does|when should/i, prefix: "When" },
      { pattern: /where is|where do|where can/i, prefix: "Where" },
      { pattern: /who is|who can|who does/i, prefix: "Who" },
      { pattern: /can i|can you|can we/i, prefix: "Can I" },
      { pattern: /is it|is there|are there/i, prefix: "Is there" }
    ];

    // Stop words to filter out
    this.stopWords = new Set([
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
      'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
      'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
      'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
      'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'me',
      'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
      'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who'
    ]);
  }

  /**
   * Generate FAQs from text content
   * @param {string} text - The input text to analyze
   * @returns {Array} Array of FAQ objects with question and answer
   */
  generateFAQs(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return [];
    }

    const sentences = this.extractSentences(text);
    const keywords = this.extractKeywords(text);
    const topics = this.identifyTopics(text, keywords);
    
    const faqs = [];

    // Generate definition-based FAQs
    const definitionFAQs = this.generateDefinitionFAQs(sentences, topics);
    faqs.push(...definitionFAQs);

    // Generate process/how-to FAQs
    const processFAQs = this.generateProcessFAQs(sentences, topics);
    faqs.push(...processFAQs);

    // Generate feature-based FAQs
    const featureFAQs = this.generateFeatureFAQs(sentences, topics);
    faqs.push(...featureFAQs);

    // Generate benefit/why FAQs
    const benefitFAQs = this.generateBenefitFAQs(sentences, topics);
    faqs.push(...benefitFAQs);

    // Generate general topic FAQs
    const topicFAQs = this.generateTopicFAQs(sentences, topics);
    faqs.push(...topicFAQs);

    // Remove duplicates and limit results
    const uniqueFAQs = this.removeDuplicates(faqs);
    
    return uniqueFAQs.slice(0, 10); // Return top 10 FAQs
  }

  /**
   * Extract sentences from text
   */
  extractSentences(text) {
    return text
      .replace(/\n+/g, ' ')
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  /**
   * Extract keywords from text
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word));

    // Count word frequency
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => entry[0]);
  }

  /**
   * Identify main topics from text
   */
  identifyTopics(text, keywords) {
    const topics = [];
    
    // Look for capitalized phrases (potential proper nouns/topics)
    const capitalizedPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
    const matches = text.match(capitalizedPattern) || [];
    
    matches.forEach(match => {
      if (match.length > 3 && !topics.includes(match.toLowerCase())) {
        topics.push(match);
      }
    });

    // Add top keywords as topics
    keywords.slice(0, 5).forEach(keyword => {
      if (!topics.some(t => t.toLowerCase() === keyword)) {
        topics.push(keyword);
      }
    });

    return topics.slice(0, 8);
  }

  /**
   * Generate definition-based FAQs (What is...?)
   */
  generateDefinitionFAQs(sentences, topics) {
    const faqs = [];
    
    topics.slice(0, 3).forEach(topic => {
      const relevantSentence = sentences.find(s => 
        s.toLowerCase().includes(topic.toLowerCase())
      );
      
      if (relevantSentence) {
        faqs.push({
          question: `What is ${topic}?`,
          answer: this.cleanAnswer(relevantSentence)
        });
      }
    });

    return faqs;
  }

  /**
   * Generate process/how-to FAQs
   */
  generateProcessFAQs(sentences, topics) {
    const faqs = [];
    const processIndicators = ['step', 'process', 'method', 'way', 'approach', 'procedure', 'guide', 'tutorial', 'instruction'];
    
    sentences.forEach(sentence => {
      const hasProcessIndicator = processIndicators.some(ind => 
        sentence.toLowerCase().includes(ind)
      );
      
      if (hasProcessIndicator) {
        const topic = topics.find(t => sentence.toLowerCase().includes(t.toLowerCase()));
        if (topic) {
          faqs.push({
            question: `How does ${topic} work?`,
            answer: this.cleanAnswer(sentence)
          });
        }
      }
    });

    // Look for numbered steps or bullet points
    const stepPattern = /\b(first|second|third|then|next|finally|step \d+)\b/i;
    const stepSentences = sentences.filter(s => stepPattern.test(s));
    
    if (stepSentences.length > 0 && topics.length > 0) {
      faqs.push({
        question: `How do I get started with ${topics[0]}?`,
        answer: this.cleanAnswer(stepSentences.slice(0, 3).join('. '))
      });
    }

    return faqs.slice(0, 2);
  }

  /**
   * Generate feature-based FAQs
   */
  generateFeatureFAQs(sentences, topics) {
    const faqs = [];
    const featureIndicators = ['feature', 'capability', 'function', 'option', 'include', 'provide', 'offer', 'support', 'enable', 'allow'];
    
    const featureSentences = sentences.filter(sentence =>
      featureIndicators.some(ind => sentence.toLowerCase().includes(ind))
    );

    if (featureSentences.length > 0 && topics.length > 0) {
      faqs.push({
        question: `What features does ${topics[0]} offer?`,
        answer: this.cleanAnswer(featureSentences.slice(0, 2).join('. '))
      });
    }

    return faqs;
  }

  /**
   * Generate benefit/why FAQs
   */
  generateBenefitFAQs(sentences, topics) {
    const faqs = [];
    const benefitIndicators = ['benefit', 'advantage', 'improve', 'help', 'save', 'increase', 'reduce', 'better', 'efficient', 'effective'];
    
    const benefitSentences = sentences.filter(sentence =>
      benefitIndicators.some(ind => sentence.toLowerCase().includes(ind))
    );

    if (benefitSentences.length > 0 && topics.length > 0) {
      faqs.push({
        question: `Why should I use ${topics[0]}?`,
        answer: this.cleanAnswer(benefitSentences.slice(0, 2).join('. '))
      });
    }

    return faqs;
  }

  /**
   * Generate general topic-based FAQs
   */
  generateTopicFAQs(sentences, topics) {
    const faqs = [];
    
    // Generate "Can I..." questions
    const canIndicators = ['can', 'able', 'possible', 'support', 'allow'];
    const canSentences = sentences.filter(sentence =>
      canIndicators.some(ind => sentence.toLowerCase().includes(ind))
    );

    if (canSentences.length > 0 && topics.length > 1) {
      faqs.push({
        question: `Can I customize ${topics[1] || topics[0]}?`,
        answer: this.cleanAnswer(canSentences[0])
      });
    }

    // Generate requirement questions
    const requireIndicators = ['require', 'need', 'must', 'necessary', 'prerequisite'];
    const requireSentences = sentences.filter(sentence =>
      requireIndicators.some(ind => sentence.toLowerCase().includes(ind))
    );

    if (requireSentences.length > 0) {
      faqs.push({
        question: `What are the requirements for ${topics[0]}?`,
        answer: this.cleanAnswer(requireSentences[0])
      });
    }

    // Generate "Where can I..." questions
    const locationSentences = sentences.filter(sentence =>
      /\b(find|locate|access|available|download)\b/i.test(sentence)
    );

    if (locationSentences.length > 0 && topics.length > 0) {
      faqs.push({
        question: `Where can I find more information about ${topics[0]}?`,
        answer: this.cleanAnswer(locationSentences[0])
      });
    }

    return faqs.slice(0, 3);
  }

  /**
   * Clean and format answer text
   */
  cleanAnswer(text) {
    if (!text) return '';
    
    let cleaned = text
      .replace(/\s+/g, ' ')
      .trim();
    
    // Ensure proper capitalization
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
    
    // Ensure ends with period
    if (cleaned && !cleaned.match(/[.!?]$/)) {
      cleaned += '.';
    }
    
    return cleaned;
  }

  /**
   * Remove duplicate FAQs based on question similarity
   */
  removeDuplicates(faqs) {
    const seen = new Set();
    return faqs.filter(faq => {
      const normalized = faq.question.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }
}

module.exports = FAQGenerator;

