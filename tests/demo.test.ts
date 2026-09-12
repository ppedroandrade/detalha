import test from 'node:test';
import assert from 'node:assert/strict';
import { seedData, emptyProjectData } from '../lib/seed';

test('demonstração mantém ambientes, itens e relacionamentos válidos', () => {
  assert.ok(seedData.environments.length);
  assert.ok(seedData.items.length);
  const ids = new Set(seedData.environments.map(e => e.id));
  assert.equal(new Set(seedData.items.map(i => i.id)).size, seedData.items.length);
  for (const item of seedData.items) assert.ok(ids.has(item.environmentId));
  assert.equal(emptyProjectData.items.length, 0);
});
