import assert from 'node:assert/strict';
import test from 'node:test';
import { curriculumBrowserOptions, withAuditPage } from './curriculum-browser-support.mjs';

test('default audit still includes both viewports and no filters', () => {
  const options = curriculumBrowserOptions();
  assert.equal(options.viewports.length, 2);
  assert.equal(options.curveread, false);
  assert.equal(options.repeat, 1);
  assert.equal(options.suffix, '');
});
test('desktop-only audit is explicit and separately reported', () => {
  const options = curriculumBrowserOptions(['--desktop']);
  assert.deepEqual(options.viewports, [['desktop', 1280, 900]]);
  assert.equal(options.suffix, '-desktop');
});
test('targeted curveread repetitions cannot masquerade as full coverage', () => {
  const options = curriculumBrowserOptions(['--desktop', '--curveread', '--repeat=100']);
  assert.equal(options.curveread, true);
  assert.equal(options.repeat, 100);
  assert.equal(options.suffix, '-desktop-curveread');
});
test('empty, unbounded, misspelled and ambiguous focused runs fail closed', () => {
  for (const args of [['--curveread'], ['--repeat=2'], ['--desktp'], ['--desktop', '--curveread', '--repeat=0'], ['--desktop', '--curveread', '--repeat=501'], ['--repeat=-1'], ['--repeat=1.5']]) {
    assert.throws(() => curriculumBrowserOptions(args));
  }
});

test('successive audit cases use different pages and always close them', async () => {
  const pages = [];
  const context = { newPage: async () => {
    const page = { closed: false, close: async () => { page.closed = true; } };
    pages.push(page);
    return page;
  } };
  const first = await withAuditPage(context, async page => page);
  const second = await withAuditPage(context, async page => page);
  assert.notEqual(first, second);
  assert.equal(pages.length, 2);
  assert.ok(pages.every(page => page.closed));
});
test('a failed audit case closes its page and is not retried or converted to success', async () => {
  let opened = 0, closed = 0, ran = 0;
  const context = { newPage: async () => { opened++; return { close: async () => { closed++; } }; } };
  await assert.rejects(withAuditPage(context, async () => { ran++; throw new Error('entry never rendered'); }), /entry never rendered/);
  assert.deepEqual({ opened, closed, ran }, { opened: 1, closed: 1, ran: 1 });
});
