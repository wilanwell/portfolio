import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveGestureAxis, settleProfileTurn } from '../src/lib/profile-interaction.ts';

test('tiny movements stay taps and vertical/diagonal swipes favour page scroll', () => {
  assert.equal(resolveGestureAxis(4, 6), 'pending');
  assert.equal(resolveGestureAxis(8, 30), 'vertical');
  assert.equal(resolveGestureAxis(20, 20), 'vertical');
  assert.equal(resolveGestureAxis(-35, 9), 'horizontal');
});
test('a short, slow drag returns to the same face', () => {
  assert.equal(settleProfileTurn(0, 40, 300, .1), 0);
  assert.equal(settleProfileTurn(1, -40, 300, -.1), 1);
});
test('long swipes flip once in either direction on phone and desktop cards', () => {
  assert.equal(settleProfileTurn(0, 70, 300, 0), 1);
  assert.equal(settleProfileTurn(0, -70, 300, 0), -1);
  assert.equal(settleProfileTurn(1, -80, 360, 0), 0);
});
test('a deliberate flick can complete a turn while touch jitter cannot', () => {
  assert.equal(settleProfileTurn(0, 22, 300, .8), 1);
  assert.equal(settleProfileTurn(0, -22, 300, -.8), -1);
  assert.equal(settleProfileTurn(0, 4, 300, 2), 0);
});
