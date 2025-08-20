// Import copy packs data
const copyPacksData = {
  modules: {
    flights: {
      agent_offer: {
        "1": [
          {text: "We have {offer} for {airline} {flight_no}. Can you approve?", w: 3, tone: "informative"},
          {text: "Customer is ready at {offer} for {airline} {flight_no}. Review?", w: 2, tone: "informative"},
          {text: "Requesting approval at {offer} for {airline} {flight_no}.", w: 1, tone: "informative"},
          {text: "Price request: {offer} for {airline} {flight_no}. Possible?", w: 2, tone: "informative"},
          {text: "Can we secure {airline} {flight_no} for {offer}?", w: 1, tone: "informative"}
        ],
        "2": [
          {text: "Following up—{offer} for {airline} {flight_no}. Any flex?", w: 3, tone: "persuasive"},
          {text: "Re-check at {offer} for {airline} {flight_no}. Can we make this work?", w: 2, tone: "persuasive"},
          {text: "Second attempt: {offer} for {airline} {flight_no}. Room to move?", w: 2, tone: "persuasive"}
        ],
        "3": [
          {text: "Final try—{offer} for {airline} {flight_no}. Possible to approve?", w: 3, tone: "urgent"},
          {text: "One last pass at {offer} for {airline} {flight_no}.", w: 2, tone: "urgent"},
          {text: "Last chance: {offer} for {airline} {flight_no}. Yes or no?", w: 2, tone: "urgent"}
        ]
      },
      supplier_check: {
        any: [
          {text: "Listed at {base}. Checking now…", w: 3},
          {text: "Published is {base}. Checking inventory…", w: 2},
          {text: "Current listed fare {base}. Verifying now…", w: 2},
          {text: "{base} is what I see. Let me review…", w: 1}
        ]
      },
      supplier_counter: {
        accepted: [
          {text: "I can do {counter}.", w: 3},
          {text: "Approved at {counter}.", w: 2},
          {text: "Yes, {counter} works.", w: 2}
        ],
        counter: [
          {text: "Best I can return now is {counter}.", w: 3},
          {text: "I can offer {counter}.", w: 2},
          {text: "How about {counter}?", w: 2}
        ]
      },
      agent_user_confirm: {
        any: [
          {text: "Let me check with you if you want it.", w: 3},
          {text: "I can lock this in now if you'd like.", w: 2},
          {text: "Shall I secure this price for you?", w: 2}
        ]
      }
    },
    hotels: {
      agent_offer: {
        "1": [
          {text: "We have {offer} for {hotel_name}. Can you approve?", w: 3},
          {text: "Customer is ready at {offer} for {hotel_name}. Review?", w: 2}
        ],
        "2": [
          {text: "Following up—{offer} for {hotel_name}. Any flex?", w: 3}
        ],
        "3": [
          {text: "Final try—{offer} for {hotel_name}. Possible to approve?", w: 3}
        ]
      },
      supplier_check: {
        any: [
          {text: "Listed at {base}. Checking now…", w: 3},
          {text: "Current room rate {base}. Verifying now…", w: 2}
        ]
      },
      supplier_counter: {
        accepted: [
          {text: "I can do {counter}.", w: 3}
        ],
        counter: [
          {text: "Best I can return now is {counter}.", w: 3}
        ]
      },
      agent_user_confirm: {
        any: [
          {text: "Let me check with you if you want it.", w: 3}
        ]
      }
    },
    sightseeing: {
      agent_offer: {
        "1": [
          {text: "We have {offer} for {tour_name}. Can you approve?", w: 3}
        ],
        "2": [
          {text: "Following up—{offer} for {tour_name}. Any flex?", w: 3}
        ],
        "3": [
          {text: "Final try—{offer} for {tour_name}. Possible to approve?", w: 3}
        ]
      },
      supplier_check: {
        any: [
          {text: "Listed at {base}. Checking now…", w: 3}
        ]
      },
      supplier_counter: {
        accepted: [
          {text: "I can do {counter}.", w: 3}
        ],
        counter: [
          {text: "Best I can return now is {counter}.", w: 3}
        ]
      },
      agent_user_confirm: {
        any: [
          {text: "Let me check with you if you want it.", w: 3}
        ]
      }
    },
    transfers: {
      agent_offer: {
        "1": [
          {text: "We have {offer} for transfer. Can you approve?", w: 3}
        ],
        "2": [
          {text: "Following up—{offer} for transfer. Any flex?", w: 3}
        ],
        "3": [
          {text: "Final try—{offer} for transfer. Possible to approve?", w: 3}
        ]
      },
      supplier_check: {
        any: [
          {text: "Listed at {base}. Checking now…", w: 3}
        ]
      },
      supplier_counter: {
        accepted: [
          {text: "I can do {counter}.", w: 3}
        ],
        counter: [
          {text: "Best I can return now is {counter}.", w: 3}
        ]
      },
      agent_user_confirm: {
        any: [
          {text: "Let me check with you if you want it.", w: 3}
        ]
      }
    }
  }
};

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
      'agent_user_confirm': 'Let me check with you if you want it.'
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

// Helper function for easy use
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
