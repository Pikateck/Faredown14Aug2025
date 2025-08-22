import { Pool } from "pg";

export interface LoyaltyMember {
  id: number;
  userId: number;
  memberCode: string;
  tier: number;
  pointsBalance: number;
  pointsLocked: number;
  pointsLifetime: number;
  points12m: number;
  joinDate: string;
  status: string;
  optedOut: boolean;
}

export interface LoyaltyLedgerEntry {
  id: number;
  userId: number;
  bookingId?: string;
  eventType: "earn" | "redeem" | "adjust" | "expire" | "revoke";
  pointsDelta: number;
  rupeeValue?: number;
  fxRate: number;
  description?: string;
  meta?: any;
  createdAt: string;
}

export interface TierRule {
  tier: number;
  thresholdPoints12m: number;
  earnMultiplier: number;
  benefits: any;
  tierName: string;
}

export interface LoyaltyRule {
  channel: "AIR" | "HOTEL";
  earnPer100: number;
  redeemValuePer100: number;
  minRedeem: number;
  maxCapPct: number;
}

export interface RedemptionQuote {
  maxPoints: number;
  rupeeValue: number;
  capReason?: string;
  appliedPoints?: number;
}

export interface BookingEligibility {
  baseAmount: number;
  eligibleAmount: number;
  currency: string;
  fxRate: number;
  excludedItems: string[];
}

export class LoyaltyService {
  private db: Pool;

  constructor(dbPool: Pool) {
    this.db = dbPool;
  }

  // Create new loyalty member
  async createMember(userId: number): Promise<LoyaltyMember> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const memberCodeResult = await client.query(
        "SELECT generate_member_code() as code",
      );
      const memberCode = memberCodeResult.rows[0].code;

      const result = await client.query(
        `
        INSERT INTO loyalty_members (user_id, member_code)
        VALUES ($1, $2)
        RETURNING *
      `,
        [userId, memberCode],
      );

      await client.query("COMMIT");
      return this.mapMemberRow(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get member by user ID
  async getMember(userId: number): Promise<LoyaltyMember | null> {
    const result = await this.db.query(
      `
      SELECT * FROM loyalty_members WHERE user_id = $1
    `,
      [userId],
    );

    return result.rows.length > 0 ? this.mapMemberRow(result.rows[0]) : null;
  }

  // Get or create member
  async getOrCreateMember(userId: number): Promise<LoyaltyMember> {
    let member = await this.getMember(userId);
    if (!member) {
      member = await this.createMember(userId);
    }
    return member;
  }

  // Get loyalty rules
  async getRules(): Promise<{ air: LoyaltyRule; hotel: LoyaltyRule }> {
    const result = await this.db.query(`
      SELECT * FROM loyalty_rules 
      WHERE (active_to IS NULL OR active_to > NOW())
      ORDER BY active_from DESC
    `);

    const rules = result.rows.reduce((acc, row) => {
      acc[row.channel.toLowerCase()] = {
        channel: row.channel,
        earnPer100: row.earn_per_100,
        redeemValuePer100: row.redeem_value_per_100,
        minRedeem: row.min_redeem,
        maxCapPct: row.max_cap_pct,
      };
      return acc;
    }, {} as any);

    return rules;
  }

  // Get tier rules
  async getTierRules(): Promise<TierRule[]> {
    const result = await this.db.query(`
      SELECT * FROM tier_rules 
      WHERE (active_to IS NULL OR active_to > NOW())
      ORDER BY tier ASC
    `);

    return result.rows.map((row) => ({
      tier: row.tier,
      thresholdPoints12m: row.threshold_points_12m,
      earnMultiplier: row.earn_multiplier,
      benefits: row.benefits,
      tierName: row.tier_name,
    }));
  }

  // Calculate points earned from booking
  async calculateEarning(
    userId: number,
    bookingType: "AIR" | "HOTEL",
    eligibility: BookingEligibility,
  ): Promise<number> {
    const member = await this.getOrCreateMember(userId);
    const rules = await this.getRules();
    const tierRules = await this.getTierRules();

    const rule = rules[bookingType.toLowerCase() as "air" | "hotel"];
    if (!rule) return 0;

    // Convert to INR if needed
    const inrAmount = eligibility.eligibleAmount * eligibility.fxRate;

    // Calculate base points
    const basePoints = Math.floor((inrAmount / 100) * rule.earnPer100);

    // Apply tier multiplier
    const currentTier = tierRules.find((t) => t.tier === member.tier);
    const multiplier = currentTier?.earnMultiplier || 1.0;
    const earnedPoints = Math.floor(basePoints * multiplier);

    return earnedPoints;
  }

  // Process earning transaction
  async processEarning(
    userId: number,
    bookingId: string,
    bookingType: "AIR" | "HOTEL",
    eligibility: BookingEligibility,
    description?: string,
  ): Promise<number> {
    const earnedPoints = await this.calculateEarning(
      userId,
      bookingType,
      eligibility,
    );
    if (earnedPoints <= 0) return 0;

    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // Add to ledger
      await client.query(
        `
        INSERT INTO loyalty_ledger 
        (user_id, booking_id, event_type, points_delta, rupee_value, fx_rate, description, meta)
        VALUES ($1, $2, 'earn', $3, $4, $5, $6, $7)
      `,
        [
          userId,
          bookingId,
          earnedPoints,
          eligibility.eligibleAmount,
          eligibility.fxRate,
          description || `Earned from ${bookingType} booking`,
          JSON.stringify({
            bookingType,
            baseAmount: eligibility.baseAmount,
            eligibleAmount: eligibility.eligibleAmount,
            currency: eligibility.currency,
          }),
        ],
      );

      // Update member balance
      await client.query(
        `
        UPDATE loyalty_members 
        SET points_balance = points_balance + $1,
            points_lifetime = points_lifetime + $1,
            points_12m = points_12m + $1,
            last_calc_date = NOW()
        WHERE user_id = $2
      `,
        [earnedPoints, userId],
      );

      // Add to expiry tracking (24 months from now)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 24);

      await client.query(
        `
        INSERT INTO point_expiry (user_id, points, earn_batch_id, expire_on)
        VALUES ($1, $2, $3, $4)
      `,
        [
          userId,
          earnedPoints,
          bookingId,
          expiryDate.toISOString().split("T")[0],
        ],
      );

      await client.query("COMMIT");
      return earnedPoints;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Quote redemption for cart
  async quoteRedemption(
    userId: number,
    eligibleAmount: number,
    currency: string = "INR",
    fxRate: number = 1.0,
  ): Promise<RedemptionQuote> {
    const member = await this.getMember(userId);
    if (!member) {
      return { maxPoints: 0, rupeeValue: 0, capReason: "Not a loyalty member" };
    }

    const rules = await this.getRules();
    const redeemValuePer100 =
      rules.air?.redeemValuePer100 || rules.hotel?.redeemValuePer100 || 10;
    const maxCapPct = rules.air?.maxCapPct || rules.hotel?.maxCapPct || 0.2;
    const minRedeem = rules.air?.minRedeem || rules.hotel?.minRedeem || 200;

    // Convert eligible amount to INR
    const inrEligibleAmount = eligibleAmount * fxRate;

    // Calculate maximum redeemable value (20% of eligible amount)
    const maxRedeemValue = inrEligibleAmount * maxCapPct;

    // Calculate maximum points based on value cap and available balance
    const maxPointsByValue = Math.floor(
      (maxRedeemValue / redeemValuePer100) * 100,
    );
    const availablePoints = member.pointsBalance - member.pointsLocked;

    let maxPoints = Math.min(maxPointsByValue, availablePoints);
    let capReason = "";

    if (maxPoints < minRedeem) {
      maxPoints = 0;
      capReason = `Minimum ${minRedeem} points required`;
    } else if (maxPoints === maxPointsByValue) {
      capReason = `Limited to ${Math.round(maxCapPct * 100)}% of booking value`;
    } else if (maxPoints === availablePoints) {
      capReason = "Limited by available point balance";
    }

    // Round down to nearest 100 for clean UX
    maxPoints = Math.floor(maxPoints / 100) * 100;

    const rupeeValue = (maxPoints / 100) * redeemValuePer100;

    return {
      maxPoints,
      rupeeValue,
      capReason: capReason || undefined,
    };
  }

  // Apply redemption to cart
  async applyRedemption(
    userId: number,
    cartId: string,
    points: number,
    eligibleAmount: number,
    currency: string = "INR",
    fxRate: number = 1.0,
  ): Promise<{
    success: boolean;
    lockedId?: string;
    rupeeValue?: number;
    error?: string;
  }> {
    const quote = await this.quoteRedemption(
      userId,
      eligibleAmount,
      currency,
      fxRate,
    );

    if (points > quote.maxPoints) {
      return {
        success: false,
        error: `Cannot redeem ${points} points. Maximum: ${quote.maxPoints}`,
      };
    }

    const rules = await this.getRules();
    const redeemValuePer100 =
      rules.air?.redeemValuePer100 || rules.hotel?.redeemValuePer100 || 10;
    const rupeeValue = (points / 100) * redeemValuePer100;

    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // Create redemption transaction
      const result = await client.query(
        `
        INSERT INTO loyalty_transactions 
        (user_id, cart_id, points_applied, rupee_value, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
        [
          userId,
          cartId,
          points,
          rupeeValue,
          new Date(Date.now() + 30 * 60 * 1000),
        ],
      ); // 30 min expiry

      const lockedId = result.rows[0].id;

      // Lock points
      await client.query(
        `
        UPDATE loyalty_members 
        SET points_locked = points_locked + $1
        WHERE user_id = $2
      `,
        [points, userId],
      );

      await client.query("COMMIT");

      return {
        success: true,
        lockedId: lockedId.toString(),
        rupeeValue,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      return { success: false, error: "Failed to apply redemption" };
    } finally {
      client.release();
    }
  }

  // Confirm redemption after successful payment
  async confirmRedemption(
    lockedId: string,
    bookingId: string,
  ): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      // Get transaction details
      const txnResult = await client.query(
        `
        SELECT * FROM loyalty_transactions WHERE id = $1 AND status = 'pending'
      `,
        [lockedId],
      );

      if (txnResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return false;
      }

      const transaction = txnResult.rows[0];

      // Add to ledger
      await client.query(
        `
        INSERT INTO loyalty_ledger 
        (user_id, booking_id, event_type, points_delta, rupee_value, description, meta)
        VALUES ($1, $2, 'redeem', $3, $4, $5, $6)
      `,
        [
          transaction.user_id,
          bookingId,
          -transaction.points_applied,
          transaction.rupee_value,
          "Points redeemed on booking",
          JSON.stringify({
            transactionId: lockedId,
            cartId: transaction.cart_id,
          }),
        ],
      );

      // Update member balance
      await client.query(
        `
        UPDATE loyalty_members 
        SET points_balance = points_balance - $1,
            points_locked = points_locked - $1
        WHERE user_id = $2
      `,
        [transaction.points_applied, transaction.user_id],
      );

      // Update transaction status
      await client.query(
        `
        UPDATE loyalty_transactions 
        SET status = 'confirmed', booking_id = $1, updated_at = NOW()
        WHERE id = $2
      `,
        [bookingId, lockedId],
      );

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Cancel redemption (release locked points)
  async cancelRedemption(lockedId: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const txnResult = await client.query(
        `
        SELECT * FROM loyalty_transactions WHERE id = $1 AND status = 'pending'
      `,
        [lockedId],
      );

      if (txnResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return false;
      }

      const transaction = txnResult.rows[0];

      // Release locked points
      await client.query(
        `
        UPDATE loyalty_members 
        SET points_locked = points_locked - $1
        WHERE user_id = $2
      `,
        [transaction.points_applied, transaction.user_id],
      );

      // Update transaction status
      await client.query(
        `
        UPDATE loyalty_transactions 
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1
      `,
        [lockedId],
      );

      await client.query("COMMIT");
      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Get member ledger with pagination
  async getMemberLedger(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ items: LoyaltyLedgerEntry[]; total: number }> {
    const countResult = await this.db.query(
      "SELECT COUNT(*) FROM loyalty_ledger WHERE user_id = $1",
      [userId],
    );

    const result = await this.db.query(
      `
      SELECT * FROM loyalty_ledger 
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [userId, limit, offset],
    );

    return {
      items: result.rows.map(this.mapLedgerRow),
      total: parseInt(countResult.rows[0].count),
    };
  }

  // Calculate and update member tier
  async updateMemberTier(
    userId: number,
  ): Promise<{ oldTier: number; newTier: number }> {
    const member = await this.getMember(userId);
    if (!member) throw new Error("Member not found");

    const tierRules = await this.getTierRules();

    // Find appropriate tier based on 12-month points
    let newTier = 1;
    for (const rule of tierRules.reverse()) {
      if (member.points12m >= rule.thresholdPoints12m) {
        newTier = rule.tier;
        break;
      }
    }

    if (newTier !== member.tier) {
      await this.db.query(
        `
        UPDATE loyalty_members 
        SET tier = $1, last_calc_date = NOW()
        WHERE user_id = $2
      `,
        [newTier, userId],
      );
    }

    return { oldTier: member.tier, newTier };
  }

  // Get expiring points
  async getExpiringPoints(
    userId: number,
    daysAhead: number = 60,
  ): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    const result = await this.db.query(
      `
      SELECT * FROM point_expiry
      WHERE user_id = $1 AND expire_on <= $2 AND status = 'active'
      ORDER BY expire_on ASC
    `,
      [userId, cutoffDate.toISOString().split("T")[0]],
    );

    return result.rows;
  }

  // ===== ADMIN MANAGEMENT METHODS =====

  // Loyalty Rules Management
  async createLoyaltyRule(ruleData: any): Promise<any> {
    try {
      const query = `
        INSERT INTO loyalty_rules (
          rule_type, category, points_per_amount, min_amount,
          max_points, valid_from, valid_to, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *
      `;

      const values = [
        ruleData.ruleType,
        ruleData.category,
        ruleData.pointsPerAmount,
        ruleData.minAmount,
        ruleData.maxPoints || null,
        ruleData.validFrom,
        ruleData.validTo || null,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Create loyalty rule error:", error);
      throw error;
    }
  }

  async updateLoyaltyRule(id: string, ruleData: any): Promise<any> {
    try {
      const query = `
        UPDATE loyalty_rules
        SET rule_type = $2, category = $3, points_per_amount = $4,
            min_amount = $5, max_points = $6, valid_from = $7,
            valid_to = $8, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id,
        ruleData.ruleType,
        ruleData.category,
        ruleData.pointsPerAmount,
        ruleData.minAmount,
        ruleData.maxPoints || null,
        ruleData.validFrom,
        ruleData.validTo || null,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Update loyalty rule error:", error);
      throw error;
    }
  }

  async deleteLoyaltyRule(id: string): Promise<void> {
    try {
      const query = "DELETE FROM loyalty_rules WHERE id = $1";
      await this.db.query(query, [id]);
    } catch (error) {
      console.error("Delete loyalty rule error:", error);
      throw error;
    }
  }

  // Tier Rules Management
  async createTierRule(tierData: any): Promise<any> {
    try {
      const query = `
        INSERT INTO tier_rules (
          tier, tier_name, threshold_points_12m, points_multiplier,
          benefits, active, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      // Find next tier number
      const maxTierQuery =
        "SELECT COALESCE(MAX(tier), 0) as max_tier FROM tier_rules";
      const maxTierResult = await this.db.query(maxTierQuery);
      const nextTier = maxTierResult.rows[0].max_tier + 1;

      const values = [
        nextTier,
        tierData.tierName,
        tierData.minPoints,
        tierData.multiplier,
        JSON.stringify(tierData.benefits),
        tierData.active ?? true,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Create tier rule error:", error);
      throw error;
    }
  }

  async updateTierRule(id: string, tierData: any): Promise<any> {
    try {
      const query = `
        UPDATE tier_rules
        SET tier_name = $2, threshold_points_12m = $3,
            points_multiplier = $4, benefits = $5, active = $6,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const values = [
        id,
        tierData.tierName,
        tierData.minPoints,
        tierData.multiplier,
        JSON.stringify(tierData.benefits),
        tierData.active ?? true,
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Update tier rule error:", error);
      throw error;
    }
  }

  // Member Management
  async getLoyaltyMembers(options: {
    search?: string;
    page: number;
    limit: number;
  }): Promise<any[]> {
    try {
      const offset = (options.page - 1) * options.limit;
      let whereClause = "";
      const values: any[] = [];

      if (options.search) {
        whereClause = `WHERE lm.email ILIKE $1 OR lm.name ILIKE $1`;
        values.push(`%${options.search}%`);
      }

      const query = `
        SELECT
          lm.id,
          lm.user_id,
          lm.email,
          lm.name,
          lm.points_balance as currentPoints,
          lm.points_lifetime as lifetimeEarned,
          tr.tier_name as currentTier,
          CASE
            WHEN next_tier.threshold_points_12m IS NOT NULL
            THEN ROUND((lm.points_12m - tr.threshold_points_12m) * 100.0 / (next_tier.threshold_points_12m - tr.threshold_points_12m))
            ELSE 100
          END as tierProgress,
          lm.join_date as joinedAt,
          lm.last_activity as lastActivity,
          lm.status
        FROM loyalty_members lm
        LEFT JOIN tier_rules tr ON tr.tier = lm.tier
        LEFT JOIN tier_rules next_tier ON next_tier.tier = lm.tier + 1
        ${whereClause}
        ORDER BY lm.points_lifetime DESC
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      values.push(options.limit, offset);
      const result = await this.db.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Get loyalty members error:", error);
      throw error;
    }
  }

  async updateMemberStatus(userId: string, status: string): Promise<any> {
    try {
      const query = `
        UPDATE loyalty_members
        SET status = $2, updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await this.db.query(query, [userId, status]);
      return result.rows[0];
    } catch (error) {
      console.error("Update member status error:", error);
      throw error;
    }
  }

  async adjustMemberPoints(data: {
    userId: string;
    points: number;
    reason: string;
    type: string;
    adminUserId?: string;
  }): Promise<any> {
    try {
      await this.db.query("BEGIN");

      // Update member points
      const updateQuery = `
        UPDATE loyalty_members
        SET points_balance = GREATEST(0, points_balance + $2),
            points_lifetime = CASE WHEN $2 > 0 THEN points_lifetime + $2 ELSE points_lifetime END,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *
      `;

      const memberResult = await this.db.query(updateQuery, [
        data.userId,
        data.points,
      ]);

      // Record transaction
      const transactionQuery = `
        INSERT INTO loyalty_ledger (
          user_id, transaction_type, points, balance_after,
          description, reference_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING *
      `;

      const transactionValues = [
        data.userId,
        data.type,
        data.points,
        memberResult.rows[0].points_balance,
        `${data.reason} (Admin: ${data.adminUserId || "System"})`,
        `admin-adjustment-${Date.now()}`,
      ];

      const transactionResult = await this.db.query(
        transactionQuery,
        transactionValues,
      );

      await this.db.query("COMMIT");

      return transactionResult.rows[0];
    } catch (error) {
      await this.db.query("ROLLBACK");
      console.error("Adjust member points error:", error);
      throw error;
    }
  }

  async getMemberTransactions(
    userId: string,
    options: {
      page: number;
      limit: number;
    },
  ): Promise<any> {
    try {
      const offset = (options.page - 1) * options.limit;

      const query = `
        SELECT
          ll.*,
          COUNT(*) OVER() as total_count
        FROM loyalty_ledger ll
        WHERE ll.user_id = $1
        ORDER BY ll.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await this.db.query(query, [
        userId,
        options.limit,
        offset,
      ]);

      return {
        items: result.rows,
        total: result.rows[0]?.total_count || 0,
        page: options.page,
        limit: options.limit,
      };
    } catch (error) {
      console.error("Get member transactions error:", error);
      throw error;
    }
  }

  // Analytics
  async getLoyaltyAnalytics(options: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    try {
      const startDate =
        options.startDate ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = options.endDate || new Date().toISOString();

      // Member stats
      const memberStatsQuery = `
        SELECT
          COUNT(*) as total_members,
          COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_members,
          COUNT(CASE WHEN join_date >= $1 THEN 1 END) as new_members,
          AVG(points_balance) as avg_points_balance,
          SUM(points_lifetime) as total_points_earned
        FROM loyalty_members
      `;

      // Transaction stats
      const transactionStatsQuery = `
        SELECT
          transaction_type,
          COUNT(*) as transaction_count,
          SUM(ABS(points)) as total_points
        FROM loyalty_ledger
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY transaction_type
      `;

      // Tier distribution
      const tierStatsQuery = `
        SELECT
          tr.tier_name,
          COUNT(lm.id) as member_count
        FROM tier_rules tr
        LEFT JOIN loyalty_members lm ON lm.tier = tr.tier
        GROUP BY tr.tier, tr.tier_name
        ORDER BY tr.tier
      `;

      const [memberStats, transactionStats, tierStats] = await Promise.all([
        this.db.query(memberStatsQuery, [startDate]),
        this.db.query(transactionStatsQuery, [startDate, endDate]),
        this.db.query(tierStatsQuery),
      ]);

      return {
        dateRange: { startDate, endDate },
        memberStats: memberStats.rows[0],
        transactionStats: transactionStats.rows,
        tierDistribution: tierStats.rows,
      };
    } catch (error) {
      console.error("Get loyalty analytics error:", error);
      throw error;
    }
  }

  // Export functionality
  async exportLoyaltyData(type: string, format: string): Promise<string> {
    try {
      let data: any[] = [];

      switch (type) {
        case "members":
          const membersQuery = `
            SELECT
              lm.id, lm.email, lm.name, lm.points_balance,
              lm.points_lifetime, tr.tier_name, lm.join_date, lm.status
            FROM loyalty_members lm
            LEFT JOIN tier_rules tr ON tr.tier = lm.tier
            ORDER BY lm.points_lifetime DESC
          `;
          const membersResult = await this.db.query(membersQuery);
          data = membersResult.rows;
          break;

        case "transactions":
          const transactionsQuery = `
            SELECT
              ll.user_id, ll.transaction_type, ll.points,
              ll.balance_after, ll.description, ll.created_at
            FROM loyalty_ledger ll
            ORDER BY ll.created_at DESC
            LIMIT 10000
          `;
          const transactionsResult = await this.db.query(transactionsQuery);
          data = transactionsResult.rows;
          break;

        default:
          throw new Error("Invalid export type");
      }

      if (format === "csv") {
        if (data.length === 0) return "";

        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row) =>
          Object.values(row)
            .map((val) =>
              typeof val === "string" && val.includes(",") ? `"${val}"` : val,
            )
            .join(","),
        );

        return [headers, ...rows].join("\n");
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      console.error("Export loyalty data error:", error);
      throw error;
    }
  }

  // Helper methods
  private mapMemberRow(row: any): LoyaltyMember {
    return {
      id: row.id,
      userId: row.user_id,
      memberCode: row.member_code,
      tier: row.tier,
      pointsBalance: row.points_balance,
      pointsLocked: row.points_locked,
      pointsLifetime: row.points_lifetime,
      points12m: row.points_12m,
      joinDate: row.join_date,
      status: row.status,
      optedOut: row.opted_out,
    };
  }

  private mapLedgerRow(row: any): LoyaltyLedgerEntry {
    return {
      id: row.id,
      userId: row.user_id,
      bookingId: row.booking_id,
      eventType: row.event_type,
      pointsDelta: row.points_delta,
      rupeeValue: row.rupee_value ? parseFloat(row.rupee_value) : undefined,
      fxRate: parseFloat(row.fx_rate || "1.0"),
      description: row.description,
      meta: row.meta,
      createdAt: row.created_at,
    };
  }
}

export default LoyaltyService;
