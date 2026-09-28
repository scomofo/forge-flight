import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 19 — Selection, corrosion & sustainability.
 * These three lessons open the materials track (indices 1–3); the seven
 * pre-existing materials lessons follow re-indexed from 4.
 * Evidence due: Ashby-style shortlist and trade study (shortlist bench).
 *
 * Through-line, as every week: structure → processing → properties →
 * performance. Here the performance question is the whole product life:
 * choosing the material, surviving the environment, and accounting the
 * end of life.
 */
export const materialsW19Lessons: Lesson[] = [
  {
    id: "screenrank",
    track: "materials",
    index: 25,
    title: "Screen, then rank",
    minutes: 35,
    lede: "You will screen a material set on hard constraints, rank the survivors by the property index the job actually needs, and write the trade study that names what you rejected and why.",
    start:
      "In the 1990s the bicycle industry fought a material war: steel loyalists, aluminum upstarts, titanium boutiques, carbon fiber racers. Every camp had a brochure with one winning column. || The adult move is not to pick a camp. It is to write down what the part must not fail — a minimum strength, a maximum mass, a maximum price — throw out everything that violates any one of them, and only then ask which survivor is best at the job. Screening is binary: a material either clears the bar or it does not. No partial credit. || Ranking then needs one number per material, and that number must come from the job. A tie rod limited by stiffness ranks on E/ρ. A beam limited by strength ranks on σ^2/3/ρ. The index is the job, compressed into a ratio. Pick the wrong index and you optimize the wrong part.",
    use: "Whenever you choose a material before you know the answer. || List the non-negotiables first — strength floor, density ceiling, temperature, corrosion, cost — and delete every candidate that fails any one of them. Then derive the index from the objective and the constraint: write mass as a function of the free variable, eliminate the free variable with the constraint, and read off the material group. || Stop when two or three survivors remain and the ranking is close. Close rankings are decided by the columns the index ignored: cost, corrosion, embodied energy, fatigue. That decision, written down with the rejects named, is the trade study.",
    example:
      "A 1 m tie rod must hit a stiffness target; cost ceiling $10/kg; outdoor, uncoated. || M = E/ρ: steel 210/7.85 = 26.8, aluminum 69/2.7 = 25.6, carbon fiber 140/1.55 = 90.3. For fixed stiffness, mass scales as 1/M — steel and aluminum land within 5% of each other, carbon far ahead. || The cost screen kills carbon at $80/kg against a $10 ceiling. The corrosion screen kills bare steel outdoors. The shortlist is one name: 6061 aluminum. The index said steel; the screens said otherwise — which is why you screen first.",
    ideas: [
      {
        heading: "Screens are binary",
        body: "A constraint is a pass/fail gate, not a suggestion. Relaxing one is a design decision with a named cost — a coating budget, a maintenance schedule, a heavier section — never a quiet fudge to keep a favorite candidate alive. The shortlist is only as honest as the screens behind it.",
      },
      {
        heading: "The index is derived, not chosen",
        body: "Write the objective (minimize mass) with the constraint (fixed stiffness or strength), eliminate the free geometric variable, and the material group left standing is the index. A tie in tension gives E/ρ for stiffness and σ/ρ for strength; bending changes the exponents because the section shape enters. Memorizing the table works until the loading changes; the derivation works always.",
        formula: "tie (stiff): M = E/ρ; beam (strong): M = σ^2/3/ρ; panel (stiff): M = E^1/3/ρ",
      },
      {
        heading: "Families cluster on the chart",
        body: "On a log E versus log ρ Ashby chart, each family sits in a bubble: metals up and right, polymers down and left, composites stretched along the top. Constant E/ρ is a line of slope 1, so the selection line cuts diagonally across the families. The chart is a map of the whole trade space — the index tells you which diagonal to read.",
        formula: "log E vs log ρ: constant E/ρ is a line of slope 1",
      },
    ],
    bench: "shortlist",
    prompt:
      "Run the selection: pick the brief, set hard screens, rank the survivors by the index — then write the trade study naming your winner and every reject. || The evidence is the shortlist: winner, runners-up, and one sentence each on why the rejects failed. || Getting “nothing survives” is a result: loosen one constraint and say which design freedom that costs you.",
    note: "Property values are representative teaching numbers, not datasheet values. Real selection ends at a real datasheet and a real supplier.",
    checks: [
      {
        prompt: "A stiffness-limited tie rod should be ranked on…",
        options: ["E/ρ", "E·ρ", "σ/ρ", "E/ρ²"],
        answer: 0,
        why: "For fixed axial stiffness, mass is proportional to ρ/E — so maximizing E/ρ minimizes mass. Strength does not enter a stiffness-limited design; that is exactly the mistake the index prevents.",
      },
      {
        prompt: "Six candidates, one fails the cost ceiling but leads on the index. You…",
        options: [
          "Reject it — screens come before ranking",
          "Keep it as a stretch option",
          "Average cost into the index",
          "Pick it anyway; the index is king",
        ],
        answer: 0,
        why: "Screens are binary and they run first. Folding a failed constraint into the ranking is how a favorite candidate survives a process designed to kill it.",
      },
      {
        prompt: "On a log E versus log ρ chart, materials with equal E/ρ lie on…",
        options: ["A line of slope 1", "A horizontal line", "A vertical line", "A line of slope 3"],
        answer: 0,
        why: "log(E/ρ) = log E − log ρ = constant rearranges to log E = log ρ + constant — slope 1. The selection line cuts diagonally across the family bubbles.",
      },
      {
        prompt: "The most important sentence in a trade study is…",
        options: [
          "Why each rejected candidate failed",
          "The winner's index value",
          "The number of candidates considered",
          "The chart's axis labels",
        ],
        answer: 0,
        why: "The winner is the conclusion; the rejects are the reasoning. When the requirements change next year, the record of why each option failed is what lets the decision be revisited instead of repeated.",
      },
    ],
  },
  {
    id: "corrosion",
    track: "materials",
    index: 26,
    title: "Corrosion is a design load",
    minutes: 35,
    lede: "You will read a corrosion failure from its morphology, name the mechanism, and choose the protection that actually interrupts it.",
    start:
      "On December 15, 1967, the Silver Bridge over the Ohio River collapsed at rush hour. Forty-six people died. The failure started in a single steel eyebar at a pin connection. || The steel was not under-strength. It was stressed, wet, and corroding: a crack grew by stress corrosion at the pin hole, hidden inside the joint, until the remaining ligament could not carry the load. Structure (high-strength steel), processing (the pin-and-hanger joint trapped water), properties (that steel in that environment cracks under sustained tension), performance (a bridge falls in under a minute). || Corrosion is not rust on the surface. It is an electrochemical cell: an anode dissolving, a cathode consuming the electrons, an electrolyte connecting them. Wherever those three meet under stress or in a crevice, you have a design load your stress calculation never included.",
    use: "Whenever metal meets environment — which is every part that leaves the building. || Identify the cell: the anode (the metal that dissolves — the more negative one in the galvanic series), the electrolyte (seawater, road salt, condensate), and the amplifier (small anode area, a crevice starved of oxygen, sustained tensile stress). Match the morphology to the mechanism: pits, crevice attack at joints, branched cracks under stress. || Stop treating when you have broken the cell — drained the electrolyte, isolated the couple, or removed the tensile stress — and named the inspection that watches the spot you could not protect.",
    example:
      "A steel bolt fastens an aluminum cleat on a boat. Salt spray is a given. || In the galvanic series for seawater, aluminum sits near −0.75 V and carbon steel near −0.60 V: aluminum is the anode by 0.15 V, and it will dissolve to protect the bolt. The bolt head also forms a crevice, and chloride pits aluminum's passive film where it cannot heal. || The fix is not a stronger bolt. Isolate the couple with a nylon washer and sleeve, or bed the joint in sealant so the electrolyte never arrives — or accept the maintenance and inspect the cleat every season. The cheapest fix is the one drawn before the parts exist.",
    ideas: [
      {
        heading: "The galvanic series ranks eagerness to dissolve",
        body: "The more negative metal is the anode: it dissolves so the cathode does not have to. The potential difference sets the driving force, but the area ratio sets the speed — a small anode feeding a large cathode concentrates the current into fast, localized death. Same ΔV, opposite area ratios, completely different outcomes.",
        formula: "anode = more negative potential; small anode + large cathode = fast local death",
      },
      {
        heading: "Geometry makes cells",
        body: "You do not need two metals to get a cell. A crevice starves the gap of oxygen, and differential aeration turns the hidden metal into the anode — which is why attack hides under washers and gaskets. Chloride breaks passive films locally and they do not heal, which is pitting. The joint you drew for strength is also the joint that corrodes.",
      },
      {
        heading: "SCC needs all three",
        body: "Stress-corrosion cracking demands tensile stress, a specific environment, and a susceptible alloy — simultaneously. Remove any one and the cracks stop. That is why the defenses are plural: lower the stress (shot peening, annealing), change the alloy, or remove the environment. Branched cracks with little visible metal loss are the signature; by the time you see them, the design already failed.",
        formula: "SCC ⟺ tensile stress ∧ specific environment ∧ susceptible alloy",
      },
    ],
    bench: "corrocheck",
    prompt:
      "Couple two metals, pick the environment, set the area ratio — then call the risk and name the mechanism. || The verdict must name the anode, the driver, and the protection that breaks the cell. || Run the Silver Bridge case in your head: steel, wet pin, sustained tension — which mechanism, and what would you have inspected?",
    note: "Potentials are approximate seawater values for teaching. Real galvanic work uses measured potentials in the actual electrolyte.",
    checks: [
      {
        prompt: "Aluminum (−0.75 V) bolted to carbon steel (−0.60 V) in seawater: the anode is…",
        options: [
          "Aluminum",
          "Carbon steel",
          "Neither — they are compatible",
          "Whichever part is smaller",
        ],
        answer: 0,
        why: "The more negative metal dissolves: aluminum at −0.75 V is anodic to steel at −0.60 V by 0.15 V. Size sets the rate, not the direction.",
      },
      {
        prompt: "A small anode coupled to a large cathode means…",
        options: [
          "Fast, localized attack on the small part",
          "Slow, even corrosion",
          "No corrosion — the cathode protects everything",
          "The cathode dissolves instead",
        ],
        answer: 0,
        why: "The total galvanic current is set by the cathode area; forcing it through a small anode means extreme current density there. Small anode, large cathode is the geometry that kills fasteners.",
      },
      {
        prompt: "Branched cracks in a stainless bolt under tension in chloride service point to…",
        options: [
          "Stress-corrosion cracking",
          "Uniform corrosion",
          "Erosion",
          "Pure mechanical overload",
        ],
        answer: 0,
        why: "Tensile stress plus chloride plus a susceptible stainless is the textbook SCC triad, and branching cracks with little metal loss are its signature. Overload leaves dimples, not branches.",
      },
      {
        prompt: "The most reliable protection is the one that…",
        options: [
          "Breaks the cell — removes electrolyte, couple, or stress",
          "Applies the thickest paint",
          "Uses the noblest alloy everywhere",
          "Doubles the corrosion allowance",
        ],
        answer: 0,
        why: "Corrosion is a circuit: anode, cathode, electrolyte. Break any leg and the current stops. Coatings and allowances manage the rate; only breaking the cell removes the cause.",
      },
    ],
  },
  {
    id: "sustain",
    track: "materials",
    index: 27,
    title: "Embodied impacts and repair",
    minutes: 35,
    lede: "You will put embodied energy and CO₂ on the selection table next to stiffness and cost, and argue repair against replace with numbers.",
    start:
      "Making a kilogram of aluminum from bauxite costs roughly 200 MJ — smelting alumina is an electrochemical marathon. Remelting a kilogram of scrap costs about 10 MJ: five percent. || That twenty-to-one ratio is why the material choice and the end-of-life plan are the same decision. A part designed to be recovered is a part whose embodied energy gets amortized over two lives instead of one. Structure (the alloy), processing (primary versus secondary route), properties (embodied energy per kilo), performance (the product's lifetime carbon). || Embodied impacts are a column in the selection table, not a footnote. And the column that matters most is often not the material at all — it is whether the thing can be opened, fixed, and kept in service.",
    use: "Whenever the brief mentions lifetime cost, carbon, or “sustainable” — and defensively, whenever it does not. || Add embodied energy and CO₂ per kilogram to the candidate table, multiply by the part mass, and compare against the use phase: a lighter part that saves fuel for ten years can repay a heavy embodied debt, and a disposable part never does. Then ask the repair questions: can it be disassembled, are the wear parts separable, does the joint outlive the product? || Stop when the recommendation names the end of life — recycle stream, remanufacture path, or landfill — and the design feature that makes that path real.",
    example:
      "A 2 kg aluminum bracket versus a 3 kg steel bracket for the same job. || Embodied: aluminum 2 × 200 = 400 MJ; steel 3 × 30 = 90 MJ. At the factory gate, aluminum is more than four times worse — and it is also the lighter part. || If the bracket rides in a vehicle for 200,000 km, the 1 kg saved repays the 310 MJ debt several times over in fuel. If it sits in a warehouse rack, steel wins and it is not close. Sustainability is not a material property. It is a material property times a life.",
    ideas: [
      {
        heading: "Embodied energy is a property column",
        body: "MJ/kg and kg CO₂/kg sit in the table next to modulus and strength, and they screen and rank like anything else: a CO₂ ceiling is a hard screen, a carbon weight is a trade-study column. Primary aluminum's ~200 MJ/kg versus recycled's ~10 is the same kind of spread as steel versus titanium on strength — it moves decisions.",
        formula: "impact = mass × embodied intensity; recycled Al ≈ 5% of primary",
      },
      {
        heading: "Recyclability is a system property",
        body: "Thermoplastics remelt; thermosets and most composites do not — they downcycle into filler if they are lucky. Alloys contaminate: tramp copper in steel scrap caps how much can be recycled into high-grade product. The material's recyclability is set as much by the collection stream and the alloy chemistry as by the part.",
      },
      {
        heading: "Design for repair beats design for recycling",
        body: "The longest life is the one already built. Fasteners come apart; welds and structural adhesives mostly do not. Separable wear parts, accessible joints, and documented disassembly keep a product in service past its first failure — and every extra year divides the embodied debt by a larger number.",
      },
    ],
    bench: "shortlist",
    prompt:
      "Re-run the selection with the carbon column switched on: set a CO₂ ceiling or weight it in the trade study. || Watch which winner changes when embodied energy counts — and which does not, because the use phase dominates. || Write the end-of-life sentence: recycle, remanufacture, or landfill — and the design feature that earns it.",
    note: "Embodied numbers are representative teaching values. Real accounting follows a life-cycle assessment with a stated boundary — gate-to-gate numbers are not comparable to cradle-to-grave ones.",
    checks: [
      {
        prompt: "Recycling aluminum instead of smelting it from bauxite saves roughly…",
        options: ["95% of the energy", "50% of the energy", "10% of the energy", "None of the energy"],
        answer: 0,
        why: "Remelting scrap costs about 10 MJ/kg against ~200 MJ/kg primary — around 95% saved. The smelting step is the marathon; everything after it is cheap by comparison.",
      },
      {
        prompt: "A 2 kg aluminum bracket (200 MJ/kg) versus a 3 kg steel bracket (30 MJ/kg): embodied totals are…",
        options: ["400 MJ vs 90 MJ", "90 MJ vs 400 MJ", "Roughly equal", "Not comparable across metals"],
        answer: 0,
        why: "2 × 200 = 400 MJ against 3 × 30 = 90 MJ. The lighter part carries the heavier embodied debt — which is exactly why the use phase has to enter the trade study.",
      },
      {
        prompt: "The aluminum bracket can still win the trade study if…",
        options: [
          "Use-phase savings repay the embodied debt",
          "It is anodized",
          "Aluminum is always greener",
          "The steel is left unpainted",
        ],
        answer: 0,
        why: "Sustainability is a material property times a life. A kilogram saved on a vehicle repays megajoules in fuel; on a static rack it repays nothing. Surface finish does not move this ledger.",
      },
      {
        prompt: "Design for repair most directly means…",
        options: [
          "Joints that come apart and wear parts that separate",
          "Using as few materials as possible",
          "Thicker sections everywhere",
          "Avoiding fasteners",
        ],
        answer: 0,
        why: "Repair is disassembly plus replaceable wear parts — which is fasteners, not welds. Fewer materials helps recycling; separable joints help repair. They are different goals.",
      },
    ],
  },
];
