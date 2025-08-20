// Import enhanced copy packs data
import copyPacksData from '../../api/data/copy_packs.json';

export interface CopyVariant {
  text: string;
  w: number;
  tone?: string;
  key?: string;
}

export interface CopyVariantSelector {
  chooseVariant: (
    module: 'flights' | 'hotels' | 'sightseeing' | 'transfers',
    beatType: 'agent_offer' | 'supplier_check' | 'supplier_counter' | 'agent_user_confirm',
    attemptNo: number,
    status?: 'accepted' | 'counter',
    sessionUsed?: Set<string>,
    userRecent?: string[]
  ) => CopyVariant;
  
  fillTemplate: (
    template: string,
    variables: Record<string, any>
  ) => string;

  getBrandString: (key: string) => string;
  
  getFallback: (
    type: 'network_retry' | 'price_refresh' | 'expired',
    speaker: 'agent' | 'supplier'
  ) => CopyVariant;
}

class CopyVariantSelectorImpl implements CopyVariantSelector {
  private copyData: any;

  constructor() {
    this.copyData = copyPacksData;
  }

  chooseVariant(
    module: 'flights' | 'hotels' | 'sightseeing' | 'transfers',
    beatType: 'agent_offer' | 'supplier_check' | 'supplier_counter' | 'agent_user_confirm',
    attemptNo: number = 1,
    status: 'accepted' | 'counter' = 'counter',
    sessionUsed: Set<string> = new Set(),
    userRecent: string[] = []
  ): CopyVariant {
    try {
      const moduleData = this.copyData.modules[module];
      if (!moduleData) {
        return this.fallbackVariant(beatType);
      }

      const beatData = moduleData[beatType];
      if (!beatData) {
        return this.fallbackVariant(beatType);
      }

      let variants: CopyVariant[] = [];

      // For supplier_counter, use status-specific variants if available
      if (beatType === 'supplier_counter' && beatData[status]) {
        variants = beatData[status];
      } 
      // For agent_offer, use attempt-specific variants
      else if (beatType === 'agent_offer') {
        const attemptKey = Math.min(attemptNo, 3).toString();
        variants = beatData[attemptKey] || beatData['1'] || beatData['any'] || [];
      }
      // For other beats, use 'any' variants
      else {
        variants = beatData['any'] || [];
      }

      if (!variants.length) {
        return this.fallbackVariant(beatType);
      }

      // Add keys to variants for tracking
      const variantsWithKeys = variants.map((variant, index) => ({
        ...variant,
        key: `${module}|${beatType}|${attemptNo}|${status}|${index}`
      }));

      // Filter out recently used variants
      const availableVariants = variantsWithKeys.filter(
        v => !sessionUsed.has(v.key!) && !userRecent.includes(v.key!)
      );

      // If all variants were used, use the full set but prefer unused in session
      const finalPool = availableVariants.length > 0 
        ? availableVariants 
        : variantsWithKeys.filter(v => !sessionUsed.has(v.key!));
      
      const poolToUse = finalPool.length > 0 ? finalPool : variantsWithKeys;

      // Weighted random selection
      const totalWeight = poolToUse.reduce((sum, variant) => sum + (variant.w || 1), 0);
      let random = Math.random() * totalWeight;

      for (const variant of poolToUse) {
        random -= (variant.w || 1);
        if (random <= 0) {
          return variant;
        }
      }

      // Fallback to first variant
      return poolToUse[0] || this.fallbackVariant(beatType);

    } catch (error) {
      console.error('Error choosing copy variant:', error);
      return this.fallbackVariant(beatType);
    }
  }

  fillTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    // Replace placeholders with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const displayValue = this.formatValue(value);
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), displayValue);
    });

    return result;
  }

  getBrandString(key: string): string {
    try {
      return this.copyData.brand[key] || key;
    } catch (error) {
      console.error('Error getting brand string:', error);
      return key;
    }
  }

  getFallback(
    type: 'network_retry' | 'price_refresh' | 'expired',
    speaker: 'agent' | 'supplier' = 'agent'
  ): CopyVariant {
    try {
      const fallbacks = this.copyData.fallbacks[type];
      if (!fallbacks) {
        return this.fallbackVariant(`fallback_${type}`);
      }

      const speakerFallbacks = fallbacks[speaker] || fallbacks['agent'] || [];
      if (!speakerFallbacks.length) {
        return this.fallbackVariant(`fallback_${type}`);
      }

      // Weighted selection for fallbacks
      const totalWeight = speakerFallbacks.reduce((sum: number, variant: any) => sum + (variant.w || 1), 0);
      let random = Math.random() * totalWeight;

      for (const variant of speakerFallbacks) {
        random -= (variant.w || 1);
        if (random <= 0) {
          return {
            ...variant,
            key: `fallback|${type}|${speaker}|${speakerFallbacks.indexOf(variant)}`
          };
        }
      }

      return {
        ...speakerFallbacks[0],
        key: `fallback|${type}|${speaker}|0`
      };

    } catch (error) {
      console.error('Error getting fallback:', error);
      return this.fallbackVariant(`fallback_${type}`);
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'object') {
      // Handle nested objects gracefully
      if (value.toString && typeof value.toString === 'function') {
        const str = value.toString();
        return str === '[object Object]' ? JSON.stringify(value) : str;
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  }

  private fallbackVariant(beatType: string): CopyVariant {
    const fallbacks: Record<string, string> = {
      'agent_offer': 'We have your offer. Can you approve?',
      'supplier_check': 'Checking availability...',
      'supplier_counter': 'Here\'s our best offer.',
      'agent_user_confirm': 'Let me check with you if you want it.',
      'fallback_network_retry': 'Connection issue. Retrying...',
      'fallback_price_refresh': 'Updating prices...',
      'fallback_expired': 'Session expired. Please search again.'
    };

    return {
      text: fallbacks[beatType] || 'Processing your request...',
      w: 1,
      key: `fallback|${beatType}`
    };
  }
}

// Singleton instance
export const copyVariantSelector: CopyVariantSelector = new CopyVariantSelectorImpl();

// Helper function for easy use with enhanced features
export function getCopyVariant(
  module: 'flights' | 'hotels' | 'sightseeing' | 'transfers',
  beatType: 'agent_offer' | 'supplier_check' | 'supplier_counter' | 'agent_user_confirm',
  attemptNo: number = 1,
  status: 'accepted' | 'counter' = 'counter',
  variables: Record<string, any> = {},
  sessionUsed: Set<string> = new Set(),
  userRecent: string[] = []
): { text: string; key: string } {
  const variant = copyVariantSelector.chooseVariant(
    module, 
    beatType, 
    attemptNo, 
    status, 
    sessionUsed, 
    userRecent
  );
  
  const filledText = copyVariantSelector.fillTemplate(variant.text, variables);
  
  return {
    text: filledText,
    key: variant.key || `${module}|${beatType}|${attemptNo}`
  };
}

// Helper function for brand strings
export function getBrandString(key: string): string {
  return copyVariantSelector.getBrandString(key);
}

// Helper function for fallbacks
export function getFallbackVariant(
  type: 'network_retry' | 'price_refresh' | 'expired',
  speaker: 'agent' | 'supplier' = 'agent',
  variables: Record<string, any> = {}
): { text: string; key: string } {
  const variant = copyVariantSelector.getFallback(type, speaker);
  const filledText = copyVariantSelector.fillTemplate(variant.text, variables);
  
  return {
    text: filledText,
    key: variant.key || `fallback|${type}|${speaker}`
  };
}

// Enhanced helper with automatic currency formatting
export function getCopyVariantWithCurrency(
  module: 'flights' | 'hotels' | 'sightseeing' | 'transfers',
  beatType: 'agent_offer' | 'supplier_check' | 'supplier_counter' | 'agent_user_confirm',
  attemptNo: number = 1,
  status: 'accepted' | 'counter' = 'counter',
  variables: Record<string, any> = {},
  sessionUsed: Set<string> = new Set(),
  userRecent: string[] = [],
  formatPrice?: (amount: number) => string
): { text: string; key: string } {
  // Auto-format price variables if formatter provided
  const processedVariables = { ...variables };
  if (formatPrice) {
    Object.keys(processedVariables).forEach(key => {
      if (typeof processedVariables[key] === 'number' && 
          ['offer', 'base', 'counter', 'final_price'].includes(key)) {
        processedVariables[key] = formatPrice(processedVariables[key]);
      }
    });
  }

  return getCopyVariant(
    module,
    beatType,
    attemptNo,
    status,
    processedVariables,
    sessionUsed,
    userRecent
  );
}
