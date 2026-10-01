// Real UI acceptance for the five-specimen practical. The model is used only
// to exercise the existing grading contract, not as independent science proof.
import assert from 'node:assert/strict';
import { MATERIALS, generateCurve, extractParams } from '../src/course/mechresponse.ts';

const specimens = [0, 2, 3, 1, 5].map((index, round) => {
  const material = MATERIALS[index];
  const extracted = extractParams(generateCurve(material, { noise: 0.008, seed: 101 + round }));
  return { material, values: [extracted.E / 1000, extracted.yieldStrength, extracted.uts, extracted.elongation * 100] };
});
const fields = ['E', 'sy', 'uts', 'el'];

export async function exerciseCurveread(page, key, check) {
  const submit = page.getByRole('button', { name: 'Check against the extraction', exact: true });
  const firstSpecimen = page.getByText('Specimen 1 of 5 — an unidentified engineering material', { exact: true });
  await firstSpecimen.waitFor();
  check(key, 'four named numeric fields', await page.getByRole('spinbutton').count() === 4);
  check(key, 'empty readings cannot be checked', await submit.isDisabled());
  const curve = page.getByRole('img', { name: /^Stress-strain curve/ });
  check(key, 'curve is visible', await curve.isVisible());
  check(key, 'curve and inputs fit the desktop viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  check(key, 'curve contains finite plotted points', !/NaN|Infinity/.test(await curve.locator('path').getAttribute('d')));
  const paths = new Set();
  for (const [round, specimen] of specimens.entries()) {
    await page.getByText(`Specimen ${round + 1} of 5 — an unidentified engineering material`, { exact: true }).waitFor();
    paths.add(await curve.locator('path').getAttribute('d'));
    if (round === 0) {
      for (const field of fields) await page.locator(`#curveread-${field}`).fill('0');
      await submit.focus(); await page.keyboard.press('Enter');
      await page.getByText(`This was ${specimen.material.name}. 0 of 4 readings in tolerance.`, { exact: true }).waitFor();
      check(key, 'wrong readings receive feedback rather than credit', await page.getByText(/✗ extraction:/).count() === 4);
    }
    for (const [i, value] of specimen.values.entries()) {
      assert.ok(Number.isFinite(value), `Nonfinite extraction for specimen ${round + 1}, ${fields[i]}`);
      await page.locator(`#curveread-${fields[i]}`).fill(String(value));
    }
    check(key, `specimen ${round + 1}: editing invalidates the previous check`, await page.getByText(/^[✓✗] extraction:/).count() === 0);
    await submit.focus(); await page.keyboard.press('Enter');
    await page.getByText(`This was ${specimen.material.name}. 4 of 4 readings in tolerance.`, { exact: true }).waitFor();
    check(key, `specimen ${round + 1}: all four readings grade correctly`, await page.getByText(/✓ extraction:/).count() === 4);
    const next = page.getByRole('button', { name: round === 4 ? 'See the tally' : 'Next specimen', exact: true });
    await next.focus(); await page.keyboard.press('Enter');
  }
  await page.getByText('20 of 20', { exact: true }).waitFor();
  check(key, 'all five specimens show distinct curves', paths.size === 5);
  check(key, 'completion counts each specimen once', await page.getByText('20 of 20', { exact: true }).isVisible());
  check(key, 'completion removes input fields', await page.getByRole('spinbutton').count() === 0);
  await page.getByRole('button', { name: 'Run the practical again', exact: true }).focus();
  await page.keyboard.press('Enter');
  await firstSpecimen.waitFor();
  check(key, 'restart restores blank inputs', (await page.getByRole('spinbutton').evaluateAll(nodes => nodes.map(n => n.value))).every(v => v === ''));
  check(key, 'restart restores the unchecked state', await submit.isDisabled());
  // A second complete run detects score leaking across restart (not just a
  // cosmetically cleared form); no model answers are needed for a failing run.
  for (let round = 0; round < specimens.length; round++) {
    for (const field of fields) await page.locator(`#curveread-${field}`).fill('0');
    await submit.click();
    await page.getByRole('button', { name: round === 4 ? 'See the tally' : 'Next specimen', exact: true }).click();
  }
  await page.getByText('0 of 20', { exact: true }).waitFor();
  check(key, 'restart does not retain the previous score', await page.getByText('0 of 20', { exact: true }).isVisible());
}
