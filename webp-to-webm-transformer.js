import { exec as execChildProcess } from 'child_process';
import { promises as fsPromises, existsSync, mkdirSync, rmdirSync, rmSync } from 'fs';
import { basename, isAbsolute, resolve } from 'path';
import { promisify } from 'util';

const exec = promisify(execChildProcess);

const terminateWithError = (error = '[fatal] error') => {
  console.log(error);
  process.exit(1);
};

const params = process.argv.slice(2);
if (!params[0]) terminateWithError('[fatal] need file name or absolute path');

const deleteOriginal = params[1] === 'true';
const filename = isAbsolute(params[0]) ? basename(params[0]) : params[0];

if (deleteOriginal) console.log('[info] will delete original when successful');

const nameWithoutExt = filename.replace('.webp', '');
const frames = resolve(process.cwd(), 'frames');

if (existsSync(frames)) rmdirSync(frames, { recursive: true });
mkdirSync(frames);

process.chdir('frames');
console.log('[info]', process.cwd());

console.log('[info]', `anim_dump ../${filename}`);
exec(`anim_dump ../${filename}`)
  .then(() => {
    process.chdir('..');
    console.log('[info]', process.cwd());

    const command = `webpmux -info ./${filename}`;

    console.log('[info]', command);
    return exec(command);
  })
  .then(({ stdout, stderr }) => {
    if (stderr) return Promise.reject(stderr);

    const isAnimation = stdout.match(/Features present: animation/) !== null;
    if (!isAnimation) return Promise.reject('This is not an animated webp file');

    const firstLine = stdout.match(/1:.+[\r]?\n/g);
    if (!firstLine) return;

    const frameLength = firstLine[0].split(/\s+/g)[6];
    const framerate = Math.round(1000 / frameLength); // frames/second
    const dump = resolve(frames, 'dump_%04d.png');
    const command = `ffmpeg -framerate ${framerate} -i "${dump}" "${nameWithoutExt}.webm" -y`;

    console.log('[info]', command);
    return exec(command);
  })
  .then(({ stdout, stderr }) => {
    if (/error/gm.test(stderr)) return Promise.reject(stderr);

    // cleanup
    rmdirSync(frames, { recursive: true });
    if (deleteOriginal) rmSync(resolve(process.cwd(), filename));

    console.log('[info] Success!\n');
  })
  .catch(err => {
    terminateWithError(`[fatal] ${err}`);
    rmdirSync(frames, { recursive: true });
  });
