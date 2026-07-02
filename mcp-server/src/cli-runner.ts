import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { CliRunnerOptions, TrekkerResult } from './types.js';

const execFileAsync = promisify(execFile);

export async function runTrekker<T = unknown>(
  args: string[],
  options: CliRunnerOptions = {}
): Promise<TrekkerResult<T>> {
  const { cwd = process.cwd(), toon = true } = options;

  const fullArgs: string[] = [];
  if (toon) fullArgs.push('--toon');
  fullArgs.push(...args);

  try {
    const { stdout, stderr } = await execFileAsync('trekker', fullArgs, {
      cwd,
      timeout: 30000,
    });

    if (stderr) {
      console.error('trekker stderr:', stderr);
    }

    return { success: true, data: stdout as unknown as T };
  } catch (error) {
    const err = error as Error & { stderr?: string; code?: string };
    return {
      success: false,
      error: err.stderr || err.message || 'Unknown error',
    };
  }
}

export async function runTrekkerText(
  args: string[],
  options: CliRunnerOptions = {}
): Promise<TrekkerResult<string>> {
  return runTrekker<string>(args, options);
}
