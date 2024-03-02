import * as core from '@actions/core';
import * as C from './constants';
import { createManifests } from './utils/manifest';

/**
 * GitHub Action entrypoint.
 */
export const run = async () => {
  try {
    const source: string = core.getInput(C.INPUT_SOURCE);
    core.debug(`${C.INPUT_SOURCE}: ${source}`);

    const target: string = core.getInput(C.INPUT_TARGET);
    core.debug(`${C.INPUT_TARGET}: ${target}`);

    const environment: string = core.getInput(C.INPUT_ENVIRONMENT);
    core.debug(`${C.INPUT_ENVIRONMENT}: ${environment}`);

    await createManifests(source, target, environment);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else core.setFailed(String(error));
  }
};
