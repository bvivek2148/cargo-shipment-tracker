/**
 * Localization Service for Multi-language and Currency Support
 * Provides translation, currency conversion, and regional formatting
 */

class LocalizationService {
  constructor() {
    this.supportedLanguages = {
      'en': { name: 'English', nativeName: 'English', rtl: false },
      'es': { name: 'Spanish', nativeName: 'Español', rtl: false },
      'fr': { name: 'French', nativeName: 'Français', rtl: false },
      'de': { name: 'German', nativeName: 'Deutsch', rtl: false },
      'it': { name: 'Italian', nativeName: 'Italiano', rtl: false },
      'pt': { name: 'Portuguese', nativeName: 'Português', rtl: false },
      'ru': { name: 'Russian', nativeName: 'Русский', rtl: false },
      'zh': { name: 'Chinese', nativeName: '中文', rtl: false },
      'ja': { name: 'Japanese', nativeName: '日本語', rtl: false },
      'ko': { name: 'Korean', nativeName: '한국어', rtl: false },
      'ar': { name: 'Arabic', nativeName: 'العربية', rtl: true },
      'hi': { name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
      'th': { name: 'Thai', nativeName: 'ไทย', rtl: false },
      'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', rtl: false },
      'nl': { name: 'Dutch', nativeName: 'Nederlands', rtl: false },
      'sv': { name: 'Swedish', nativeName: 'Svenska', rtl: false },
      'da': { name: 'Danish', nativeName: 'Dansk', rtl: false },
      'no': { name: 'Norwegian', nativeName: 'Norsk', rtl: false },
      'fi': { name: 'Finnish', nativeName: 'Suomi', rtl: false },
      'pl': { name: 'Polish', nativeName: 'Polski', rtl: false }
    };

    this.supportedCurrencies = {
      'USD': { name: 'US Dollar', symbol: '$', decimals: 2 },
      'EUR': { name: 'Euro', symbol: '€', decimals: 2 },
      'GBP': { name: 'British Pound', symbol: '£', decimals: 2 },
      'JPY': { name: 'Japanese Yen', symbol: '¥', decimals: 0 },
      'CNY': { name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
      'KRW': { name: 'South Korean Won', symbol: '₩', decimals: 0 },
      'INR': { name: 'Indian Rupee', symbol: '₹', decimals: 2 },
      'AUD': { name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
      'CAD': { name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
      'CHF': { name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
      'SEK': { name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
      'NOK': { name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
      'DKK': { name: 'Danish Krone', symbol: 'kr', decimals: 2 },
      'PLN': { name: 'Polish Zloty', symbol: 'zł', decimals: 2 },
      'RUB': { name: 'Russian Ruble', symbol: '₽', decimals: 2 },
      'BRL': { name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
      'MXN': { name: 'Mexican Peso', symbol: '$', decimals: 2 },
      'SGD': { name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
      'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
      'THB': { name: 'Thai Baht', symbol: '฿', decimals: 2 }
    };

    this.exchangeRates = new Map();
    this.translations = new Map();
    this.lastRateUpdate = null;
    this.rateUpdateInterval = 3600000; // 1 hour

    // Initialize with base translations
    this.initializeTranslations();
    
    // Load exchange rates
    this.updateExchangeRates();
  }

  /**
   * Get translation for a key in specified language
   */
  translate(key, language = 'en', params = {}) {
    const langTranslations = this.translations.get(language) || this.translations.get('en');
    let translation = langTranslations?.[key] || key;

    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });

    return translation;
  }

  /**
   * Get multiple translations
   */
  translateBatch(keys, language = 'en', params = {}) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.translate(key, language, params);
    });
    return result;
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    await this.ensureRatesUpdated();

    const fromRate = this.exchangeRates.get(fromCurrency) || 1;
    const toRate = this.exchangeRates.get(toCurrency) || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    const convertedAmount = usdAmount * toRate;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimals
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount, currency, language = 'en') {
    const currencyInfo = this.supportedCurrencies[currency];
    if (!currencyInfo) {
      return `${amount} ${currency}`;
    }

    try {
      return new Intl.NumberFormat(this.getLocaleCode(language), {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currencyInfo.decimals,
        maximumFractionDigits: currencyInfo.decimals
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.symbol}${amount.toFixed(currencyInfo.decimals)}`;
    }
  }

  /**
   * Format date for specific locale
   */
  formatDate(date, language = 'en', options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };

    try {
      return new Intl.DateTimeFormat(this.getLocaleCode(language), defaultOptions).format(new Date(date));
    } catch (error) {
      return new Date(date).toLocaleDateString();
    }
  }

  /**
   * Format number for specific locale
   */
  formatNumber(number, language = 'en', options = {}) {
    try {
      return new Intl.NumberFormat(this.getLocaleCode(language), options).format(number);
    } catch (error) {
      return number.toString();
    }
  }

  /**
   * Get user's preferred settings based on location/browser
   */
  detectUserPreferences(request) {
    const preferences = {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    };

    // Detect language from Accept-Language header
    const acceptLanguage = request.headers['accept-language'];
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      for (const lang of languages) {
        const langCode = lang.split('-')[0];
        if (this.supportedLanguages[langCode]) {
          preferences.language = langCode;
          break;
        }
      }
    }

    // Detect currency/region from IP or other headers
    const country = this.detectCountryFromIP(request.ip);
    if (country) {
      preferences.currency = this.getCurrencyForCountry(country);
      preferences.timezone = this.getTimezoneForCountry(country);
      preferences.dateFormat = this.getDateFormatForCountry(country);
    }

    return preferences;
  }

  /**
   * Get localized shipment status
   */
  getLocalizedShipmentStatus(status, language = 'en') {
    const statusTranslations = {
      'pending': this.translate('status.pending', language),
      'in-transit': this.translate('status.in_transit', language),
      'delivered': this.translate('status.delivered', language),
      'delayed': this.translate('status.delayed', language),
      'cancelled': this.translate('status.cancelled', language)
    };

    return statusTranslations[status] || status;
  }

  /**
   * Get localized error messages
   */
  getLocalizedError(errorCode, language = 'en', params = {}) {
    return this.translate(`error.${errorCode}`, language, params);
  }

  /**
   * Get regional shipping preferences
   */
  getRegionalPreferences(country) {
    const preferences = {
      'US': {
        units: 'imperial',
        weightUnit: 'lbs',
        distanceUnit: 'miles',
        temperatureUnit: 'fahrenheit',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      'GB': {
        units: 'mixed',
        weightUnit: 'kg',
        distanceUnit: 'miles',
        temperatureUnit: 'celsius',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      },
      'DE': {
        units: 'metric',
        weightUnit: 'kg',
        distanceUnit: 'km',
        temperatureUnit: 'celsius',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h'
      },
      'JP': {
        units: 'metric',
        weightUnit: 'kg',
        distanceUnit: 'km',
        temperatureUnit: 'celsius',
        dateFormat: 'YYYY/MM/DD',
        timeFormat: '24h'
      }
    };

    return preferences[country] || preferences['US'];
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates() {
    try {
      // In production, use a real exchange rate API like exchangerate-api.com
      const mockRates = {
        'USD': 1.0,
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110.0,
        'CNY': 6.45,
        'KRW': 1180.0,
        'INR': 74.5,
        'AUD': 1.35,
        'CAD': 1.25,
        'CHF': 0.92,
        'SEK': 8.6,
        'NOK': 8.8,
        'DKK': 6.4,
        'PLN': 3.9,
        'RUB': 73.5,
        'BRL': 5.2,
        'MXN': 20.1,
        'SGD': 1.35,
        'HKD': 7.8,
        'THB': 31.5
      };

      // Add some realistic fluctuation
      Object.keys(mockRates).forEach(currency => {
        if (currency !== 'USD') {
          const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
          mockRates[currency] *= (1 + fluctuation);
        }
      });

      this.exchangeRates.clear();
      Object.entries(mockRates).forEach(([currency, rate]) => {
        this.exchangeRates.set(currency, rate);
      });

      this.lastRateUpdate = Date.now();
      console.log('Exchange rates updated successfully');

    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  /**
   * Initialize base translations
   */
  initializeTranslations() {
    const baseTranslations = {
      en: {
        'status.pending': 'Pending',
        'status.in_transit': 'In Transit',
        'status.delivered': 'Delivered',
        'status.delayed': 'Delayed',
        'status.cancelled': 'Cancelled',
        'error.not_found': 'Item not found',
        'error.unauthorized': 'Unauthorized access',
        'error.validation_failed': 'Validation failed',
        'error.server_error': 'Server error occurred',
        'shipment.created': 'Shipment created successfully',
        'shipment.updated': 'Shipment updated successfully',
        'shipment.tracking': 'Track your shipment',
        'dashboard.welcome': 'Welcome to Cargo Tracker',
        'navigation.dashboard': 'Dashboard',
        'navigation.shipments': 'Shipments',
        'navigation.analytics': 'Analytics',
        'navigation.settings': 'Settings'
      },
      es: {
        'status.pending': 'Pendiente',
        'status.in_transit': 'En Tránsito',
        'status.delivered': 'Entregado',
        'status.delayed': 'Retrasado',
        'status.cancelled': 'Cancelado',
        'error.not_found': 'Elemento no encontrado',
        'error.unauthorized': 'Acceso no autorizado',
        'error.validation_failed': 'Validación fallida',
        'error.server_error': 'Error del servidor',
        'shipment.created': 'Envío creado exitosamente',
        'shipment.updated': 'Envío actualizado exitosamente',
        'shipment.tracking': 'Rastrea tu envío',
        'dashboard.welcome': 'Bienvenido a Cargo Tracker',
        'navigation.dashboard': 'Panel',
        'navigation.shipments': 'Envíos',
        'navigation.analytics': 'Analíticas',
        'navigation.settings': 'Configuración'
      },
      fr: {
        'status.pending': 'En Attente',
        'status.in_transit': 'En Transit',
        'status.delivered': 'Livré',
        'status.delayed': 'Retardé',
        'status.cancelled': 'Annulé',
        'error.not_found': 'Élément non trouvé',
        'error.unauthorized': 'Accès non autorisé',
        'error.validation_failed': 'Validation échouée',
        'error.server_error': 'Erreur serveur',
        'shipment.created': 'Expédition créée avec succès',
        'shipment.updated': 'Expédition mise à jour avec succès',
        'shipment.tracking': 'Suivez votre expédition',
        'dashboard.welcome': 'Bienvenue sur Cargo Tracker',
        'navigation.dashboard': 'Tableau de Bord',
        'navigation.shipments': 'Expéditions',
        'navigation.analytics': 'Analytiques',
        'navigation.settings': 'Paramètres'
      },
      de: {
        'status.pending': 'Ausstehend',
        'status.in_transit': 'Unterwegs',
        'status.delivered': 'Geliefert',
        'status.delayed': 'Verspätet',
        'status.cancelled': 'Storniert',
        'error.not_found': 'Element nicht gefunden',
        'error.unauthorized': 'Unbefugter Zugriff',
        'error.validation_failed': 'Validierung fehlgeschlagen',
        'error.server_error': 'Serverfehler',
        'shipment.created': 'Sendung erfolgreich erstellt',
        'shipment.updated': 'Sendung erfolgreich aktualisiert',
        'shipment.tracking': 'Verfolgen Sie Ihre Sendung',
        'dashboard.welcome': 'Willkommen bei Cargo Tracker',
        'navigation.dashboard': 'Dashboard',
        'navigation.shipments': 'Sendungen',
        'navigation.analytics': 'Analytik',
        'navigation.settings': 'Einstellungen'
      },
      zh: {
        'status.pending': '待处理',
        'status.in_transit': '运输中',
        'status.delivered': '已送达',
        'status.delayed': '延误',
        'status.cancelled': '已取消',
        'error.not_found': '未找到项目',
        'error.unauthorized': '未授权访问',
        'error.validation_failed': '验证失败',
        'error.server_error': '服务器错误',
        'shipment.created': '货运创建成功',
        'shipment.updated': '货运更新成功',
        'shipment.tracking': '跟踪您的货运',
        'dashboard.welcome': '欢迎使用货运跟踪器',
        'navigation.dashboard': '仪表板',
        'navigation.shipments': '货运',
        'navigation.analytics': '分析',
        'navigation.settings': '设置'
      }
    };

    Object.entries(baseTranslations).forEach(([lang, translations]) => {
      this.translations.set(lang, translations);
    });
  }

  // Helper methods
  async ensureRatesUpdated() {
    if (!this.lastRateUpdate || Date.now() - this.lastRateUpdate > this.rateUpdateInterval) {
      await this.updateExchangeRates();
    }
  }

  getLocaleCode(language) {
    const localeCodes = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'th': 'th-TH',
      'vi': 'vi-VN',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'da': 'da-DK',
      'no': 'no-NO',
      'fi': 'fi-FI',
      'pl': 'pl-PL'
    };

    return localeCodes[language] || 'en-US';
  }

  detectCountryFromIP(ip) {
    // In production, use a GeoIP service
    return 'US'; // Default fallback
  }

  getCurrencyForCountry(country) {
    const countryCurrencies = {
      'US': 'USD', 'CA': 'CAD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR',
      'IT': 'EUR', 'ES': 'EUR', 'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW',
      'IN': 'INR', 'AU': 'AUD', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK',
      'DK': 'DKK', 'PL': 'PLN', 'RU': 'RUB', 'BR': 'BRL', 'MX': 'MXN',
      'SG': 'SGD', 'HK': 'HKD', 'TH': 'THB'
    };

    return countryCurrencies[country] || 'USD';
  }

  getTimezoneForCountry(country) {
    const countryTimezones = {
      'US': 'America/New_York',
      'GB': 'Europe/London',
      'DE': 'Europe/Berlin',
      'JP': 'Asia/Tokyo',
      'CN': 'Asia/Shanghai',
      'AU': 'Australia/Sydney'
    };

    return countryTimezones[country] || 'UTC';
  }

  getDateFormatForCountry(country) {
    const countryDateFormats = {
      'US': 'MM/DD/YYYY',
      'GB': 'DD/MM/YYYY',
      'DE': 'DD.MM.YYYY',
      'JP': 'YYYY/MM/DD',
      'CN': 'YYYY-MM-DD'
    };

    return countryDateFormats[country] || 'MM/DD/YYYY';
  }
}

// Create singleton instance
const localizationService = new LocalizationService();

module.exports = localizationService;
