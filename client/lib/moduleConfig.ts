import React from 'react';
import { Plane, Building, MapPin, Car } from 'lucide-react';

export type ModuleType = 'flights' | 'hotels' | 'sightseeing' | 'transfers';

export interface RoleConfig {
  label: string;
  bubbleClasses: string;
  priceVariant: 'emerald' | 'slate' | 'white';
}

export interface ModuleConfig {
  icon: React.ReactElement;
  supplierName: string;
  roles: {
    agent: RoleConfig;
    supplier: RoleConfig;
  };
}

export const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  flights: {
    icon: React.createElement(Plane, { className: "w-4 h-4" }),
    supplierName: 'Airline',
    roles: {
      agent: {
        label: 'Faredown Agent',
        bubbleClasses: 'bg-emerald-600 text-white',
        priceVariant: 'white'
      },
      supplier: {
        label: 'Airline',
        bubbleClasses: 'bg-blue-600 text-white',
        priceVariant: 'white'
      }
    }
  },
  hotels: {
    icon: React.createElement(Building, { className: "w-4 h-4" }),
    supplierName: 'Hotel',
    roles: {
      agent: {
        label: 'Faredown Agent',
        bubbleClasses: 'bg-emerald-600 text-white',
        priceVariant: 'white'
      },
      supplier: {
        label: 'Hotel',
        bubbleClasses: 'bg-purple-600 text-white',
        priceVariant: 'white'
      }
    }
  },
  sightseeing: {
    icon: React.createElement(MapPin, { className: "w-4 h-4" }),
    supplierName: 'Tour Provider',
    roles: {
      agent: {
        label: 'Faredown Agent',
        bubbleClasses: 'bg-emerald-600 text-white',
        priceVariant: 'white'
      },
      supplier: {
        label: 'Sightseeing',
        bubbleClasses: 'bg-orange-500 text-white',
        priceVariant: 'white'
      }
    }
  },
  transfers: {
    icon: React.createElement(Car, { className: "w-4 h-4" }),
    supplierName: 'Transport Provider',
    roles: {
      agent: {
        label: 'Faredown Agent',
        bubbleClasses: 'bg-emerald-600 text-white',
        priceVariant: 'white'
      },
      supplier: {
        label: 'Transfer',
        bubbleClasses: 'bg-cyan-600 text-white',
        priceVariant: 'white'
      }
    }
  }
};

export function getModuleConfig(moduleType: ModuleType): ModuleConfig {
  return MODULE_CONFIGS[moduleType];
}
