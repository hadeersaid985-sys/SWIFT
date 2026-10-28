import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic functions for Finance & Sales Commissions

export function calculateCommission({
  achievedSales,
  target,
  baseRate,
  targetBonus,
  adjustment
}: {
  achievedSales: number;
  target: number;
  baseRate: number;
  targetBonus: number;
  adjustment: number;
}) {
  const baseAmount = Math.round((achievedSales * baseRate) / 100);
  const achievementRate = target > 0 ? (achievedSales / target) * 100 : 100;
  const isTargetAchieved = achievementRate >= 100;
  const bonus = isTargetAchieved ? targetBonus : 0;
  const total = baseAmount + bonus + adjustment;

  return {
    baseAmount,
    achievementRate: Math.round(achievementRate * 10) / 10,
    isTargetAchieved,
    bonus,
    total
  };
}

export function calculateRemainingContractBalance({
  totalContractValue,
  paidAmount
}: {
  totalContractValue: number;
  paidAmount: number;
}) {
  const remaining = Math.max(0, totalContractValue - paidAmount);
  const paymentRatio = totalContractValue > 0 ? (paidAmount / totalContractValue) * 100 : 100;
  const isFullyPaid = remaining === 0;

  return {
    remaining,
    paymentRatio: Math.round(paymentRatio * 10) / 10,
    isFullyPaid
  };
}

test('calculateCommission calculates base commission and target bonus correctly when target is met', () => {
  const result = calculateCommission({
    achievedSales: 150000,
    target: 100000,
    baseRate: 5,
    targetBonus: 3000,
    adjustment: 500
  });

  assert.equal(result.baseAmount, 7500);
  assert.equal(result.achievementRate, 150);
  assert.equal(result.isTargetAchieved, true);
  assert.equal(result.bonus, 3000);
  assert.equal(result.total, 11000);
});

test('calculateCommission omits bonus when target is not reached', () => {
  const result = calculateCommission({
    achievedSales: 80000,
    target: 100000,
    baseRate: 5,
    targetBonus: 3000,
    adjustment: 0
  });

  assert.equal(result.baseAmount, 4000);
  assert.equal(result.achievementRate, 80);
  assert.equal(result.isTargetAchieved, false);
  assert.equal(result.bonus, 0);
  assert.equal(result.total, 4000);
});

test('calculateRemainingContractBalance calculates remaining balance and full paid status', () => {
  const partial = calculateRemainingContractBalance({
    totalContractValue: 60000,
    paidAmount: 25000
  });

  assert.equal(partial.remaining, 35000);
  assert.equal(partial.paymentRatio, 41.7);
  assert.equal(partial.isFullyPaid, false);

  const full = calculateRemainingContractBalance({
    totalContractValue: 60000,
    paidAmount: 60000
  });

  assert.equal(full.remaining, 0);
  assert.equal(full.paymentRatio, 100);
  assert.equal(full.isFullyPaid, true);
});
