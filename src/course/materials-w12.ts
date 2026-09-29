import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 12 — Atomic order and microstructure.
 * Materials-track indices 4–6, following the week-11 bonding lessons. The
 * block through-line is structure → processing → properties → performance.
 * Evidence due: microstructure interpretation set (graintex bench).
 */
export const materialsW12Lessons: Lesson[] = [
  {
    id: "crystal",
    track: "materials",
    index: 4,
    title: "Crystal structures",
    minutes: 35,
    lede: "Count the atoms in a unit cell, compute how tightly they pack, and name which crystal structure a metal uses — and why that choice decides how it deforms.",
    start:
      "A grocer stacks oranges in a pyramid without thinking about it. Every orange touches twelve neighbors, and no arrangement of equal spheres packs tighter. Metallurgists call that face-centered cubic, and copper, aluminum, nickel, and lead all use it. || A crystal is atoms sitting on a repeating lattice; the unit cell is the tile that repeats. Nearly every engineering metal uses one of three tilings: body-centered cubic, face-centered cubic, or hexagonal close-packed (simple cubic is a teaching model; almost nothing uses it). The tiling is the structure. Everything downstream — how the metal bends, how it fails, whether you can forge it or only cast it — starts here. || Two wires can look identical and behave oppositely: one bends around your finger, the other snaps. Same atoms, different packing — the structure decides the properties.",
    use: "When you choose a metal for forming, or explain why a part cracked instead of bending. || Count atoms per cell (a corner atom is shared by 8 cells, a face atom by 2, a body atom is whole), compute the packing efficiency, and count the slip systems — the planes and directions along which atomic layers can slide. FCC's twelve close-packed slip systems mean the metal almost always finds a way to yield: ductile. BCC also has 12+, but they need thermal help, so it can turn brittle when cold. Three means it often cannot: limited ductility, watch for cracking. || Stop when you can look at a structure label — FCC, BCC, HCP — and predict “this will forge, this will need care.”",
    example:
      "Aluminum is FCC with atomic radius 143 pm. || The face diagonal holds four radii, so the cell edge is a = 2√2·r = 2√2 × 143 pm ≈ 404 pm. Corners contribute 8 × 1/8 = 1 atom, faces 6 × 1/2 = 3, for 4 atoms per cell. Density: 4 × 26.98 g/mol ÷ Avogadro's number ÷ (404×10⁻¹⁰ cm)³ ≈ 2.70 g/cm³. || That is the datasheet number, derived from the structure alone — no measurement of a block required. The call: if your computed density misses the datasheet by more than a few percent, suspect the structure assignment or the radius, not the arithmetic.",
    ideas: [
      {
        heading: "The unit cell is the tile",
        body: "You never need to picture a billion atoms. The unit cell is the smallest repeating box, and the whole crystal is that box stamped in three directions. Counting atoms is bookkeeping with sharing rules: corners count 1/8, faces 1/2, the body atom is entirely yours. FCC: 1 + 3 = 4 atoms. BCC: 1 + 1 = 2. HCP's conventional cell holds 6. Get the count wrong and every density and packing number downstream is wrong.",
        formula: "FCC: 8×(1/8) + 6×(1/2) = 4 atoms",
      },
      {
        heading: "Packing efficiency is a ceiling",
        body: "Equal hard spheres cannot fill space completely. Simple cubic manages 52% — mostly air. BCC reaches 68%. FCC and HCP both hit 74%, the proven maximum for equal spheres. The number matters because close-packed planes are the smoothest sliding surfaces in the crystal: the tighter the packing, the easier one plane glides over another, and the more ductile the metal.",
        formula: "SC 52% · BCC 68% · FCC 74% · HCP 74%",
      },
      {
        heading: "Iron changes its tiling, and steel exists because of it",
        body: "Iron is BCC at room temperature and switches to FCC at 912°C. Carbon dissolves readily in the roomy FCC octahedral sites and barely at all in BCC — so heating steel into the FCC region lets you dissolve carbon, then quenching traps it in a distorted lattice that is enormously hard. Heat-treating steel is a crystal-structure phase change, exploited: structure → processing → properties, in one of the oldest industrial tricks there is.",
        formula: "α-Fe (BCC) → 912°C → γ-Fe (FCC)",
      },
    ],
    bench: "unitcell",
    prompt:
      "Pick a structure, set an atomic radius, and compute the lattice parameter and theoretical density. || Check your density against the known value — structure alone should land within a few percent. || Then answer: which structure would you specify for a part that must be forged, and why?",
    note: "Hard-sphere model throughout: atoms as touching balls. Real atoms are softer and radii shift slightly with coordination, which is why “within a few percent” is the honest bar, not exact agreement.",
    checks: [
      {
        prompt: "How many atoms are in one FCC conventional unit cell?",
        options: ["4", "2", "6", "1"],
        answer: 0,
        why: "Corners give 8 × 1/8 = 1, faces give 6 × 1/2 = 3, total 4. BCC has 2, HCP's conventional cell has 6, simple cubic has 1.",
      },
      {
        prompt: "The packing efficiency of FCC (and HCP) is…",
        options: ["74%", "68%", "52%", "100%"],
        answer: 0,
        why: "Close-packed structures reach π/(3√2) ≈ 74%, the maximum for equal spheres. BCC manages 68%, simple cubic only 52%. Nothing reaches 100% with spheres.",
      },
      {
        prompt: "At room temperature, which structure is most reliably ductile?",
        options: ["FCC", "HCP", "Simple cubic", "Diamond cubic"],
        answer: 0,
        why: "FCC offers 12 close-packed slip systems that need little stress to activate at any temperature, so a slip plane is almost always favorably oriented — copper and aluminum bend rather than snap. HCP has only 3 readily active systems, which is why magnesium needs care.",
      },
      {
        prompt: "Room-temperature α-iron is…",
        options: ["BCC", "FCC", "HCP", "Amorphous"],
        answer: 0,
        why: "α-iron is body-centered cubic below 912°C, where it transforms to FCC γ-iron. That transformation is what makes steel heat-treatable: carbon dissolves in the FCC phase and gets trapped on quenching.",
      },
    ],
  },
  {
    id: "graintex",
    track: "materials",
    index: 5,
    title: "Grains, texture, and anisotropy",
    minutes: 35,
    lede: "Read a grain map the way a pilot reads weather: boundaries are fronts, texture is the prevailing wind, and both decide where the metal yields.",
    start:
      "A jet-engine turbine blade spins at thousands of RPM in gas hot enough to soften most metals, pulled outward by centrifugal force for thousands of hours. Ordinary polycrystalline metal would slowly stretch along its grain boundaries — creep — and fail. So the blade is cast as one single crystal: no boundaries at all. || A real metal is a mosaic of crystal domains called grains. Inside a grain the lattice is orderly; at the boundary it has to turn, and that wall of disorder blocks the dislocations that carry plastic flow. More boundary per volume → harder to start yielding → higher strength. That is Hall–Petch. But boundaries are also where creep and corrosion like to work, so “more boundaries” is not always the answer — the turbine blade proves it. || Processing writes direction into the mosaic. Roll a sheet and the grains stretch and rotate into preferred orientations — texture — so the sheet is stronger along the rolling direction than across it. The metal carries its history: anisotropy.",
    use: "When a specification names a grain size, or a part fails along an unexpected direction. || Apply Hall–Petch — σy = σ₀ + k/√d — to predict how a grain-size change moves yield strength; check whether the load lines up with the texture direction or fights it; and for high-temperature service, ask whether boundaries are helping (strength at room temperature) or hurting (creep paths when hot). || Stop when you can point at a part and say which direction is strong, which is weak, and what processing wrote that in.",
    example:
      "Two coupons of the same steel: grain diameters 25 μm and 100 μm, with σ₀ = 100 MPa and k = 0.50 MPa·√m. || √d for 25 μm is √(25×10⁻⁶) = 0.005 √m, so σy = 100 + 0.50/0.005 = 200 MPa. For 100 μm: √(100×10⁻⁶) = 0.01 √m, σy = 100 + 0.50/0.01 = 150 MPa. || Refining the grain from 100 to 25 μm bought 50 MPa of yield — a 33% gain — with the chemistry untouched. The call: grain size is a property, so it belongs on the drawing next to the alloy name.",
    ideas: [
      {
        heading: "Boundaries are walls of disorder",
        body: "A grain boundary is a two-dimensional defect: the lattice on one side does not line up with the lattice on the other. Dislocations — the line defects whose motion is plastic deformation — pile up against it instead of gliding through. The finer the grains, the more wall per volume, the later yielding starts. Etch a polished sample and the boundaries appear as dark lines, because the disordered boundary corrodes faster than the ordered grain interior. That is what a micrograph is actually showing you.",
        formula: "σy = σ₀ + k / √d",
      },
      {
        heading: "Hall–Petch has limits",
        body: "The inverse-root law holds across a wide middle range, then breaks at both ends. In very coarse single-crystal-like grains there are too few boundaries to matter; in nanocrystalline metals (grains below ~20 nm) the mechanism changes — boundaries start sliding instead of blocking, and further refinement can soften the metal. “Finer is stronger” holds across the engineering middle; the exceptions live at the extremes.",
        formula: "Holds from ~100 μm down to ~tens of nm; breaks below ~20 nm",
      },
      {
        heading: "Texture is anisotropy with a paper trail",
        body: "Rolling, forging, and drawing rotate grains toward preferred orientations, so properties differ by direction: a rolled sheet resists tension along the rolling direction better than across it, and deep-drawn cups can develop ears where the texture is uneven. None of that is a defect. It is the processing history made legible: design with it (align fibers and rolling direction with the load) or specify against it (cross-rolling, annealing), but never pretend the metal is the same in every direction.",
      },
    ],
    bench: "microinterp",
    prompt:
      "Work the interpretation set: five micrographs, five scenes from the structure → properties chain. || For each one, name the key feature and predict the property consequence before you check the answer. || Finish by writing the one-sentence rule that connects grain size to strength.",
    note: "The micrographs are described, not photographed — the features (grain contrast, phases, fracture dimples) are exactly what an etched sample or an SEM shows. Real interpretation starts from these same visual cues.",
    checks: [
      {
        prompt: "Refining grain size from 100 μm to 25 μm does what to yield strength?",
        options: [
          "Raises it — more boundary per volume blocks slip",
          "Lowers it — smaller grains slide past each other",
          "Nothing — chemistry is unchanged",
          "Raises ductility but not strength",
        ],
        answer: 0,
        why: "Hall–Petch: σy rises as 1/√d because boundaries obstruct dislocations. Same chemistry, different mosaic, measurably different strength.",
      },
      {
        prompt: "Turbine blades are cast as single crystals mainly to…",
        options: [
          "Eliminate grain boundaries as creep paths",
          "Raise the melting point",
          "Make them cheaper to machine",
          "Improve room-temperature hardness",
        ],
        answer: 0,
        why: "At metal temperatures above 1000°C (in gas near 1500°C), boundaries slide and voids nucleate there — creep failure starts at the mosaic lines. One crystal means no boundaries, so no boundary sliding. It is structure → performance at temperature.",
      },
      {
        prompt: "A rolled sheet is stronger along the rolling direction because…",
        options: [
          "Rolling develops texture — preferred grain orientation",
          "Rolling adds carbon to the steel",
          "The sheet is thicker along that direction",
          "Rolling removes all grain boundaries",
        ],
        answer: 0,
        why: "Deformation rotates grains into preferred orientations, so slip systems line up unevenly with the load. The metal is genuinely different by direction — anisotropy with a processing paper trail.",
      },
      {
        prompt: "On an etched optical micrograph, the dark lines are…",
        options: [
          "Grain boundaries, attacked faster by the etchant",
          "Scratches from polishing",
          "Cracks in the sample",
          "The microscope's reticle",
        ],
        answer: 0,
        why: "The disordered boundary corrodes faster than the ordered grain interior, so etching reveals the mosaic as dark lines. Polish scratches run straight across grains; these follow the grain shapes.",
      },
    ],
  },
  {
    id: "disorder",
    track: "materials",
    index: 6,
    title: "Amorphous solids and what microscopes show",
    minutes: 35,
    lede: "Tell glass from crystal by what atoms do with no long-range plan — and read a fracture surface like a flight recorder.",
    start:
      "Drop a steel ruler and a glass stirring rod. The ruler bends or bounces; the rod becomes shards. Both are hard. Part of the difference is bonding (last week's lesson), and part is whether the atoms agreed on a plan — a metallic glass isolates the second effect. || An amorphous solid has no repeating lattice beyond a few atomic spacings: window glass, most polymers below their glass transition, and metallic glasses. Without slip planes there are no dislocations, so a metallic glass can be enormously strong with an elastic limit near 2% — several times a crystalline alloy's. Then one shear band carries all the strain, and it fails with no warning. || Whether you get crystal or glass is a processing decision: cool a liquid fast enough and the atoms never get the time to organize — the liquid's disorder freezes in. Quench rate writes the structure, and the properties follow.",
    use: "When a part must be hard, wear-resistant, or corrosion-proof but will never be asked to bend — and whenever you look at a broken part. || Read the fracture surface: a dimpled surface means ductile microvoid coalescence (it stretched before it parted); flat, faceted cleavage means brittle fracture along crystal planes; a mirror-smooth surface with river patterns means glass. Match the surface to the failure mode before you blame the load. || Stop when you can hold a broken part and reconstruct the failure from the surface alone.",
    example:
      "A Zr-based metallic glass: yield strength ≈ 1.9 GPa, elastic strain limit ≈ 2%. A high-strength crystalline steel: ≈ 1.5 GPa, elastic limit ≈ 0.75%. || The glass is the better spring by a wide margin — it stores roughly three to four times the elastic energy per volume (σ²/2E: 19 vs 5.6 MJ/m³). But bend the glass past 2% and a single shear band takes the whole deformation: catastrophic, silent, total. || The call: specify metallic glass for a spring, a scalpel edge, or a golf club face — never for a bracket that must fail gracefully and warn you first.",
    ideas: [
      {
        heading: "Glass transition, not melting",
        body: "A crystal melts at one temperature: order collapses all at once. A glass softens over a range — the glass transition — because there is no lattice to collapse, only gradually increasing atomic mobility. Below Tg the atoms are frozen mid-shuffle; above it the material creeps like an extremely viscous liquid. Far below Tg the viscosity is so high (>10²⁰ Pa·s) that no flow is measurable — old window panes are uneven from manufacture, not sagging.",
        formula: "Tg: frozen disorder → mobile disorder (no latent heat)",
      },
      {
        heading: "Quench rate is the processing knob",
        body: "Every liquid wants to crystallize; glass is what you get when you deny it the time. Window glass forms at modest cooling rates because its messy silicate network crystallizes sluggishly. Metals crystallize eagerly, so a metallic glass needs cooling at tens to millions of degrees per second — melt spinning, splat quenching — or a clever multi-element alloy that gets confused on the way to order. Critical cooling rate is a property of the alloy, and the process must beat it. Processing → structure, quantitatively.",
      },
      {
        heading: "Microscopy is evidence, in layers",
        body: "Optical microscopy with etching shows grains and phases down to about a micron — the mosaic from the grains lesson. The scanning electron microscope reads surfaces: fracture dimples, fatigue striations, inclusions, at thousand-fold magnification. The transmission electron microscope goes through thin foils to image dislocations and even atomic columns. Each layer answers a different question, and a serious failure analysis climbs the ladder: optical first, SEM for the fracture, TEM when the mechanism itself is on trial.",
        formula: "Optical ≈ 1 μm · SEM ≈ 10 nm · TEM ≈ atomic",
      },
    ],
    bench: "glassform",
    prompt:
      "Run the quench: pick an alloy, slide the cooling rate, and find the slowest rate that still freezes in glass. || Watch what the glass buys (strength, elastic limit, corrosion) and what it costs (ductility, warning before failure). || Then state the processing rule in one sentence.",
    note: "Critical cooling rates are order-of-magnitude honest: window glass ~1 K/s, bulk metallic glasses ~1–100 K/s, melt-spun binary glasses ~10⁵–10⁶ K/s, pure metals ≳10¹² K/s. The bench uses representative values, not alloy datasheets.",
    checks: [
      {
        prompt: "A metallic glass is very strong mainly because…",
        options: [
          "It has no dislocations or slip planes to move",
          "Its atoms are packed tighter than any crystal",
          "It contains no grain boundaries to corrode",
          "It is always a composite",
        ],
        answer: 0,
        why: "Plastic flow in crystals is dislocation motion along slip planes. No lattice means no dislocations and no easy slip — strength approaches the theoretical limit. The price is paid in ductility, not strength.",
      },
      {
        prompt: "A fracture surface covered in tiny dimples tells you the failure was…",
        options: [
          "Ductile — microvoids nucleated, grew, and coalesced",
          "Brittle cleavage along crystal planes",
          "Fatigue, from cyclic loading",
          "Corrosion-assisted cracking",
        ],
        answer: 0,
        why: "Dimples are the cups left where microvoids joined: the material stretched locally before parting. Cleavage leaves flat facets; fatigue leaves striations. Read the surface and you know the failure mode.",
      },
      {
        prompt: "The glass transition differs from melting in that…",
        options: [
          "It happens over a temperature range with no latent heat",
          "It only occurs in metals",
          "It is sharper and releases latent heat",
          "It requires a crystal lattice to break",
        ],
        answer: 0,
        why: "Melting collapses a lattice at one temperature with latent heat. A glass has no lattice, so it just gradually unfreezes — viscosity falls continuously through Tg.",
      },
      {
        prompt: "To make a metallic glass from a willing-to-crystallize alloy, you must…",
        options: [
          "Cool faster than its critical cooling rate",
          "Cool as slowly as possible",
          "Add grain refiners",
          "Anneal after casting",
        ],
        answer: 0,
        why: "Glass is frozen-in liquid disorder; crystallization is a race against atomic rearrangement. Beat the critical cooling rate and the atoms never organize. Slow cooling, refiners, and anneals all favor crystals — the opposite goal.",
      },
    ],
  },
];
