import { existsSync, promises as fs, readdirSync } from 'fs';
import deepmerge from 'deepmerge';
import * as YAML from 'yaml';

export const createManifests = async (source: string, target: string, environment: string) => {
  await fs.mkdir(target, { recursive: true });
  for (const app of readdirSync(source)) {
    if ((await fs.stat(`${source}/${app}`)).isDirectory()) {
      const content = await createManifest(source, app, environment);
      await fs.writeFile(`${target}/manifest-${app}.yml`, content);
    }
  }
};

export const createManifest = async (source: string, application: string, environment: string): Promise<string> => {
  const sources = generateSources(source, application, environment);
  const contents = await readFiles(sources);
  return mergeFiles(contents);
};

export const generateSources = (source: string, application: string, environment: string): string[] =>
  [
    'application.yml',
    'application.yaml',
    `application-${environment}.yml`,
    `application-${environment}.yaml`,
    `${application}/application.yml`,
    `${application}/application.yaml`,
    `${application}/application-${environment}.yml`,
    `${application}/application-${environment}.yaml`,
  ].map((file) => `${source}/${file}`);

export const readFiles = async (sources: string[]): Promise<string[]> =>
  await Promise.all(
    sources
      .filter((source) => existsSync(source) && fs.stat(source).then((stat) => stat.isFile()))
      .map((source) => fs.readFile(source, 'utf-8')),
  );

export const mergeFiles = (contents: string[]): string =>
  YAML.stringify(deepmerge.all(contents.map((content) => YAML.parse(content))));
