import { resolve } from 'path';
import { version } from '../package.json';
import { render, waitFor } from 'cli-testing-library';
import 'cli-testing-library/vitest';

var cliImportPath = '../bin/cli.js';
var command = [resolve(__dirname, cliImportPath)];

describe('Testing cli.js:', function () {
  describe('Getting version and help on usage:', function () {
    it('Get version --version', async function () {
      const { findByText } = await render('node', command.concat('--version'), {
        cwd: '.',
      });
      const instance = await findByText(version);
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });

    it('Get version -v', async function () {
      const { findByText } = await render('node', command.concat('-v'), {
        cwd: '.',
      });
      const instance = await findByText(version);
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });

    it('Get help when no arguments supplied', async function () {
      const { findByText } = await render('node', command, {
        cwd: '.',
      });
      const instance = await findByText(/^Usage: xml-js.*/);
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 1 }),
      );
    });

    it('Get help --help', async function () {
      const { findByText } = await render('node', command.concat('--help'), {
        cwd: '.',
      });
      const instance = await findByText('Usage: xml-js');
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });

    it('Get help -h', async function () {
      const { findByText } = await render('node', command.concat('-h'), {
        cwd: '.',
      });
      const instance = await findByText('Usage: xml-js');
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });
  });

  describe('Convert XML:', function () {
    it('should convert xml file', async function () {
      const { findByText } = await render(
        'node',
        command.concat(resolve(__dirname, '../bin/test.xml')),
        {
          cwd: '.',
        },
      );
      const instance = await findByText(
        '{"elements":[{"type":"element","name":"a","attributes":{"x":"1"},"elements":[{"type":"element","name":"b","elements":[{"type":"text","text":"bye!"}]}]}]}',
      );
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });

    it('should convert xml file, --compact', async function () {
      const { findByText } = await render(
        'node',
        command.concat(resolve(__dirname, '../bin/test.xml'), '--compact'),
        {
          cwd: '.',
        },
      );
      const instance = await findByText(
        '{"a":{"_attributes":{"x":"1"},"b":{"_text":"bye!"}}}',
      );
      expect(instance).toBeInTheConsole();
      await waitFor(() =>
        expect(instance.hasExit()).toMatchObject({ exitCode: 0 }),
      );
    });
  });
});
