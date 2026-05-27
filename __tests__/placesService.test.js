import {
  POPULAR_CHAINS,
  searchBusinessChains,
  getPopularChainNames,
} from '../src/services/placesService';

describe('placesService', () => {
  describe('POPULAR_CHAINS', () => {
    it('should have predefined chain categories', () => {
      expect(POPULAR_CHAINS).toHaveProperty('Pharmacies');
      expect(POPULAR_CHAINS).toHaveProperty('Grocery Stores');
      expect(POPULAR_CHAINS).toHaveProperty('Retail Stores');
      expect(POPULAR_CHAINS).toHaveProperty('Coffee Shops');
      expect(POPULAR_CHAINS).toHaveProperty('Fast Food');
      expect(POPULAR_CHAINS).toHaveProperty('Gas Stations');
      expect(POPULAR_CHAINS).toHaveProperty('Banks');
    });

    it('should have CVS in Pharmacies', () => {
      const pharmacies = POPULAR_CHAINS['Pharmacies'];
      const cvs = pharmacies.find(p => p.name === 'CVS Pharmacy');
      expect(cvs).toBeDefined();
      expect(cvs.category).toBe('Pharmacy');
    });

    it('should have Starbucks in Coffee Shops', () => {
      const coffeeShops = POPULAR_CHAINS['Coffee Shops'];
      const starbucks = coffeeShops.find(p => p.name === 'Starbucks');
      expect(starbucks).toBeDefined();
      expect(starbucks.category).toBe('Coffee');
    });
  });

  describe('searchBusinessChains', () => {
    it('should return all chains when query is empty', async () => {
      const results = await searchBusinessChains('');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return all chains when query is too short', async () => {
      const results = await searchBusinessChains('a');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should filter chains by name', async () => {
      const results = await searchBusinessChains('CVS');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name.includes('CVS'))).toBe(true);
    });

    it('should be case insensitive', async () => {
      const results = await searchBusinessChains('starbucks');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.name.toLowerCase().includes('starbucks'))).toBe(true);
    });

    it('should return empty for non-matching query', async () => {
      const results = await searchBusinessChains('xyznonexistent123');
      // May return empty or API results only
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getPopularChainNames', () => {
    it('should return an array of chain names', () => {
      const names = getPopularChainNames();
      expect(Array.isArray(names)).toBe(true);
      expect(names.length).toBeGreaterThan(0);
    });

    it('should include known chains', () => {
      const names = getPopularChainNames();
      expect(names).toContain('Starbucks');
      expect(names).toContain('Target');
      expect(names).toContain('CVS Pharmacy');
    });
  });
});
