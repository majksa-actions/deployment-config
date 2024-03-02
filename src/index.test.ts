import { fs, vol } from 'memfs';
import { test, vi } from 'vitest';

const prepareMocks = () => {
  vi.mock('fs', () => ({
    ...fs,
    default: () => fs,
  }));
  vi.mock('fs/promises', () => ({
    default: fs.promises,
  }));

  vol.reset();
};

test('E2E: Try running app', async ({ expect }) => {
  prepareMocks();
  vol.fromJSON({});

  process.env.INPUT_SOURCE = './unknown-directory';
  process.env.INPUT_TARGET = './output-1';
  process.env.INPUT_ENVIRONMENT = 'prod';

  await import('./index');

  expect(fs.existsSync('./output-1')).toEqual(false);
});
