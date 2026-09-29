import type { Lesson } from "./types.ts";

/**
 * Materials 101, Week 11 — Bonding and material families.
 * These three lessons open the materials track (indices 1–3); week 12
 * follows from index 4. Evidence due: property predictions from bonding
 * (bondread bench and checks).
 *
 * Block through-line, stated in bondpacks: structure → processing →
 * properties → performance. This week is the structure end of the chain:
 * what the atoms are doing to each other decides what the material can do.
 */
export const materialsW11Lessons: Lesson[] = [
  {
    id: "bondzoo",
    track: "materials",
    index: 1,
    title: "The four bonds",
    minutes: 30,
    lede: "Name the bond holding a material together, and say what that bond lets electrons and atoms do — that decides conductivity, ductility, and melting point before any datasheet is opened.",
    opening: { mode: "steps", heading: "Read the materials first", labels: ["Four materials", "What changes", "What to predict"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Metallic" },
      { kind: "idea", idea: 1, label: "Ionic" },
      { kind: "example", heading: "Make a prediction" },
      { kind: "idea", idea: 2, label: "Covalent" },
      { kind: "move", heading: "Use the bond as your first clue" },
    ],
    start:
      "Copper wire, table salt, diamond, and polyethylene behave very differently because their atoms are bonded in different ways. || Metallic, ionic, covalent, and secondary bonding each place different limits on electron motion and atomic rearrangement. Those differences show up as conductivity, ductility, stiffness, melting temperature, and failure mode. || The useful habit is to start with the bond and ask three questions: can electrons move, can atomic planes or chains move, and how much energy does it take to separate the structure?",
    use: "When you meet an unfamiliar material, before you look anything up. Also when a property surprises you — 'why does this conduct but that doesn't' is almost always a bonding question. || Name the bond: metallic (shared electron sea), ionic (transferred electrons, charge lattice), covalent (shared pairs, directional — network or molecular), secondary (weak, between molecules or chains). Then ask what moves: electrons? slip planes? nothing? || Stop when you can predict conductivity, ductility, and rough melting behavior from the bond alone. If the bonding is mixed, name both bonds.",
    example:
      "Magnesium oxide, MgO: a white powder used to line furnaces. || Magnesium gives two electrons to oxygen; the result is Mg²⁺ and O²⁻ locked in a lattice, each ion surrounded by counter-ions. No electron is free to move, so it insulates. Sliding one plane past another brings like charges face to face, so it cracks instead of yielding. Pulling the lattice apart means fighting the full charge attraction — the lattice energy is around 3800 kJ/mol — so it melts near 2850°C. || Bond named, pack predicted: insulator, brittle, very high melting.",
    ideas: [
      {
        heading: "Metallic bonding allows electron motion and slip",
        body: "In a metal the valence electrons are delocalized — a sea shared by the whole lattice, not owned by any atom. Two consequences ride together: the electrons carry current, and the bonds have no direction, so planes of atoms can slip past each other without breaking the lattice apart. Slip is ductility. That is why the metal that conducts is usually the metal that can be drawn into wire: one bond feature, two properties.",
        formula: "conductivity and ductility share a cause: delocalized, non-directional bonding",
      },
      {
        heading: "Ionic bonding is strong but resists slip",
        body: "Electron transfer makes a lattice of alternating charges, and the strength scales with charge over distance — doubly-charged ions at short range (MgO) hold far harder than singly-charged ones (NaCl). No free electrons in the solid means it insulates; but melt it and the ions themselves move, so the melt conducts. And slip is catastrophic: shift one plane by half a spacing and like charges meet, repelling — so ionic solids are brittle, always.",
        formula: "lattice energy ∝ q₁·q₂ / r — charge and closeness set the price of pulling apart",
      },
      {
        heading: "Covalent bonding is directional",
        body: "Shared electron pairs are directional and strong, but the architecture matters more than the bond: a continuous network (diamond, silicon carbide) must be broken wholesale to melt — high melting point, brittle. Separate molecules (S₈ rings) melt when only the weak forces between molecules yield — low melting point. And secondary bonds — van der Waals, hydrogen bonds, 1–40 kJ/mol against hundreds for primary bonds — are what actually set the softening of polymers and waxes, because the strong bonds are internal to chains that barely hold each other.",
        formula: "network: melt = break primary bonds; molecular: melt = defeat secondary bonds",
      },
    ],
    bench: "bonding",
    prompt:
      "Select each bond type in the explorer. || Watch conduction, melting, and ductility move together as you switch — they are not three separate choices. || Then say out loud which bond lets planes slip and which one punishes slip with fracture.",
    note: "These are the textbook extremes. Graphite is covalent in the sheet and weak between sheets. Many ceramics are part ionic, part covalent. Reading a material from its bonding, later this week, is where mixed bonding stops being a footnote.",
    checks: [
      {
        prompt: "Why do metals conduct electricity?",
        options: [
          "Their atoms are packed more tightly than other solids",
          "Valence electrons are delocalized and free to drift",
          "Metallic bonds are the strongest of all bond types",
          "Metals contain no electrons in inner shells",
        ],
        answer: 1,
        why: "Conduction needs mobile charge. In a metal the valence electrons belong to the lattice, not to atoms, so an applied field moves them. Packing density and bond strength are not the mechanism.",
      },
      {
        prompt: "An ionic solid is brittle because…",
        options: [
          "Its bonds are too weak to hold under load",
          "Slip brings like charges together, which repel",
          "It has no electrons at all",
          "Ionic bonds only form at low temperature",
        ],
        answer: 1,
        why: "The bonds are strong — that is why the melting point is high. Brittleness comes from geometry: a half-step slip puts cation against cation, and the repulsion cracks the lattice instead of letting it yield.",
      },
      {
        prompt: "Diamond and sulfur are both covalent, yet diamond survives past 3500°C without melting and sulfur melts at 115°C. Why?",
        options: [
          "Sulfur's bonds are ionic, not covalent",
          "Diamond is a network; sulfur is molecular — melting sulfur only defeats the weak forces between S₈ rings",
          "Sulfur atoms are much larger than carbon atoms",
          "Diamond contains metallic bonds between the covalent ones",
        ],
        answer: 1,
        why: "A network must be broken wholesale to melt; a molecular solid melts when the weak secondary bonds between molecules yield. Same bond family, about a hundred degrees versus thousands.",
      },
      {
        prompt: "A solid polymer softens at 130°C though its C–C backbone bonds are ~350 kJ/mol. The softening is governed by…",
        options: [
          "The backbone bonds breaking",
          "The weak secondary bonds between chains yielding",
          "Electrons becoming delocalized with temperature",
          "The chains converting to ionic bonds",
        ],
        answer: 1,
        why: "The strong bonds are internal to each chain; the chains hold each other only by van der Waals forces at 1–40 kJ/mol. Heating defeats the weak links first — that is what softening is.",
      },
    ],
  },
  {
    id: "bondpacks",
    track: "materials",
    index: 2,
    title: "Why properties travel together",
    minutes: 30,
    lede: "Read conductivity, ductility, melting point, and stiffness as four expressions of one bond — and stop treating any of them as an independent fact about a material.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "Copper, alumina, and polyethylene do not need separate stories for every property. Their bonding already explains a great deal. || Electron mobility affects conductivity. The ease of atomic or molecular rearrangement affects ductility. Bond strength affects stiffness and temperature limits. || Throughout Materials 101, keep the same chain in view: structure → processing → properties → performance. Bonding is the starting structure.",
    use: "When a datasheet surprises you, or when two properties seem to 'go together' and you want to know if that is law or coincidence. Also before selecting a material: one demand usually forces the whole pack. || Take the bond, list what it permits and forbids, and check each property against that list. Expect correlation: high bond energy with high melting point, delocalized electrons with ductility. Treat every correlation as rough — graphite and the mixed cases are the test of whether you actually understand it. || Stop when you can say which property in the pack is the odd one out for a mixed-bonding material, and name both bonds responsible.",
    example:
      "Tungsten melts at 3422°C, the highest of any metal, and it is notoriously hard to draw into wire at room temperature. || Metallic bonding with a very deep cohesive well (~850 kJ/mol): enormous thermal energy is needed to break the lattice apart, hence the melting point. But the same strong, short bonds raise the stress needed to move dislocations — slip is expensive — so room-temperature ductility is poor. || One bond, two consequences pointing in opposite directions: the bond strength that survives the heat also makes slip expensive.",
    ideas: [
      {
        heading: "Bond energy sets the temperature scale",
        body: "Melting is the point where thermal motion defeats the bonds, so stronger bonds mean higher melting points — across three to four orders of magnitude of bond energy, from waxes at ~1 kJ/mol to tungsten near 850 and MgO near 3800. It is a correlation with wide scatter, not a formula: network topology, entropy, and decomposition all move the real number. Use it to place a material on the temperature map, never to compute a melting point.",
        formula: "T_m rises with bond energy — correlation, not a law; scatter is real",
      },
      {
        heading: "Stiffness is bond stiffness, scaled up",
        body: "Pull a bond slightly and it resists like a spring; the curvature of the bond-energy curve at its minimum is the atomic spring constant. A macroscopic modulus is that spring constant divided by the bond length: the bonds per area set the force, and the bond length turns stretch into strain. Diamond's deep, narrow energy well is why it is both hard to melt and hard to stretch — one curve, two macroscopic properties. Polymers live in shallow secondary wells, so they are compliant at room temperature.",
        formula: "E ≈ S₀/r₀ — bond stiffness ÷ bond length (equivalently S₀ × bonds per area × r₀)",
      },
      {
        heading: "Mixed bonding means a mixed pack",
        body: "Graphite conducts in the plane and insulates across it; it is stiff in the sheet and soft between sheets — because it is covalent in two dimensions and secondary in the third. Glass is part ionic, part covalent. Real materials routinely carry two bonds, and then the property pack splits along the bond directions. 'What is the bonding' sometimes has two answers, and the properties will tell you which bond is answering each question.",
        formula: "two bonds → the pack splits; read each property against the bond that owns it",
      },
    ],
    bench: "bondenergy",
    prompt:
      "Pick each bond type in the explorer and read its energy range against its melting behavior. || Find the widest energy range and the narrowest, and say what that width means for how precisely you can predict. || Then name one material whose real melting point the rough correlation would miss, and why.",
    note: "The energy numbers are orders of magnitude. The explorer shows the correlation honestly: a trend with scatter, not a calculator. If you want a melting point, measure it.",
    checks: [
      {
        prompt: "Copper is ductile and conductive. In this week's model these two properties…",
        options: [
          "Are unrelated coincidences",
          "Both follow from delocalized, non-directional metallic bonding",
          "Both follow from copper's high density",
          "Both require alloying elements",
        ],
        answer: 1,
        why: "One bond feature explains both: mobile electrons conduct, and non-directional bonds let planes slip. Properties travel in packs because they share a cause.",
      },
      {
        prompt: "Tungsten's extreme melting point and its poor room-temperature ductility…",
        options: [
          "Contradict each other — one must be mismeasured",
          "Both follow from very strong metallic bonding: hard to break apart, hard to slip",
          "Mean tungsten is actually a ceramic",
          "Are caused by impurities, not bonding",
        ],
        answer: 1,
        why: "Strong bonds resist both thermal disruption and dislocation motion. The same well depth gives the 3422°C melting point and the expensive slip.",
      },
      {
        prompt: "Why is 'bond energy predicts melting point' only a correlation?",
        options: [
          "Bond energies cannot be measured",
          "Network topology, entropy, and decomposition scatter the real values widely",
          "Melting points are arbitrary conventions",
          "Only ionic solids obey it",
        ],
        answer: 1,
        why: "A molecular solid melts by defeating weak inter-molecular forces regardless of strong internal bonds; some networks decompose before melting. The trend is real and the scatter is real — use it for placement, not calculation.",
      },
      {
        prompt: "Graphite conducts in-plane but is soft between planes. The correct reading is…",
        options: [
          "Graphite is a metal",
          "It carries two bonds: covalent in the sheet, secondary between sheets — each owns different properties",
          "Its bonds change type with temperature",
          "Conduction and softness are unrelated here",
        ],
        answer: 1,
        why: "Mixed bonding splits the pack along the bond directions. Ask which bond answers each property question instead of forcing one label on the material.",
      },
    ],
  },
  {
    id: "bondread",
    track: "materials",
    index: 3,
    title: "Reading a material from its bonding",
    minutes: 30,
    lede: "Take an unfamiliar substance, name its bonding from a structural description, and predict its conductivity, mechanical response, and thermal behavior — then check yourself and explain every miss.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "Suppose all you know about an unfamiliar solid is that its atoms form a continuous tetrahedral network. You can still make useful property predictions. || Directional covalent bonding suggests strong resistance to bond stretching, limited easy slip, and poor electron mobility. That points toward high stiffness and hardness, brittleness, electrical insulation, and a high temperature capability. || Silicon carbide is one example. The point is not to memorize the name; it is to practice moving from structure to likely properties before looking at a datasheet."
    use: "When selecting or troubleshooting — a part failed and you need to know whether the material was ever capable of the job, or you are choosing between candidates with no test data yet. || Read the structural description, name the bond (or bonds), read off the pack: conduction, mechanical response, thermal behavior. Write the prediction before you check. Then, for every miss, find the bond feature you ignored — mixed bonding, molecular vs network, a slip system you assumed. || Stop when every miss is 'I missed the second bond' rather than 'I guessed'. One is a method working; the other is luck.",
    example:
      "A white crystalline solid: alternating positive and negative ions, shatters under a hammer, dissolves in water. Predict, then verify. || Bond: ionic — charge-locked lattice, no free electrons. Prediction: brittle (slip brings like charges together), insulating as a solid, high melting (strong electrostatic lattice). Bonus prediction: the melt conducts, because the ions themselves become mobile charges. || That is table salt, and every line checks out — including the bonus.",
    ideas: [
      {
        heading: "The protocol: bond first, properties second",
        body: "Describe the structure in one sentence: what holds to what, and how strongly. Name the bond from that sentence — metallic, ionic, covalent network, covalent molecular, or secondary-dominated. Read the pack off the bond. Only then look at the answer. Reversing the order — peeking, then rationalizing — teaches nothing; the learning is in the miss, and only a written prediction can miss.",
        formula: "structure → bond → pack; prediction written before the reveal",
      },
      {
        heading: "Use wrong predictions to refine the model",
        body: "Every wrong prediction has a cause and the causes repeat: you called it a network when it was molecular (sulfur), you missed the second bond (graphite), you forgot the melt conducts (salts), you assumed 'strong bonds' means 'strong material' when the weak inter-chain bonds govern (polymers). Collect your misses by cause and the taxonomy of bonding stops being a list and becomes a diagnostic instrument.",
        formula: "classify each miss by cause, not by substance",
      },
      {
        heading: "Processing moves the structure, so properties follow",
        body: "This week's pack is the starting point, not the final answer: cold-working a metal multiplies dislocations and hardens it, quenching a steel traps carbon and transforms it, drawing a polymer aligns chains and stiffens them along the draw. Every one of those is a structural change, and the properties move because the structure moved. Weeks 12–13 are this sentence worked out in detail; the bond pack is what processing has to work with.",
        formula: "properties = f(structure); processing changes the argument",
      },
    ],
    bench: "bondpredict",
    prompt:
      "For each substance, read the structural hint and predict all three properties before revealing. || Score yourself 0–3 per round; the reveal explains the bond behind the answer. || When you finish, write down the cause of each miss — 'missed the second bond' beats 'guessed wrong'.",
    note: "Six substances, three properties each. Graphite is in there on purpose: it punishes anyone who assigns one bond per material. Your best score is saved on this device.",
    checks: [
      {
        prompt: "A substance is described as 'long chains, covalently bonded along the chain, weakly held between chains'. Your thermal prediction:",
        options: [
          "Very high melting point — covalent bonds are strong",
          "Softens or decomposes at modest temperature — the weak inter-chain bonds govern",
          "Sublimes directly with no softening",
          "Melting point cannot be estimated at all",
        ],
        answer: 1,
        why: "Heating defeats the weak links first. The strong backbone bonds are internal to chains; the material yields where the chains grip each other — secondary bonds at 1–40 kJ/mol.",
      },
      {
        prompt: "You predict a material is an insulator; it turns out to conduct along one direction. The most likely cause of the miss:",
        options: [
          "You misread the hint entirely",
          "Mixed bonding — the bond along that direction differs from the bond across it",
          "All insulators conduct a little",
          "The prediction method is useless",
        ],
        answer: 1,
        why: "Graphite is the archetype: covalent in-plane with delocalized π electrons conducts along the sheet, secondary between sheets does not. One bond per material is the assumption that fails.",
      },
      {
        prompt: "An ionic solid is predicted brittle and high-melting. Which further prediction follows from the same bond?",
        options: [
          "It will be ductile when hot",
          "Its melt will conduct electricity",
          "It will dissolve in oil",
          "It will be soft",
        ],
        answer: 1,
        why: "Same lattice, new phase: in the melt the ions are mobile charges, so the insulator becomes a conductor. The bond predicts the phase behavior too, not just the room-temperature pack.",
      },
      {
        prompt: "Why write the prediction before checking the answer?",
        options: [
          "It is faster",
          "Only a written prediction can miss — and the miss is where the learning is",
          "The bench requires it for scoring",
          "Predictions are always right",
        ],
        answer: 1,
        why: "Peeking then rationalizing teaches nothing. A committed prediction that fails forces you to find the bond feature you ignored, which is the actual skill being trained.",
      },
    ],
  },
];
