/**
 * Offer Capsule Service
 * ECDSA-signed offer capsules for audit and security
 */

const crypto = require("crypto");
const { Pool } = require("pg");
const winston = require("winston");

class OfferCapsuleService {
  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level.toUpperCase()}] [CAPSULE] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ""}`;
        }),
      ),
      transports: [new winston.transports.Console()],
    });

    // Generate or load ECDSA key pair
    this.initializeKeyPair();

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    });
  }

  /**
   * Initialize ECDSA key pair for signing
   */
  initializeKeyPair() {
    try {
      // In production, load from secure storage
      // For development, generate ephemeral keys
      const keyPair = crypto.generateKeyPairSync("ec", {
        namedCurve: "secp256k1", // Bitcoin/Ethereum compatible curve
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      this.privateKey = keyPair.privateKey;
      this.publicKey = keyPair.publicKey;

      // Log public key hash for verification
      const publicKeyHash = crypto
        .createHash("sha256")
        .update(this.publicKey)
        .digest("hex")
        .substring(0, 16);
      this.logger.info(
        `ECDSA key pair initialized, public key hash: ${publicKeyHash}`,
      );
    } catch (error) {
      this.logger.error("Failed to initialize ECDSA key pair:", error);
      throw error;
    }
  }

  /**
   * Create and sign offer capsule
   */
  async createSignedCapsule(context) {
    try {
      const {
        session_id,
        chosen_action,
        feasible_actions,
        supplier_snapshots,
        policy_version,
        model_version,
        user_context,
      } = context;

      // Create capsule payload
      const payload = {
        session_id: session_id,
        policy_version: policy_version,
        model_version: model_version,
        supplier_ids: supplier_snapshots.map((s) => s.supplier_id),
        floor: feasible_actions.cost_floor,
        min_price: feasible_actions.min_price,
        max_price: feasible_actions.max_price,
        chosen: {
          type: chosen_action.type,
          price: chosen_action.price,
          currency: chosen_action.currency,
          perk: chosen_action.perk_name || null,
          supplier_id: this.getChosenSupplierId(
            chosen_action,
            supplier_snapshots,
          ),
          expected_profit: chosen_action.expected_profit,
          accept_prob: chosen_action.accept_prob,
        },
        snapshots_hash: this.calculateSnapshotsHash(supplier_snapshots),
        constraints: {
          allow_perks: feasible_actions.allow_perks,
          max_discount_pct: feasible_actions.constraints?.max_discount_pct,
          min_margin_usd: feasible_actions.constraints?.min_margin_usd,
        },
        user_tier: user_context?.tier || null,
        created_at: new Date().toISOString(),
        expires_at: this.calculateExpiryTime(chosen_action),
        explain: this.generateExplanation(chosen_action, feasible_actions),
      };

      // Create canonical string representation
      const canonicalPayload = this.canonicalizePayload(payload);

      // Sign the payload
      const signature = this.signPayload(canonicalPayload);

      // Create final capsule
      const capsule = {
        payload: payload,
        canonical: canonicalPayload,
        signature: signature,
        public_key_hash: this.getPublicKeyHash(),
        created_at: new Date().toISOString(),
      };

      // Store in database
      await this.storeCapsule(session_id, capsule);

      this.logger.info("Offer capsule created and signed", {
        session_id: session_id,
        chosen_price: chosen_action.price,
        floor: feasible_actions.cost_floor,
        signature_length: signature.length,
      });

      return capsule;
    } catch (error) {
      this.logger.error("Failed to create signed capsule:", error);
      throw error;
    }
  }

  /**
   * Verify offer capsule signature
   */
  verifyCapsule(capsule) {
    try {
      const { canonical, signature } = capsule;

      const verify = crypto.createVerify("sha256");
      verify.update(canonical);
      verify.end();

      const isValid = verify.verify(this.publicKey, signature, "base64");

      if (isValid) {
        this.logger.info("Capsule signature verified successfully");
      } else {
        this.logger.warn("Capsule signature verification failed");
      }

      return isValid;
    } catch (error) {
      this.logger.error("Failed to verify capsule:", error);
      return false;
    }
  }

  /**
   * Canonicalize payload for consistent signing
   */
  canonicalizePayload(payload) {
    // Create deterministic string representation
    const sortedKeys = Object.keys(payload).sort();
    const canonicalObject = {};

    for (const key of sortedKeys) {
      canonicalObject[key] = payload[key];
    }

    return JSON.stringify(canonicalObject, Object.keys(canonicalObject).sort());
  }

  /**
   * Sign payload with ECDSA private key
   */
  signPayload(canonicalPayload) {
    const sign = crypto.createSign("sha256");
    sign.update(canonicalPayload);
    sign.end();

    const signature = sign.sign(this.privateKey, "base64");
    return signature;
  }

  /**
   * Calculate hash of supplier snapshots
   */
  calculateSnapshotsHash(snapshots) {
    const snapshotData = snapshots.map((s) => ({
      supplier_id: s.supplier_id,
      net: s.net,
      taxes: s.taxes,
      fees: s.fees,
      snapshot_at: s.snapshot_at,
    }));

    const snapshotString = JSON.stringify(
      snapshotData,
      Object.keys(snapshotData[0] || {}).sort(),
    );
    return crypto.createHash("sha256").update(snapshotString).digest("hex");
  }

  /**
   * Get chosen supplier ID from action
   */
  getChosenSupplierId(action, snapshots) {
    // For now, use the primary supplier (first snapshot)
    // In production, implement supplier arbitration logic
    return snapshots[0]?.supplier_id || null;
  }

  /**
   * Calculate expiry time for offer
   */
  calculateExpiryTime(action) {
    const now = new Date();
    let expiryMinutes = 15; // Default 15 minutes

    // Adjust based on action type
    if (action.type === "HOLD") {
      expiryMinutes = action.hold_minutes || 10;
    } else if (action.type === "OFFER_PERK") {
      expiryMinutes = 20; // Longer for perk consideration
    }

    const expiryTime = new Date(now.getTime() + expiryMinutes * 60000);
    return expiryTime.toISOString();
  }

  /**
   * Generate human-readable explanation
   */
  generateExplanation(chosen_action, feasible_actions) {
    const discount = feasible_actions.max_price - chosen_action.price;
    const discountPct = ((discount / feasible_actions.max_price) * 100).toFixed(
      1,
    );
    const marginAboveCost = chosen_action.price - feasible_actions.cost_floor;

    let explanation = `${discountPct}% below displayed price`;

    if (marginAboveCost > 0) {
      explanation += `, $${marginAboveCost.toFixed(2)} above cost`;
    }

    if (chosen_action.perk_name) {
      explanation += ` + ${chosen_action.perk_name}`;
    }

    if (chosen_action.type === "HOLD") {
      explanation += `. Hold offer expires in ${chosen_action.hold_minutes} minutes`;
    }

    explanation += ". Fair pricing with quality assurance.";

    return explanation;
  }

  /**
   * Store capsule in database
   */
  async storeCapsule(sessionId, capsule) {
    const client = await this.pool.connect();

    try {
      await client.query(
        `
        INSERT INTO ai.offer_capsules (session_id, payload, signature, created_at)
        VALUES ($1, $2, $3, NOW())
      `,
        [sessionId, JSON.stringify(capsule.payload), capsule.signature],
      );

      this.logger.info(`Capsule stored for session ${sessionId}`);
    } catch (error) {
      this.logger.error("Failed to store capsule:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve capsule from database
   */
  async getCapsule(sessionId) {
    const client = await this.pool.connect();

    try {
      const result = await client.query(
        `
        SELECT payload, signature, created_at
        FROM ai.offer_capsules
        WHERE session_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `,
        [sessionId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        payload: row.payload,
        signature: row.signature,
        created_at: row.created_at,
      };
    } catch (error) {
      this.logger.error("Failed to retrieve capsule:", error);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Get public key hash for identification
   */
  getPublicKeyHash() {
    return crypto
      .createHash("sha256")
      .update(this.publicKey)
      .digest("hex")
      .substring(0, 16);
  }

  /**
   * Validate capsule expiry
   */
  isCapsuleExpired(capsule) {
    if (!capsule.payload.expires_at) {
      return false; // No expiry set
    }

    const expiryTime = new Date(capsule.payload.expires_at);
    const now = new Date();

    return now > expiryTime;
  }

  /**
   * Get capsule summary for API response
   */
  getCapsuleSummary(capsule) {
    return {
      policy_version: capsule.payload.policy_version,
      model_version: capsule.payload.model_version,
      signature: capsule.signature.substring(0, 16) + "...", // Truncated for display
      public_key_hash: this.getPublicKeyHash(),
      expires_at: capsule.payload.expires_at,
      created_at: capsule.payload.created_at,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Test signing and verification
      const testPayload = "health-check-" + Date.now();
      const signature = this.signPayload(testPayload);

      const testCapsule = {
        canonical: testPayload,
        signature: signature,
      };

      const isValid = this.verifyCapsule(testCapsule);

      return {
        status: isValid ? "healthy" : "unhealthy",
        public_key_hash: this.getPublicKeyHash(),
        signature_test: isValid,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
const offerCapsuleService = new OfferCapsuleService();

module.exports = offerCapsuleService;
