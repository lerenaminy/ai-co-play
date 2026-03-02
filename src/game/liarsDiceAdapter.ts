// src/game/liarsDiceAdapter.ts
import { GameAdapter, GameState } from '../types';
import { LiarsDiceState, createLiarsDiceInitialState, applyLiarsDiceRound } from './liarsDiceEngine';

export const liarsDiceAdapter: GameAdapter = {
  getInitialState: (): LiarsDiceState => createLiarsDiceInitialState(),

  listLegalActions: (state: GameState): string[] => {
    const s = state as LiarsDiceState;
    const actions: string[] = [];

    // If it's bidding phase, can BID or CHALLENGE (if there's a previous bid)
    if (s.gamePhase === 'bidding') {
      // Generate all valid bids
      for (let qty = 1; qty <= 6; qty++) {
        for (let face = 1; face <= 6; face++) {
          // Check if this is a valid escalation
          if (!s.currentBid) {
            // First bid - allow any
            actions.push(`BID_${qty}_${face}`);
          } else {
            // Must be higher than current bid
            if (face > s.currentBid.faceValue || (face === s.currentBid.faceValue && qty > s.currentBid.quantity)) {
              actions.push(`BID_${qty}_${face}`);
            }
          }
        }
      }

      // Can challenge if there's a bid
      if (s.currentBid) {
        actions.push('CHALLENGE');
      }
    }

    return actions;
  },

  applyRound: (state: GameState, humanAction: string, aiAction: string): GameState => {
    return applyLiarsDiceRound(state as LiarsDiceState, humanAction, aiAction);
  }
};
