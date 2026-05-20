/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║        SOURCE UNIQUE DE VÉRITÉ — PLANS ABONNEMENTS          ║
 * ║  Modifier ICI uniquement. Tout le backend et le frontend     ║
 * ║  lisent ces valeurs. Ne pas dupliquer dans d'autres fichiers.║
 * ╚══════════════════════════════════════════════════════════════╝
 * Miroir du fichier backend: secoure/src/config/subscriptionConfig.js
 */

export interface PlanPricing {
  monthly: number;
  annual: number;
  trialMonths: number;
  annualDiscount: number;
}

export interface PlanFeatures {
  productManagement: {
    maxProducts: number;
    maxVariants: number;
    maxCategories: number;
    catalogImport: boolean;
  };
  paymentOptions: {
    manualPayment: boolean;
    mobileMoney: boolean;
    cardPayment: boolean;
    customPayment: boolean;
  };
  support: {
    responseTime: number;
    channels: string[];
    onboarding: string;
  };
  marketing: {
    marketplaceVisibility: string;
    maxActiveCoupons: number;
    emailMarketing: boolean;
    abandonedCartRecovery: boolean;
    customMarketing?: boolean;
  };
}

export interface Plan {
  name: string;
  description: string;
  pricing: PlanPricing;
  commission: number;
  productLimit: number;
  features: PlanFeatures;
}

export type PlanName = 'Starter' | 'Pro' | 'Business';

export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending' | 'trial';

const SUBSCRIPTION_CONFIG = {

  PLANS: {
    Starter: {
      name: "Starter",
      description: "Idéal pour débuter. 2 mois d'essai gratuit.",
      pricing: {
        monthly: 2000,
        annual: 21600,   // 2000 * 12 - 10%
        trialMonths: 2,
        annualDiscount: 0.10,
      },
      commission: 3.0,
      productLimit: 20,
      features: {
        productManagement: {
          maxProducts: 20,
          maxVariants: 3,
          maxCategories: 5,
          catalogImport: false,
        },
        paymentOptions: {
          manualPayment: true,
          mobileMoney: true,
          cardPayment: false,
          customPayment: false,
        },
        support: {
          responseTime: 48,
          channels: ["email"],
          onboarding: "standard",
        },
        marketing: {
          marketplaceVisibility: "standard",
          maxActiveCoupons: 1,
          emailMarketing: false,
          abandonedCartRecovery: false,
        },
      },
    },

    Pro: {
      name: "Pro",
      description: "Pour les vendeurs réguliers avec plus de volume.",
      pricing: {
        monthly: 5000,
        annual: 54000,   // 5000 * 12 - 10%
        trialMonths: 0,
        annualDiscount: 0.10,
      },
      commission: 2.5,
      productLimit: -1,
      features: {
        productManagement: {
          maxProducts: -1,
          maxVariants: 10,
          maxCategories: 20,
          catalogImport: true,
        },
        paymentOptions: {
          manualPayment: true,
          mobileMoney: true,
          cardPayment: true,
          customPayment: false,
        },
        support: {
          responseTime: 24,
          channels: ["email", "chat"],
          onboarding: "personnalisé",
        },
        marketing: {
          marketplaceVisibility: "prioritaire",
          maxActiveCoupons: 5,
          emailMarketing: true,
          abandonedCartRecovery: false,
        },
      },
    },

    Business: {
      name: "Business",
      description: "Pour les vendeurs établis à fort volume.",
      pricing: {
        monthly: 10000,
        annual: 108000,   // 10000 * 12 - 10%
        trialMonths: 0,
        annualDiscount: 0.10,
      },
      commission: 2.0,
      productLimit: -1,
      features: {
        productManagement: {
          maxProducts: -1,
          maxVariants: -1,
          maxCategories: -1,
          catalogImport: true,
        },
        paymentOptions: {
          manualPayment: true,
          mobileMoney: true,
          cardPayment: true,
          customPayment: true,
        },
        support: {
          responseTime: 4,
          channels: ["email", "chat", "phone"],
          onboarding: "dédié",
        },
        marketing: {
          marketplaceVisibility: "premium",
          maxActiveCoupons: -1,
          emailMarketing: true,
          abandonedCartRecovery: true,
          customMarketing: true,
        },
      },
    },
  } as Record<PlanName, Plan>,

  DEFAULT_COMMISSION: 3.0,

  PAYMENT_METHODS: {
    mynita:       { phone: "+22790123456", name: "iHambaObab Mynita",       active: true },
    aman:         { phone: "+22798765432", name: "iHambaObab Aman",         active: true },
    airtel_money: { phone: "+22787654321", name: "iHambaObab Airtel Money", active: true },
    orange_money: { phone: "+22776543210", name: "iHambaObab Orange Money", active: true },
  },

  SUBSCRIPTION_STATUSES: {
    ACTIVE:    'active'    as SubscriptionStatus,
    EXPIRED:   'expired'   as SubscriptionStatus,
    SUSPENDED: 'suspended' as SubscriptionStatus,
    CANCELLED: 'cancelled' as SubscriptionStatus,
    PENDING:   'pending'   as SubscriptionStatus,
    TRIAL:     'trial'     as SubscriptionStatus,
  },

  GRACE_PERIOD_DAYS:        7,
  PAYMENT_DEADLINE_HOURS:   24,
  RENEWAL_REMINDER_DAYS:    [7, 3, 1],

  // ─── Utilitaires ──────────────────────────────────────────────

  getPlan(planName: PlanName): Plan | null {
    return SUBSCRIPTION_CONFIG.PLANS[planName] || null;
  },

  getPlanPrice(planName: PlanName, billingCycle: 'monthly' | 'annual' = 'monthly'): number | null {
    const plan = SUBSCRIPTION_CONFIG.PLANS[planName];
    return plan ? plan.pricing[billingCycle] : null;
  },

  getPlanCommission(planName: PlanName): number {
    const plan = SUBSCRIPTION_CONFIG.PLANS[planName];
    return plan ? plan.commission : SUBSCRIPTION_CONFIG.DEFAULT_COMMISSION;
  },

  calculateAnnualSavings(planName: PlanName): number {
    const plan = SUBSCRIPTION_CONFIG.PLANS[planName];
    if (!plan) return 0;
    return (plan.pricing.monthly * 12) - plan.pricing.annual;
  },

  getPlanFeatures(planName: PlanName): PlanFeatures | null {
    const plan = SUBSCRIPTION_CONFIG.PLANS[planName];
    return plan ? plan.features : null;
  },
};

export default SUBSCRIPTION_CONFIG;
