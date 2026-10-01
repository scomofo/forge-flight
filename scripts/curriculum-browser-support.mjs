/** Keep targeted desktop evidence separate from the exhaustive audit. */
export function curriculumBrowserOptions(args = []) {
  let desktop = false, curveread = false, repeat = 1;
  for (const arg of args) {
    if (arg === '--desktop') desktop = true;
    else if (arg === '--curveread') curveread = true;
    else if (/^--repeat=\d+$/.test(arg)) repeat = Number(arg.slice('--repeat='.length));
    else throw new Error(`Unknown curriculum browser option: ${arg}`);
  }
  if (!Number.isSafeInteger(repeat) || repeat < 1 || repeat > 500) throw new Error('Repeat count must be between 1 and 500');
  if (repeat !== 1 && !curveread) throw new Error('--repeat requires --curveread');
  if (curveread && !desktop) throw new Error('--curveread requires --desktop');
  return { desktop, curveread, repeat,
    viewports: desktop ? [['desktop', 1280, 900]] : [['desktop', 1280, 900], ['mobile', 390, 844]],
    suffix: curveread ? '-desktop-curveread' : desktop ? '-desktop' : '',
  };
}

/** A case owns a fresh document/ES-module execution context, not a reused tab.
 * Storage remains in the viewport's browser context. Failures are never retried.
 */
export async function withAuditPage(context, run) {
  const page = await context.newPage();
  try { return await run(page); }
  finally { await page.close(); }
}
