import { IBudgetBreakdown } from '../shared/types';

const TOLERANCE_PERCENT = 0.10; // 10% tolerance

/**
 * Recalculates the total from all line items in a budget breakdown.
 */
export function recalculateTotals(breakdown: Omit<IBudgetBreakdown, 'total'>): number {
  return (
    breakdown.accommodation +
    breakdown.food +
    breakdown.transportation +
    breakdown.activities +
    breakdown.shopping +
    breakdown.miscellaneous +
    breakdown.emergencyReserve
  );
}

/**
 * Validates that the budget breakdown is internally consistent
 * and doesn't exceed the trip's total budget by more than the tolerance.
 */
export function validateBudgetConsistency(
  breakdown: IBudgetBreakdown,
  totalBudget: number
): { valid: boolean; message?: string } {
  // Validate all fields are non-negative
  const fields: (keyof Omit<IBudgetBreakdown, 'total'>)[] = [
    'accommodation',
    'food',
    'transportation',
    'activities',
    'shopping',
    'miscellaneous',
    'emergencyReserve',
  ];

  for (const field of fields) {
    if (breakdown[field] < 0) {
      return {
        valid: false,
        message: `Budget field "${field}" cannot be negative (got ${breakdown[field]}).`,
      };
    }
  }

  // Check internal sum consistency
  const calculatedTotal = recalculateTotals(breakdown);
  const declaredTotal = breakdown.total;
  const sumDiff = Math.abs(calculatedTotal - declaredTotal);
  const sumTolerance = declaredTotal * TOLERANCE_PERCENT;

  if (sumDiff > sumTolerance + 1) {
    return {
      valid: false,
      message: `Budget total mismatch: declared ${declaredTotal}, but line items sum to ${calculatedTotal.toFixed(2)}.`,
    };
  }

  // Check against trip total budget
  if (totalBudget > 0) {
    const overBudgetAmount = calculatedTotal - totalBudget;
    const overBudgetTolerance = totalBudget * TOLERANCE_PERCENT;

    if (overBudgetAmount > overBudgetTolerance) {
      return {
        valid: false,
        message: `Generated itinerary budget (${calculatedTotal.toFixed(2)}) exceeds trip budget (${totalBudget}) by more than ${TOLERANCE_PERCENT * 100}%.`,
      };
    }
  }

  return { valid: true };
}
