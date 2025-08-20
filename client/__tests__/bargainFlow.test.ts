// __tests__/bargainFlow.test.ts
import { chooseVariant } from '@/lib/copySelector';
import copyPack from '../../api/data/copy_packs.json';

test('three attempts yield different counter lines and no repeats in-session', () => {
  const used = new Set<string>();
  const ph = { offer:'₹20,000', base:'₹22,650', counter:'₹21,000', airline:'IndiGo', flight_no:'6E 1407', hotel_name: '', city: '', tour_name: '', pickup: '', dropoff: '' };

  const v1 = chooseVariant(copyPack, { module:'flights', beat:'supplier_counter', attempt:1, sessionUsedKeys:used, placeholders:ph });
  const v2 = chooseVariant(copyPack, { module:'flights', beat:'supplier_counter', attempt:2, sessionUsedKeys:used, placeholders:ph });
  const v3 = chooseVariant(copyPack, { module:'flights', beat:'supplier_counter', attempt:3, sessionUsedKeys:used, placeholders:ph });

  expect(new Set([v1.key, v2.key, v3.key]).size).toBe(3); // no duplicates
  expect(v1.text).toMatch(/₹/);
  expect(v2.text).toMatch(/₹/);
  expect(v3.text).toMatch(/₹/);
});

test('copy selector fills placeholders correctly', () => {
  const used = new Set<string>();
  const ph = { 
    offer: '₹20,000', 
    airline: 'IndiGo', 
    flight_no: '6E 1407',
    base: '₹22,650',
    counter: '₹21,000',
    hotel_name: '',
    city: '',
    tour_name: '',
    pickup: '',
    dropoff: ''
  };

  const variant = chooseVariant(copyPack, { 
    module: 'flights', 
    beat: 'agent_offer', 
    attempt: 1, 
    sessionUsedKeys: used, 
    placeholders: ph 
  });

  // Should contain the airline and offer
  expect(variant.text).toMatch(/IndiGo|6E 1407|₹20,000/);
  // Should not contain unfilled placeholders
  expect(variant.text).not.toMatch(/\{.*\}/);
});
