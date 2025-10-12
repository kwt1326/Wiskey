#!/usr/bin/env node

/**
 * Simple script to test API integration
 * Run with: npx tsx scripts/test-api-integration.ts
 */

import { apiClient } from '../lib/api-client';

async function testAPIIntegration() {
  console.log('🧪 Testing API Integration...\n');
  
  try {
    // Test 1: Health check (assuming there's a health endpoint)
    console.log('1. Testing API connection...');
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        const health = await response.json();
        console.log('✅ API is running:', health);
      } else {
        console.log('❌ API health check failed');
        return;
      }
    } catch (error) {
      console.log('❌ Cannot connect to API. Make sure backend is running on http://localhost:3001');
      console.log('   Run: cd backend && npm run start:dev');
      return;
    }

    // Test 2: Get all bounties
    console.log('\n2. Testing bounty endpoints...');
    try {
      const bounties = await apiClient.getAllBounties({ limit: 5 });
      console.log('✅ Successfully fetched bounties:', bounties.length, 'items');
    } catch (error) {
      console.log('❌ Failed to fetch bounties:', error.message);
    }

    // Test 3: Get all users
    console.log('\n3. Testing user endpoints...');
    try {
      const users = await apiClient.getAllUsers();
      console.log('✅ Successfully fetched users:', users.length, 'items');
    } catch (error) {
      console.log('❌ Failed to fetch users:', error.message);
    }

    // Test 4: Test wallet connection (this will create a test user)
    console.log('\n4. Testing wallet connection...');
    const testWallet = '0x1234567890123456789012345678901234567890';
    try {
      const user = await apiClient.connectWallet(testWallet);
      console.log('✅ Successfully connected wallet:', user.walletAddress);
    } catch (error) {
      console.log('❌ Failed to connect wallet:', error.message);
    }

    console.log('\n🎉 API integration test completed!');
    console.log('\n📚 Next steps:');
    console.log('   1. Update your components to use the new React Query hooks');
    console.log('   2. Replace AppStateProvider with AppStateWithAPI');
    console.log('   3. See REACT_QUERY_INTEGRATION.md for detailed migration guide');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testAPIIntegration();
}

export { testAPIIntegration };