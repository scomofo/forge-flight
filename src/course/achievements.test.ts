import test from "node:test";
import assert from "node:assert/strict";
import { BADGES, useAchievements } from "./achievements.ts";
import { useAudioStore } from "../lib/audio.ts";

test("BADGES catalog contains 7 uniquely identified engineering milestones", () => {
  assert.equal(BADGES.length, 7);
  const ids = new Set(BADGES.map((b) => b.id));
  assert.equal(ids.size, 7);
});

test("useAchievements store unlocks new badges and manages state", () => {
  const store = useAchievements.getState();
  store.clearNewlyUnlocked();

  assert.equal(store.newlyUnlocked, null);
  store.unlockBadge("first_flight");

  const updated = useAchievements.getState();
  assert.ok(updated.unlockedBadges.includes("first_flight"));
  assert.equal(updated.newlyUnlocked, "first_flight");

  updated.clearNewlyUnlocked();
  assert.equal(useAchievements.getState().newlyUnlocked, null);
});

test("useAudioStore toggles sound settings correctly", () => {
  const store = useAudioStore.getState();
  const initial = store.enabled;

  store.toggleSound();
  assert.equal(useAudioStore.getState().enabled, !initial);

  store.setEnabled(true);
  assert.equal(useAudioStore.getState().enabled, true);
});
