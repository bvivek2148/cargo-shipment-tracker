const crypto = require('crypto');

/**
 * Blockchain Service for Supply Chain Transparency
 * Provides immutable tracking, smart contracts, and verification
 */

class BlockchainService {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.difficulty = 2;
    this.smartContracts = new Map();
    this.validators = new Set();
    
    // Create genesis block
    this.createGenesisBlock();
  }

  createGenesisBlock() {
    const genesisBlock = new Block(0, Date.now(), [], '0');
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Record shipment event on blockchain
   */
  async recordShipmentEvent(shipmentId, eventType, data, organizationId) {
    try {
      const transaction = new ShipmentTransaction(
        shipmentId,
        eventType,
        data,
        organizationId,
        Date.now()
      );

      // Add digital signature
      transaction.signature = this.signTransaction(transaction);
      
      this.pendingTransactions.push(transaction);

      // Auto-mine if enough transactions
      if (this.pendingTransactions.length >= 5) {
        await this.minePendingTransactions();
      }

      return transaction;
    } catch (error) {
      console.error('Error recording shipment event:', error);
      throw error;
    }
  }

  /**
   * Create smart contract for shipment
   */
  async createShipmentContract(shipmentData) {
    const contractId = this.generateContractId();
    
    const contract = new SmartContract(contractId, {
      type: 'shipment_tracking',
      shipmentId: shipmentData.shipmentId,
      organizationId: shipmentData.organizationId,
      conditions: {
        deliveryDeadline: shipmentData.eta,
        temperatureRange: shipmentData.temperatureRange,
        routeCompliance: shipmentData.allowedRoutes,
        customsCompliance: shipmentData.customsRequirements
      },
      penalties: {
        lateDelivery: shipmentData.lateDeliveryPenalty || 0,
        temperatureBreach: shipmentData.temperaturePenalty || 0,
        routeDeviation: shipmentData.routePenalty || 0
      },
      rewards: {
        onTimeDelivery: shipmentData.onTimeBonus || 0,
        earlyDelivery: shipmentData.earlyBonus || 0,
        perfectConditions: shipmentData.perfectBonus || 0
      },
      stakeholders: shipmentData.stakeholders || []
    });

    this.smartContracts.set(contractId, contract);
    
    // Record contract creation on blockchain
    await this.recordShipmentEvent(
      shipmentData.shipmentId,
      'contract_created',
      { contractId, terms: contract.terms },
      shipmentData.organizationId
    );

    return contract;
  }

  /**
   * Execute smart contract conditions
   */
  async executeContract(contractId, eventData) {
    const contract = this.smartContracts.get(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const results = await contract.execute(eventData);
    
    // Record execution on blockchain
    await this.recordShipmentEvent(
      contract.terms.shipmentId,
      'contract_executed',
      { contractId, results, eventData },
      contract.terms.organizationId
    );

    return results;
  }

  /**
   * Verify shipment authenticity
   */
  async verifyShipment(shipmentId) {
    const shipmentEvents = this.getShipmentHistory(shipmentId);
    
    const verification = {
      isValid: true,
      events: shipmentEvents.length,
      firstEvent: shipmentEvents[0]?.timestamp,
      lastEvent: shipmentEvents[shipmentEvents.length - 1]?.timestamp,
      integrityChecks: [],
      anomalies: []
    };

    // Verify each event
    for (const event of shipmentEvents) {
      const isValid = this.verifyTransaction(event);
      verification.integrityChecks.push({
        eventId: event.id,
        isValid,
        timestamp: event.timestamp
      });

      if (!isValid) {
        verification.isValid = false;
        verification.anomalies.push({
          type: 'invalid_signature',
          eventId: event.id,
          timestamp: event.timestamp
        });
      }
    }

    // Check for timeline anomalies
    this.detectTimelineAnomalies(shipmentEvents, verification);
    
    // Check for location anomalies
    this.detectLocationAnomalies(shipmentEvents, verification);

    return verification;
  }

  /**
   * Get complete shipment history from blockchain
   */
  getShipmentHistory(shipmentId) {
    const history = [];
    
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.shipmentId === shipmentId) {
          history.push({
            id: transaction.id,
            eventType: transaction.eventType,
            data: transaction.data,
            timestamp: transaction.timestamp,
            blockHash: block.hash,
            blockIndex: block.index,
            signature: transaction.signature
          });
        }
      }
    }

    return history.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Generate proof of authenticity
   */
  generateProofOfAuthenticity(shipmentId) {
    const history = this.getShipmentHistory(shipmentId);
    const verification = this.verifyShipment(shipmentId);
    
    const proof = {
      shipmentId,
      generatedAt: Date.now(),
      totalEvents: history.length,
      verificationStatus: verification.isValid ? 'VERIFIED' : 'INVALID',
      blockchainHash: this.calculateChainHash(),
      eventHashes: history.map(event => ({
        eventType: event.eventType,
        timestamp: event.timestamp,
        hash: this.calculateEventHash(event)
      })),
      digitalSignature: null
    };

    // Sign the proof
    proof.digitalSignature = this.signData(JSON.stringify(proof));
    
    return proof;
  }

  /**
   * Mine pending transactions
   */
  async minePendingTransactions() {
    const block = new Block(
      this.getLatestBlock().index + 1,
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    block.mineBlock(this.difficulty);
    
    this.chain.push(block);
    this.pendingTransactions = [];

    return block;
  }

  /**
   * Validate blockchain integrity
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  // Helper methods
  calculateHash(block) {
    return crypto
      .createHash('sha256')
      .update(block.index + block.previousHash + block.timestamp + JSON.stringify(block.transactions) + block.nonce)
      .digest('hex');
  }

  calculateChainHash() {
    const chainData = this.chain.map(block => block.hash).join('');
    return crypto.createHash('sha256').update(chainData).digest('hex');
  }

  calculateEventHash(event) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(event))
      .digest('hex');
  }

  signTransaction(transaction) {
    const transactionData = JSON.stringify({
      shipmentId: transaction.shipmentId,
      eventType: transaction.eventType,
      data: transaction.data,
      timestamp: transaction.timestamp
    });
    
    return this.signData(transactionData);
  }

  signData(data) {
    // In production, use proper private key signing
    return crypto
      .createHash('sha256')
      .update(data + process.env.BLOCKCHAIN_PRIVATE_KEY || 'default-key')
      .digest('hex');
  }

  verifyTransaction(transaction) {
    const expectedSignature = this.signTransaction(transaction);
    return transaction.signature === expectedSignature;
  }

  generateContractId() {
    return crypto.randomBytes(16).toString('hex');
  }

  detectTimelineAnomalies(events, verification) {
    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i].timestamp - events[i - 1].timestamp;
      
      // Check for impossible time gaps (negative or too large)
      if (timeDiff < 0) {
        verification.anomalies.push({
          type: 'negative_time_gap',
          events: [events[i - 1].id, events[i].id],
          timeDiff
        });
        verification.isValid = false;
      }
      
      if (timeDiff > 30 * 24 * 60 * 60 * 1000) { // 30 days
        verification.anomalies.push({
          type: 'excessive_time_gap',
          events: [events[i - 1].id, events[i].id],
          timeDiff
        });
      }
    }
  }

  detectLocationAnomalies(events, verification) {
    const locationEvents = events.filter(e => e.data.location);
    
    for (let i = 1; i < locationEvents.length; i++) {
      const prev = locationEvents[i - 1];
      const curr = locationEvents[i];
      
      if (prev.data.coordinates && curr.data.coordinates) {
        const distance = this.calculateDistance(
          prev.data.coordinates,
          curr.data.coordinates
        );
        
        const timeDiff = (curr.timestamp - prev.timestamp) / 1000 / 3600; // hours
        const speed = distance / timeDiff; // km/h
        
        // Check for impossible speeds (>500 km/h for ground transport)
        if (speed > 500) {
          verification.anomalies.push({
            type: 'impossible_speed',
            events: [prev.id, curr.id],
            speed,
            distance,
            timeDiff
          });
        }
      }
    }
  }

  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

// Block class
class Block {
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = '';
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');
    
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce)
      .digest('hex');
  }
}

// Shipment Transaction class
class ShipmentTransaction {
  constructor(shipmentId, eventType, data, organizationId, timestamp) {
    this.id = crypto.randomBytes(16).toString('hex');
    this.shipmentId = shipmentId;
    this.eventType = eventType;
    this.data = data;
    this.organizationId = organizationId;
    this.timestamp = timestamp;
    this.signature = null;
  }
}

// Smart Contract class
class SmartContract {
  constructor(id, terms) {
    this.id = id;
    this.terms = terms;
    this.status = 'active';
    this.executions = [];
    this.createdAt = Date.now();
  }

  async execute(eventData) {
    const results = {
      contractId: this.id,
      eventType: eventData.eventType,
      timestamp: Date.now(),
      conditions: [],
      penalties: 0,
      rewards: 0,
      actions: []
    };

    // Check delivery deadline
    if (eventData.eventType === 'delivered') {
      const deliveryTime = eventData.timestamp;
      const deadline = this.terms.conditions.deliveryDeadline;
      
      if (deliveryTime <= deadline) {
        results.rewards += this.terms.rewards.onTimeDelivery;
        results.conditions.push({
          type: 'on_time_delivery',
          met: true,
          reward: this.terms.rewards.onTimeDelivery
        });
      } else {
        results.penalties += this.terms.penalties.lateDelivery;
        results.conditions.push({
          type: 'late_delivery',
          met: false,
          penalty: this.terms.penalties.lateDelivery
        });
      }
    }

    // Check temperature conditions
    if (eventData.data.temperature && this.terms.conditions.temperatureRange) {
      const temp = eventData.data.temperature;
      const range = this.terms.conditions.temperatureRange;
      
      if (temp < range.min || temp > range.max) {
        results.penalties += this.terms.penalties.temperatureBreach;
        results.conditions.push({
          type: 'temperature_breach',
          met: false,
          penalty: this.terms.penalties.temperatureBreach,
          actual: temp,
          required: range
        });
      }
    }

    this.executions.push(results);
    return results;
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
