# Give the learner the inputs

The Math Runway bracket example formerly introduced 2700 kg/m³ only when
multiplying volume by density. A student could reasonably think that this
number should have emerged from the preceding algebra.

## The repaired example

- **Given geometry:** a solid rectangular aluminum bracket, 80 × 50 × 6 mm.
- **Looked-up material property:** ρ(aluminum) ≈ 2700 kg/m³, a typical density.
- **Calculated volume:** 24,000 mm³ = 2.4 × 10⁻⁵ m³.
- **Calculated mass:** m = ρV = 0.0648 kg = 64.8 g ≈ 65 g.

The written case supplies density before using it. The animated figure now
has a separate **Density (given)** step before **Mass**, a persistent density
label in its final frame, and the same optional explainer as the worked case.
The help explains rho, kg/m³, unit cancellation, typical-versus-datasheet values,
and why the number is looked up rather than derived from dimensions.
No quiz answers, IDs, scores, or 4/4 Math Runway thresholds are changed.

## Authoring rule for later lessons

At a number's first use, say whether it is **given**, **calculated**, **measured**,
or **looked up**. Define a new symbol before expecting the learner to use it.
Supply necessary inputs in the main explanation; reserve popovers for optional
depth, not missing information required to understand the worked example.

Material properties such as density, modulus, yield strength and friction
coefficients are not universal conversion constants. State the material,
units and conditions, give the classroom approximation, and identify the
source to use when exact values matter.

## Property references

- [Royal Society of Chemistry: aluminum](https://periodic-table.rsc.org/element/13/aluminium)
  lists density as 2.70 g/cm³; conversion gives 2700 kg/m³.
- [Royal Society of Chemistry: titanium](https://periodic-table.rsc.org/element/22/titanium)
  supports the rounded comparison of about 4500 kg/m³.
- [USGS: water density](https://www.usgs.gov/water-science-school/science/water-density)
  explains both the approximately 1000 kg/m³ classroom value and its variation.

All comparison values in the help are approximate; they are not design
specifications for a particular alloy or fluid composition.
