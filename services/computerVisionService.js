const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

/**
 * Computer Vision Service for Document Processing and Image Analysis
 * Provides OCR, document classification, damage detection, and quality control
 */

class ComputerVisionService {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'pdf', 'tiff'];
    this.documentTypes = {
      'bill_of_lading': {
        keywords: ['bill of lading', 'b/l', 'shipper', 'consignee', 'vessel'],
        confidence: 0.8
      },
      'commercial_invoice': {
        keywords: ['commercial invoice', 'invoice', 'total amount', 'payment terms'],
        confidence: 0.8
      },
      'packing_list': {
        keywords: ['packing list', 'package', 'quantity', 'weight', 'dimensions'],
        confidence: 0.7
      },
      'customs_declaration': {
        keywords: ['customs', 'declaration', 'tariff', 'duty', 'import', 'export'],
        confidence: 0.8
      },
      'delivery_receipt': {
        keywords: ['delivery', 'receipt', 'received', 'signature', 'date delivered'],
        confidence: 0.7
      },
      'damage_report': {
        keywords: ['damage', 'broken', 'defect', 'condition', 'inspection'],
        confidence: 0.8
      }
    };
  }

  /**
   * Process uploaded document
   */
  async processDocument(filePath, documentType = null) {
    try {
      const fileExtension = path.extname(filePath).toLowerCase().slice(1);
      
      if (!this.supportedFormats.includes(fileExtension)) {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Preprocess image
      const processedImagePath = await this.preprocessImage(filePath);
      
      // Extract text using OCR
      const extractedText = await this.performOCR(processedImagePath);
      
      // Classify document if type not provided
      const classification = documentType || await this.classifyDocument(extractedText);
      
      // Extract structured data based on document type
      const structuredData = await this.extractStructuredData(extractedText, classification);
      
      // Validate extracted data
      const validation = await this.validateExtractedData(structuredData, classification);
      
      // Clean up processed image
      await this.cleanup(processedImagePath);

      return {
        success: true,
        documentType: classification,
        extractedText,
        structuredData,
        validation,
        confidence: validation.overallConfidence,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Document processing error:', error);
      throw error;
    }
  }

  /**
   * Analyze cargo images for damage detection
   */
  async analyzeCargo(imagePath, cargoType = 'general') {
    try {
      // Preprocess image for analysis
      const processedImage = await this.preprocessForAnalysis(imagePath);
      
      // Detect damage indicators
      const damageAnalysis = await this.detectDamage(processedImage, cargoType);
      
      // Analyze packaging condition
      const packagingAnalysis = await this.analyzePackaging(processedImage);
      
      // Quality assessment
      const qualityScore = await this.assessQuality(processedImage, cargoType);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(damageAnalysis, packagingAnalysis, qualityScore);

      return {
        success: true,
        cargoType,
        damageAnalysis,
        packagingAnalysis,
        qualityScore,
        recommendations,
        analyzedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Cargo analysis error:', error);
      throw error;
    }
  }

  /**
   * Extract text from QR codes and barcodes
   */
  async extractCodes(imagePath) {
    try {
      // Preprocess image for code detection
      const processedImage = await this.preprocessForCodes(imagePath);
      
      // Detect and decode QR codes
      const qrCodes = await this.detectQRCodes(processedImage);
      
      // Detect and decode barcodes
      const barcodes = await this.detectBarcodes(processedImage);
      
      return {
        success: true,
        qrCodes,
        barcodes,
        totalCodes: qrCodes.length + barcodes.length,
        extractedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Code extraction error:', error);
      throw error;
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(inputPath) {
    const outputPath = inputPath.replace(/\.[^/.]+$/, '_processed.jpg');
    
    await sharp(inputPath)
      .resize(2000, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .normalize()
      .sharpen()
      .greyscale()
      .threshold(128)
      .jpeg({ quality: 95 })
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Perform OCR on processed image
   */
  async performOCR(imagePath) {
    // Simulated OCR - in production, integrate with Tesseract.js or cloud OCR
    try {
      // This would be replaced with actual OCR implementation
      const mockOCRResults = {
        'bill_of_lading': `
          BILL OF LADING
          Shipper: ABC Logistics Inc.
          Consignee: XYZ Manufacturing Ltd.
          Vessel: CARGO STAR
          Port of Loading: Los Angeles
          Port of Discharge: Shanghai
          Container No: ABCD1234567
          Seal No: 12345
          Gross Weight: 15,000 KG
          Measurement: 25 CBM
        `,
        'commercial_invoice': `
          COMMERCIAL INVOICE
          Invoice No: INV-2024-001
          Date: ${new Date().toLocaleDateString()}
          Seller: Global Trade Corp
          Buyer: International Imports LLC
          Total Amount: $25,000.00
          Payment Terms: 30 Days Net
          Incoterms: FOB
        `,
        'default': `
          Document contains text that requires processing.
          Various fields and data points detected.
          Quality: Good
          Confidence: High
        `
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockOCRResults.default;

    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  /**
   * Classify document type based on extracted text
   */
  async classifyDocument(text) {
    const textLower = text.toLowerCase();
    let bestMatch = 'unknown';
    let highestScore = 0;

    for (const [docType, config] of Object.entries(this.documentTypes)) {
      let score = 0;
      let matchedKeywords = 0;

      for (const keyword of config.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          matchedKeywords++;
          score += 1 / config.keywords.length;
        }
      }

      // Boost score if multiple keywords match
      if (matchedKeywords > 1) {
        score *= 1.2;
      }

      if (score > highestScore && score >= config.confidence) {
        highestScore = score;
        bestMatch = docType;
      }
    }

    return {
      type: bestMatch,
      confidence: highestScore,
      alternativeTypes: this.getAlternativeTypes(text)
    };
  }

  /**
   * Extract structured data based on document type
   */
  async extractStructuredData(text, classification) {
    const docType = classification.type || classification;
    
    switch (docType) {
      case 'bill_of_lading':
        return this.extractBillOfLadingData(text);
      case 'commercial_invoice':
        return this.extractInvoiceData(text);
      case 'packing_list':
        return this.extractPackingListData(text);
      case 'customs_declaration':
        return this.extractCustomsData(text);
      case 'delivery_receipt':
        return this.extractDeliveryReceiptData(text);
      default:
        return this.extractGenericData(text);
    }
  }

  /**
   * Extract Bill of Lading specific data
   */
  extractBillOfLadingData(text) {
    const data = {
      shipper: this.extractField(text, ['shipper', 'from']),
      consignee: this.extractField(text, ['consignee', 'to', 'receiver']),
      vessel: this.extractField(text, ['vessel', 'ship']),
      voyage: this.extractField(text, ['voyage', 'trip']),
      portOfLoading: this.extractField(text, ['port of loading', 'loading port']),
      portOfDischarge: this.extractField(text, ['port of discharge', 'discharge port']),
      containerNumber: this.extractField(text, ['container', 'container no']),
      sealNumber: this.extractField(text, ['seal', 'seal no']),
      grossWeight: this.extractField(text, ['gross weight', 'weight']),
      measurement: this.extractField(text, ['measurement', 'volume', 'cbm']),
      freightTerms: this.extractField(text, ['freight', 'prepaid', 'collect'])
    };

    return data;
  }

  /**
   * Extract Commercial Invoice data
   */
  extractInvoiceData(text) {
    const data = {
      invoiceNumber: this.extractField(text, ['invoice no', 'invoice number']),
      date: this.extractField(text, ['date', 'invoice date']),
      seller: this.extractField(text, ['seller', 'vendor', 'from']),
      buyer: this.extractField(text, ['buyer', 'purchaser', 'to']),
      totalAmount: this.extractField(text, ['total', 'amount', 'sum']),
      currency: this.extractField(text, ['usd', 'eur', 'currency']),
      paymentTerms: this.extractField(text, ['payment terms', 'terms']),
      incoterms: this.extractField(text, ['incoterms', 'fob', 'cif', 'exw'])
    };

    return data;
  }

  /**
   * Detect damage in cargo images
   */
  async detectDamage(imagePath, cargoType) {
    // Simulated damage detection - in production, use ML models
    const damageIndicators = {
      scratches: Math.random() > 0.8,
      dents: Math.random() > 0.9,
      waterDamage: Math.random() > 0.95,
      packaging: Math.random() > 0.7,
      labels: Math.random() > 0.85
    };

    const severity = this.calculateDamageSeverity(damageIndicators);
    
    return {
      detected: Object.values(damageIndicators).some(Boolean),
      indicators: damageIndicators,
      severity,
      confidence: 0.85,
      recommendations: this.getDamageRecommendations(damageIndicators, severity)
    };
  }

  /**
   * Analyze packaging condition
   */
  async analyzePackaging(imagePath) {
    return {
      condition: 'good', // 'excellent', 'good', 'fair', 'poor'
      integrity: 0.9,
      labelsReadable: true,
      sealIntact: true,
      recommendations: []
    };
  }

  /**
   * Assess overall quality
   */
  async assessQuality(imagePath, cargoType) {
    return {
      overall: 0.85,
      visual: 0.9,
      packaging: 0.8,
      documentation: 0.85,
      grade: 'A' // A, B, C, D
    };
  }

  // Helper methods
  extractField(text, keywords) {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]*([^\\n\\r]+)`, 'i');
      const match = text.match(regex);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  getAlternativeTypes(text) {
    const alternatives = [];
    const textLower = text.toLowerCase();

    for (const [docType, config] of Object.entries(this.documentTypes)) {
      let score = 0;
      for (const keyword of config.keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          score += 1 / config.keywords.length;
        }
      }
      if (score > 0.3) {
        alternatives.push({ type: docType, confidence: score });
      }
    }

    return alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  async validateExtractedData(data, classification) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      completeness: 0,
      overallConfidence: 0.8
    };

    const fields = Object.keys(data);
    const filledFields = fields.filter(field => data[field] !== null && data[field] !== '');
    
    validation.completeness = filledFields.length / fields.length;
    
    if (validation.completeness < 0.5) {
      validation.warnings.push('Low data completeness - manual review recommended');
    }

    return validation;
  }

  calculateDamageSeverity(indicators) {
    const weights = {
      scratches: 0.2,
      dents: 0.3,
      waterDamage: 0.4,
      packaging: 0.3,
      labels: 0.1
    };

    let severity = 0;
    for (const [indicator, detected] of Object.entries(indicators)) {
      if (detected) {
        severity += weights[indicator] || 0.1;
      }
    }

    if (severity === 0) return 'none';
    if (severity < 0.3) return 'minor';
    if (severity < 0.6) return 'moderate';
    return 'severe';
  }

  getDamageRecommendations(indicators, severity) {
    const recommendations = [];
    
    if (indicators.waterDamage) {
      recommendations.push('Immediate inspection required - water damage detected');
    }
    if (indicators.packaging) {
      recommendations.push('Repackaging may be necessary');
    }
    if (severity === 'severe') {
      recommendations.push('Consider insurance claim documentation');
    }

    return recommendations;
  }

  generateRecommendations(damageAnalysis, packagingAnalysis, qualityScore) {
    const recommendations = [];
    
    if (damageAnalysis.detected) {
      recommendations.push(...damageAnalysis.recommendations);
    }
    
    if (packagingAnalysis.condition === 'poor') {
      recommendations.push('Immediate repackaging required');
    }
    
    if (qualityScore.overall < 0.7) {
      recommendations.push('Quality inspection recommended');
    }

    return recommendations;
  }

  async cleanup(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  // Placeholder methods for additional functionality
  async preprocessForAnalysis(imagePath) { return imagePath; }
  async preprocessForCodes(imagePath) { return imagePath; }
  async detectQRCodes(imagePath) { return []; }
  async detectBarcodes(imagePath) { return []; }
  extractPackingListData(text) { return {}; }
  extractCustomsData(text) { return {}; }
  extractDeliveryReceiptData(text) { return {}; }
  extractGenericData(text) { return { content: text }; }
}

// Create singleton instance
const computerVisionService = new ComputerVisionService();

module.exports = computerVisionService;
