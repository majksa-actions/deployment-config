import { test, vi } from 'vitest';
import { fs, vol } from 'memfs';

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

test('Create 2 manifest from given input', async ({ expect }) => {
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
  const { createManifests } = await import('./manifest');

  await createManifests('./input', './output-1', 'prod');
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

test('Merging yaml files', async ({ expect }) => {
  const { mergeFiles } = await import('./manifest');
  const result = mergeFiles([
    `
        version: "1.0"
        deploy:
            replicas: 1
        `,
    `
        deploy:
            replicas: 3
        `,

    `
            ports:
                - 80
        `,

    `
            ports:
                - 443
        `,
  ]);
  expect(result).toEqual(`version: "1.0"
deploy:
  replicas: 3
ports:
  - 80
  - 443
`);
});
