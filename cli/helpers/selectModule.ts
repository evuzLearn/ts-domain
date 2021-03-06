import * as p from 'path';
import { prompt, Questions } from 'inquirer';

import { readDir, isDirectory, exist } from '../utils/fs';
import { ISelectModule } from './types';
import { emptyValidator } from '../utils/validators/empty';

function questions(choices = []): Questions {
  const input = {
    type: 'input',
    name: 'module',
    message: 'Enter the name of the new module:',
    validate: emptyValidator,
  };
  if (!choices.length) {
    return [input];
  }
  const list = {
    type: 'list',
    name: 'module',
    message: 'Choose the module: ',
    choices: [...choices, 'new'],
  };
  return [list, { ...input, when: ({ module }) => module === 'new' }];
}

export function selectModule({ path }: ISelectModule): Promise<string> {
  return exist({ path })
    .then(existPath => {
      if (!existPath) {
        return [];
      }
      return readDir({ path });
    })
    .then(directories => {
      return Promise.all(directories.map(directory => isDirectory({ filePath: p.join(path, directory) }))).then(
        results => {
          return results.reduce((acc, r, i) => {
            if (r) {
              acc.push(directories[i]);
            }
            return acc;
          }, []);
        },
      );
    })
    .then(directories => {
      return prompt(questions(directories)).then(({ module }) => module);
    });
}
