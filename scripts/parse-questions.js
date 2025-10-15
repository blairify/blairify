#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple question seeder that generates JSON from markdown
class InterviewQuestionSeeder {
  constructor() {
    this.questions = [];
  }
  
  parseMarkdownQuestions() {
    const markdownPath = path.join(__dirname, '../Interviewquestions.md');
    const content = fs.readFileSync(markdownPath, 'utf-8');
    
    // Split by language sections
    const sections = content.split(/^## (.+) Questions$/gm);
    
    for (let i = 1; i < sections.length; i += 2) {
      const language = sections[i].trim();
      const sectionContent = sections[i + 1];
      
      if (!sectionContent) continue;
      
      this.parseLanguageSection(language, sectionContent);
    }
  }
  
  parseLanguageSection(language, content) {
    // Split by question numbers (1., 2., etc.)
    const questionBlocks = content.split(/^\d+\.\s+/gm).filter(block => block.trim());
    
    questionBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      if (lines.length === 0) return;
      
      // Extract question text (first line with **)
      const questionMatch = lines[0].match(/\*\*(.+?)\*\*/);
      if (!questionMatch) return;
      
      const questionText = questionMatch[1];
      const answer = lines.slice(1).join('\n').trim().replace(/^-\s*/, '');
      
      // Generate question data
      const question = {
        id: `${this.normalizeLanguage(language)}_${String(index + 1).padStart(3, '0')}`,
        text: questionText,
        difficulty: this.determineDifficulty(questionText, answer),
        category: this.determineCategory(language, questionText),
        tags: this.generateTags(language, questionText, answer),
        type: 'technical',
        language: this.normalizeLanguage(language),
        timeLimit: this.determineTimeLimit(questionText, answer),
        points: this.determinePoints(questionText, answer),
        hints: this.extractHints(answer),
        examples: this.extractExamples(answer),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.questions.push(question);
    });
  }
  
  normalizeLanguage(language) {
    const mapping = {
      'React': 'react',
      'Python': 'python',
      'Java': 'java',
      'C#': 'csharp',
      'Swift': 'swift',
      'Rust': 'rust',
      'Go': 'go',
      'Kotlin': 'kotlin',
      'TypeScript': 'typescript',
      'Node.js': 'nodejs',
      'Next.js': 'nextjs',
      'NestJS': 'nestjs'
    };
    return mapping[language] || language.toLowerCase();
  }
  
  determineDifficulty(question, answer) {
    const complexityIndicators = {
      easy: ['what is', 'define', 'difference between', 'purpose of', 'how to'],
      medium: ['implement', 'create', 'design', 'optimize', 'manage', 'handle'],
      hard: ['advanced', 'complex', 'performance', 'scale', 'architecture', 'system']
    };
    
    const text = (question + ' ' + answer).toLowerCase();
    
    let easyScore = 0;
    let mediumScore = 0;
    let hardScore = 0;
    
    complexityIndicators.easy.forEach(indicator => {
      if (text.includes(indicator)) easyScore++;
    });
    
    complexityIndicators.medium.forEach(indicator => {
      if (text.includes(indicator)) mediumScore++;
    });
    
    complexityIndicators.hard.forEach(indicator => {
      if (text.includes(indicator)) hardScore++;
    });
    
    if (hardScore >= mediumScore && hardScore >= easyScore) return 'hard';
    if (mediumScore >= easyScore) return 'medium';
    return 'easy';
  }
  
  determineCategory(language, question) {
    const categories = {
      'Core Concepts': ['what is', 'define', 'purpose', 'difference'],
      'Data Structures': ['array', 'list', 'map', 'set', 'collection', 'tree', 'hash'],
      'Memory Management': ['memory', 'garbage', 'reference', 'pointer', 'allocation'],
      'Concurrency': ['thread', 'async', 'concurrent', 'parallel', 'sync', 'lock'],
      'Object-Oriented': ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation'],
      'Functional Programming': ['closure', 'lambda', 'higher-order', 'immutable'],
      'Error Handling': ['exception', 'error', 'try', 'catch', 'throw'],
      'Performance': ['optimization', 'performance', 'efficiency', 'speed'],
      'Testing': ['test', 'mock', 'unit', 'integration'],
      'Framework Specific': ['component', 'state', 'props', 'lifecycle', 'hook']
    };
    
    const questionLower = question.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => questionLower.includes(keyword))) {
        return category;
      }
    }
    
    // Language-specific categories
    if (language.toLowerCase().includes('react')) return 'React Concepts';
    if (language.toLowerCase().includes('node')) return 'Node.js Concepts';
    if (language.toLowerCase().includes('next')) return 'Next.js Concepts';
    
    return 'General Concepts';
  }
  
  generateTags(language, question, answer) {
    const text = (question + ' ' + answer).toLowerCase();
    const tags = [];
    
    // Language tag
    tags.push(this.normalizeLanguage(language));
    
    // Common technical tags
    const tagKeywords = {
      'algorithms': ['algorithm', 'sort', 'search', 'traverse'],
      'data-structures': ['array', 'list', 'map', 'set', 'tree', 'graph'],
      'async': ['async', 'await', 'promise', 'callback', 'concurrent'],
      'memory': ['memory', 'garbage', 'leak', 'allocation'],
      'performance': ['performance', 'optimize', 'speed', 'efficient'],
      'security': ['security', 'safe', 'protection', 'validation'],
      'testing': ['test', 'mock', 'unit', 'integration'],
      'design-patterns': ['pattern', 'singleton', 'factory', 'observer'],
      'best-practices': ['best', 'practice', 'convention', 'standard']
    };
    
    for (const [tag, keywords] of Object.entries(tagKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }
    
    // Specific framework/library tags
    if (text.includes('react')) tags.push('react', 'jsx', 'component');
    if (text.includes('state')) tags.push('state-management');
    if (text.includes('hook')) tags.push('hooks');
    if (text.includes('closure')) tags.push('closures');
    if (text.includes('generic')) tags.push('generics');
    if (text.includes('interface')) tags.push('interfaces');
    if (text.includes('inherit')) tags.push('inheritance');
    
    return [...new Set(tags)]; // Remove duplicates
  }
  
  determineTimeLimit(question, answer) {
    const text = (question + ' ' + answer).toLowerCase();
    
    // Complex topics need more time
    if (text.includes('implement') || text.includes('design') || text.includes('system')) {
      return 15;
    }
    
    // Simple definitions
    if (text.includes('what is') || text.includes('define')) {
      return 5;
    }
    
    // Default medium time
    return 8;
  }
  
  determinePoints(question, answer) {
    const difficulty = this.determineDifficulty(question, answer);
    
    switch (difficulty) {
      case 'easy': return 5;
      case 'medium': return 10;
      case 'hard': return 15;
      default: return 8;
    }
  }
  
  extractHints(answer) {
    const hints = [];
    
    // Extract common hint patterns
    const sentences = answer.split('. ');
    
    sentences.forEach(sentence => {
      if (sentence.length > 20 && sentence.length < 100) {
        if (sentence.includes('use') || sentence.includes('consider') || sentence.includes('remember')) {
          hints.push(sentence.trim() + (sentence.endsWith('.') ? '' : '.'));
        }
      }
    });
    
    // Add generic hints based on content
    if (answer.toLowerCase().includes('performance')) {
      hints.push('Consider performance implications');
    }
    if (answer.toLowerCase().includes('memory')) {
      hints.push('Think about memory management');
    }
    if (answer.toLowerCase().includes('thread')) {
      hints.push('Consider thread safety');
    }
    
    return hints.slice(0, 3); // Limit to 3 hints
  }
  
  extractExamples(answer) {
    const examples = [];
    
    // Look for code snippets or example patterns
    const codeBlocks = answer.match(/`[^`]+`/g);
    if (codeBlocks) {
      examples.push(...codeBlocks.map(code => code.replace(/`/g, '')));
    }
    
    // Look for example patterns
    const examplePatterns = answer.match(/example[s]?:?\s*([^.]+)/gi);
    if (examplePatterns) {
      examples.push(...examplePatterns.map(ex => ex.replace(/example[s]?:?\s*/i, '')));
    }
    
    return examples.slice(0, 2); // Limit to 2 examples
  }
  
  saveToJSON() {
    const outputPath = path.join(__dirname, '../src/data/questions/interview-questions.json');
    
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(this.questions, null, 2));
    console.log(`✅ Saved ${this.questions.length} questions to ${outputPath}`);
  }
  
  generateSummary() {
    const summary = {
      total: this.questions.length,
      byLanguage: {},
      byDifficulty: { easy: 0, medium: 0, hard: 0 },
      byCategory: {}
    };
    
    this.questions.forEach(q => {
      // By language
      summary.byLanguage[q.language || 'unknown'] = (summary.byLanguage[q.language || 'unknown'] || 0) + 1;
      
      // By difficulty
      summary.byDifficulty[q.difficulty]++;
      
      // By category
      summary.byCategory[q.category] = (summary.byCategory[q.category] || 0) + 1;
    });
    
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`Total Questions: ${summary.total}`);
    
    console.log('\nBy Language:');
    Object.entries(summary.byLanguage).forEach(([lang, count]) => {
      console.log(`  ${lang}: ${count}`);
    });
    
    console.log('\nBy Difficulty:');
    Object.entries(summary.byDifficulty).forEach(([diff, count]) => {
      console.log(`  ${diff}: ${count}`);
    });
    
    console.log('\nBy Category:');
    Object.entries(summary.byCategory).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
  }
  
  run() {
    console.log('🌱 Starting Interview Questions Parsing...\n');
    
    // Parse questions from markdown
    this.parseMarkdownQuestions();
    
    // Generate summary
    this.generateSummary();
    
    // Save to JSON
    this.saveToJSON();
    
    console.log('\n🎉 Parsing completed successfully!');
    console.log('Next steps:');
    console.log('1. Review the generated questions in src/data/questions/interview-questions.json');
    console.log('2. Run the Firestore seeder to upload to database');
  }
}

// Run the seeder
const seeder = new InterviewQuestionSeeder();
seeder.run();