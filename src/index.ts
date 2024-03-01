import * as core from '@actions/core';
import * as C from './constants';
import { greet } from './utils/greeting';

/**
 * GitHub Action entrypoint.
 */
async function run(): Promise<void> {
  try {
    const name: string = core.getInput(C.INPUT_NAME) || C.DEFAULT_NAME;
    core.debug(`${C.INPUT_NAME}: ${name}`);

    const greeting = greet(name);

    core.setOutput(C.OUTPUT_GREETING, greeting);
    core.notice(greeting, { title: 'Greeting' });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else core.setFailed(String(error));
  }
}

run();
