# Physics review — Forge & Flight L0

Educational models only. None of these are a certification basis. Every result panel is required to show the assumption list the solver emits.

| Check | Formula | Validity stated to the learner |
| --- | --- | --- |
| Axial stress | σ = F/A | Uniform stress, linear elastic, no concentration |
| Bending stress | σ = Mc/I | Prismatic beam, small deflection, outer fiber |
| Cantilever tip sag | δ = FL³/(3EI) | Point load at the free end |
| Simple center sag | δ = FL³/(48EI) | Point load at midspan, both ends simply supported |
| Euler | Pcr = π²EI/(KL)² | Elastic, concentric, slender. K comes from the load case. Fixed-free uses K = 2 |
| Torsion | τ = Tr/J | Circular section. Implemented and tested. Not used by the two open missions |
| Thermal | σ = EαΔT/(1−ν) | Fully constrained, uniform temperature change. Implemented and tested. Not used by the two open missions |
| Lift | L = ½ρV²S CL | Steady, incompressible, attached flow until the stated stall |
| Lift slope | a = 2π·AR/(AR+2) | Thin-airfoil 2π per radian with a lifting-line finite-wing correction |
| Polar | Linear to 12°, then a straight decay | Teaching limit, not a wind-tunnel polar. CD0 = 0.04 and Oswald e = 0.8 are stated classroom constants |
| Induced drag | CDi = CL²/(π AR e) | Same Oswald assumption |
| Static margin | (xnp − xcg) / chord | Tail factor 0.5 lumps efficiency and downwash. Not a vortex-lattice result. Band 0.05 to 0.25 is the shop rule |
| Wing root | Half the lift as a tip force on a half-span cantilever | Conservative versus distributed lift. Stated on the brief |
| Glide path | Longitudinal point mass, fixed angle, dt = 0.05 s, 120 steps, drop from 8 m | Heading fixed. Not 6-degree-of-freedom. Stall and static margin are named, not simulated as a departure |
| Fatigue | σa = σf'(2N)^b | Illustrative coefficients on 6061 only. Not used to pass a mission |
| Modal L1 | Cantilever first eigenvalue βL = 1.875 | One bending mode. Off unless fidelity is L1. Excitation 180 Hz is a stand-in, not a measured motor |
| Unit cost | material·scrap + rate·time + (setup+tooling)/qty + labor + finishing | Classroom prices. Scrap multiplies material only |
| Strength knockdown | Printed PLA allowable and modulus × 0.6 | Stands in for layer bond. Not a coupon |

Material numbers and their citations live in `src/forge/content/catalog.ts`. Do not add a constant that is not in this table or that file.

Sign-off: classroom review of the formulas above. Not a delegated engineering authority.
