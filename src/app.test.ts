import { fs, vol } from 'memfs';
import { test, vi } from 'vitest';
import { run } from './app';
import { parse } from 'yaml';

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

test('E2E: Create 2 manifest from given input', async ({ expect }) => {
  prepareMocks();
  vol.fromJSON({
    './input/application.yml': `
    version: "1.0"
    deploy:
      replicas: 1
    `,
    './input/application-prod.yml': `
    deploy:
        replicas: 3
    `,
    './input/fe/application.yml': `
    name: fe
    `,
    './input/be/application.yml': `
    name: be
    `,
  });

  process.env.INPUT_SOURCE = './input';
  process.env.INPUT_TARGET = './output-1';
  process.env.INPUT_ENVIRONMENT = 'prod';

  await run();

  const result = fs.readdirSync('./output-1');
  expect(result).toEqual(['manifest-be.yml', 'manifest-fe.yml']);
  expect(fs.readFileSync('./output-1/manifest-be.yml', 'utf-8')).toEqual(
    `version: "1.0"
deploy:
  replicas: 3
name: be
`,
  );
  expect(fs.readFileSync('./output-1/manifest-fe.yml', 'utf-8')).toEqual(
    `version: "1.0"
deploy:
  replicas: 3
name: fe
`,
  );
});

test('E2E: Provide invalid input', async ({ expect }) => {
  prepareMocks();
  vol.fromJSON({});

  process.env.INPUT_SOURCE = './unknown-directory';
  process.env.INPUT_TARGET = './output-1';
  process.env.INPUT_ENVIRONMENT = 'prod';

  await run();

  expect(fs.existsSync('./output-1')).toEqual(false);
});

test('E2E: Provide invalid yaml', async ({ expect }) => {
  prepareMocks();
  vol.fromJSON({
    './error-input/fe/application.yml': "'",
  });

  process.env.INPUT_SOURCE = './error-input';
  process.env.INPUT_TARGET = './output-1';
  process.env.INPUT_ENVIRONMENT = 'prod';

  await run();

  expect(fs.existsSync('./output-1/manifest-fe.yml')).toEqual(false);
});
