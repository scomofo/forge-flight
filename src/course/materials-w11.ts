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
    lede: "Use bonding as a first clue to conductivity, deformation and thermal behavior, then check the named material and its conditions.",
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
    use: "When you meet an unfamiliar material or a surprising property, use bonding to form a hypothesis before consulting data. || Name the bonding: metallic (delocalized electrons), ionic (oppositely charged ions), covalent (shared electrons in a network or within molecules), or secondary interactions between molecules or chains. Ask which charges and structural units can move. || Stop with a qualified prediction, not a design value. Structure, defects, processing, temperature and direction can change the answer; identify which information is still missing.",
    example:
      "Magnesium oxide, MgO, is used in refractory linings; consider a dense crystal under ordinary room-temperature loading. || A simplified ionic picture uses Mg²⁺ and O²⁻ ions. The solid has little mobile charge and often fractures rather than accommodating easy slip. A lattice-separation energy near 3800 kJ/mol and melting temperature near 2850 °C are supplied illustrative reference values. The former concerns separation into gaseous ions; it is not the energy of fusion and does not calculate the latter. || Predict an electrically insulating, relatively brittle solid with a high melting temperature. Real high-temperature conduction and deformation still require measurements under the intended conditions.",
    ideas: [
      {
        heading: "Metallic bonding allows electron motion and slip",
        body: "Metallic bonding has delocalized valence electrons that can carry current. Its relatively non-directional character can also permit slip, in which layers of atoms rearrange through dislocation motion. Copper is a useful ductile example, but a metal is not guaranteed ductile: crystal structure, defects, temperature and processing affect which slip processes are available.",
        formula: "mobile electrons support conduction; available slip processes help explain ductility",
      },
      {
        heading: "Ionic bonding is strong but resists slip",
        body: "A simplified ionic lattice contains alternating charges. For an isolated ion pair, electrostatic potential energy scales as q₁q₂/r and force magnitude as |q₁q₂|/r²; q is charge and r is separation. These are not bulk-strength formulas. Many salts conduct poorly as room-temperature solids but conduct when molten because ions move. Some slip directions bring like charges together; brittleness is common, but defects, temperature and slip systems also matter.",
        formula: "ion-pair potential energy ∝ q₁q₂/r; lattice energy also depends on the whole structure",
      },
      {
        heading: "Covalent bonding is directional",
        body: "Covalent networks and covalent molecules are different architectures. Diamond and silicon carbide have extended networks; sulfur has strongly bonded S₈ molecules with weaker interactions between them. Melting sulfur need not dissociate each ring. A network does not simply break every bond on melting, and it may instead transform, decompose or sublime under the stated pressure and atmosphere. In polymers, chain mobility, crystallinity and crosslinks matter: glass-transition softening, melting of crystalline regions and chemical degradation are distinct processes.",
        formula: "network ≠ separate molecules; glass transition ≠ melting ≠ decomposition",
      },
    ],
    bench: "bonding",
    prompt:
      "Select each bond type in the explorer. || Separate a useful tendency from a property that still needs the material name, temperature or direction. || Explain why a copper example does not establish the ductility of every metal.",
    note: "These are qualified structural clues, not universal property packages. Graphite is strongly bonded within sheets and weakly bonded between them; many ceramics mix ionic and covalent character.",
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
        prompt: "In the simplified room-temperature ionic-crystal picture, why can some slip directions promote fracture?",
        options: [
          "Its bonds are too weak to hold under load",
          "Slip brings like charges together, which repel",
          "It has no electrons at all",
          "Ionic bonds only form at low temperature",
        ],
        answer: 1,
        why: "A displacement can bring like charges into unfavorable alignment. This explains a common brittleness tendency, not a prohibition on plastic deformation in every ionic crystal at every temperature.",
      },
      {
        prompt: "Diamond is a covalent network; sulfur consists of S₈ molecules and has a supplied melting point near 115 °C. Why can their thermal behavior differ?",
        options: [
          "Sulfur's bonds are ionic, not covalent",
          "Diamond is a network; sulfur is molecular — melting sulfur only defeats the weak forces between S₈ rings",
          "Sulfur atoms are much larger than carbon atoms",
          "Diamond contains metallic bonds between the covalent ones",
        ],
        answer: 1,
        why: "Melting a molecular crystal mainly reorganizes intermolecular contacts, without necessarily breaking the strong bonds inside each molecule. Diamond has a different network and phase behavior. It can graphitize or oxidize under suitable conditions; no atmosphere-independent 3500 °C survival claim follows from the bond label.",
      },
      {
        prompt: "An uncrosslinked thermoplastic softens without chemical degradation. Which process is consistent with that observation?",
        options: [
          "The backbone bonds breaking",
          "Increased chain mobility and rearrangement of inter-chain contacts",
          "Electrons becoming delocalized with temperature",
          "The chains converting to ionic bonds",
        ],
        answer: 1,
        why: "Softening can occur while covalent backbones remain intact. Glass transition concerns mobility in amorphous regions; melting concerns crystalline regions; degradation changes chemical structure. Which transition occurs depends on the polymer and test conditions.",
      },
    ],
  },
  {
    id: "bondpacks",
    track: "materials",
    index: 2,
    title: "Why properties travel together",
    minutes: 30,
    lede: "Connect bonding to property trends while keeping independent material data, processing history and test conditions in view.",
    opening: { mode: "steps", heading: "Build the idea", labels: ["Situation", "Model", "Takeaway"] },
    readFlow: [
      { kind: "idea", idea: 0, label: "Start here" },
      { kind: "example", heading: "See it in numbers" },
      { kind: "idea", idea: 1, label: "What changes" },
      { kind: "move", heading: "Use the rule" },
      { kind: "idea", idea: 2, label: "One more consequence" },
    ],
    start:
      "Copper, alumina, and polyethylene do not need separate stories for every property. Their bonding already explains a great deal. || Electron mobility affects conductivity. The ease of atomic or molecular rearrangement affects ductility. Bond strength affects stiffness and temperature limits. || Throughout Materials 101, keep the same chain in view: processing changes structure → structure affects properties → properties affect performance. Bonding is the starting structure.",
    use: "When a datasheet surprises you, ask whether a trend is being mistaken for a rule. || Use bonding to suggest mechanisms, then check the named material. Compare energies only after identifying what one mole refers to and what separation process is measured. || Stop when you can distinguish a qualitative tendency, a supplied reference value and a result actually derived from a model.",
    example:
      "Tungsten has a supplied melting temperature of 3422 °C and a cohesive-energy scale near 850 kJ/mol of atoms. Many bulk tungsten products have limited room-temperature ductility. || Cohesive energy describes separating the solid into atoms, not melting it. Neither that energy nor the melting temperature determines room-temperature ductility alone. Research on rolled tungsten foil shows that processing can shift its brittle-to-ductile transition and permit ductile behavior at room temperature. || Keep the thermal reference value separate from the deformation question. For ductility, identify the product form, microstructure, temperature and loading conditions rather than assigning one answer to every tungsten specimen.",
    ideas: [
      {
        heading: "Energy values need a defined reference process",
        body: "Cohesive energy, ionic lattice-separation energy and molecular bond dissociation energy refer to different processes and different molar bases. Their broad ranges are not a calibrated melting-point axis. At fixed pressure, melting depends on the relative free energies of solid and liquid; strong interactions can suggest trends within comparable systems, but entropy and competing transformations matter. Use a supplied melting datum as data, not as the output of a bond-energy formula.",
        formula: "T_m: melting temperature at a stated pressure; not calculated from these energy ranges",
      },
      {
        heading: "Stiffness is bond stiffness, scaled up",
        body: "Near an equilibrium spacing, a bond can be approximated as a spring. Let S₀ be its small-displacement stiffness in N/m and r₀ its equilibrium spacing in m. A simple spring-lattice estimate gives E ≈ S₀/r₀ in pascals. The numerical factor depends on geometry, bond orientation and deformation mode. This is a model for elastic response, not a calculation of melting or hardness; polymer stiffness also depends on temperature, crystallinity, chain orientation and crosslinks.",
        formula: "E ≈ S₀/r₀: (N/m)/m = N/m² = Pa, for a simple spring-lattice estimate",
      },
      {
        heading: "Mixed bonding means a mixed pack",
        body: "Graphite conducts much better in the plane than across it; it is stiff in the sheet and soft between sheets — because it is covalent in two dimensions and secondary in the third. Glass is part ionic, part covalent. Real materials routinely carry two bonds, and then the property pack splits along the bond directions. 'What is the bonding' sometimes has two answers, and the properties will tell you which bond is answering each question.",
        formula: "two bonds → the pack splits; read each property against the bond that owns it",
      },
    ],
    bench: "bondenergy",
    prompt:
      "Pick each bond type and read its illustrative energy range and reference basis. || Explain why kJ/mol alone does not make cohesive, lattice-separation and bond-dissociation energies interchangeable. || Identify one property that needs a named material or processing condition before you can predict it.",
    note: "Ranges illustrate different separation processes; they do not calculate melting points. Use measured phase-transition data at the relevant pressure and atmosphere. The broad metallic family does not fix ductility or melting temperature.",
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
        prompt: "What is a defensible interpretation of tungsten’s high melting temperature and variable room-temperature ductility?",
        options: [
          "Contradict each other — one must be mismeasured",
          "Its high melting temperature does not fix ductility; processing and test conditions also matter",
          "Mean tungsten is actually a ceramic",
          "Are caused by impurities, not bonding",
        ],
        answer: 1,
        why: "Bulk tungsten can show low room-temperature ductility, while suitably processed foil can behave differently. The cohesive-energy scale alone does not specify dislocation mobility, fracture behavior or the ductile-to-brittle transition.",
      },
      {
        prompt: "Why can the explorer’s energy ranges not calculate a material’s melting point?",
        options: [
          "Bond energies cannot be measured",
          "The ranges use different separation processes; phase free energies and competing transformations also matter",
          "Melting points are arbitrary conventions",
          "Only ionic solids obey it",
        ],
        answer: 1,
        why: "Energy bases must first be comparable. Melting reorganizes a condensed structure, rather than necessarily atomizing it. Entropy, pressure and competing transformations prevent a universal conversion from an energy range to a melting point.",
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
    lede: "Use a structural description to make a qualified prediction, check a named-material reference, and explain what remains uncertain.",
    opening: { mode: "prose", heading: "Get the rule on the table first" },
    readFlow: [
      { kind: "idea", idea: 0, label: "Rule" },
      { kind: "idea", idea: 1, label: "Why it matters" },
      { kind: "example", heading: "Now apply it" },
      { kind: "idea", idea: 2, label: "Boundary or extension" },
      { kind: "move", heading: "Practical use" },
    ],
    start:
      "Suppose all you know about an unfamiliar solid is that its atoms form a continuous tetrahedral network. You can still make useful property predictions. || Directional covalent bonding suggests strong resistance to bond stretching and limited easy slip. That points toward high stiffness and hardness, brittleness, and high-temperature resistance. Electrical behavior still needs a material-specific check; the network label alone cannot decide it. || Silicon carbide is one example and is a semiconductor, not a categorical insulator. The point is not to memorize the name; it is to practice moving from structure to likely properties before looking at a datasheet.",
    use: "When screening a candidate or investigating a surprising property, write down what the structure suggests and what it does not establish. || State the material, direction, temperature and relevant phase. Predict before revealing the reference, then compare the result and its assumptions. || A mismatch may reflect a missing condition or an over-simple rule, not just a learner error. Record the revised explanation and any information still needed.",
    example:
      "A white crystalline solid: alternating positive and negative ions, shatters under a hammer, dissolves in water. Predict, then verify. || Bond: ionic — charge-locked lattice, no free electrons. Prediction: brittle (slip brings like charges together), insulating as a solid, high melting (strong electrostatic lattice). Bonus prediction: the melt conducts, because the ions themselves become mobile charges. || That is table salt, and every line checks out — including the bonus.",
    ideas: [
      {
        heading: "The protocol: bond first, properties second",
        body: "Describe what is bonded to what. Name the main interactions, then state a likely property and its conditions. Compare the prediction with the named-material reference. Writing first makes the comparison useful; a single bond label is not a substitute for measurements or a complete electronic-structure model.",
        formula: "structure → bond → pack; prediction written before the reveal",
      },
      {
        heading: "Use wrong predictions to refine the model",
        body: "Check common sources of disagreement: confusing a molecule with a network, overlooking graphite’s directions, forgetting that salt ions become mobile in a melt, or assuming one polymer transition applies to every polymer. Also ask whether the hint supplied enough information. A reference match is a success within this exercise, not validation of a real component.",
        formula: "prediction → reference comparison → revised explanation or missing-condition query",
      },
      {
        heading: "Processing moves the structure, so properties follow",
        body: "This week's pack is the starting point, not the final answer: cold-working a metal multiplies dislocations and hardens it, quenching a steel traps carbon and transforms it, drawing a polymer aligns chains and stiffens them along the draw. Every one of those is a structural change, and the properties move because the structure moved. Weeks 12–13 are this sentence worked out in detail; the bond pack is what processing has to work with.",
        formula: "properties = f(structure); processing changes the argument",
      },
    ],
    bench: "bondpredict",
    prompt:
      "For each substance, read the structural hint and stated conditions, then predict all three properties. || Reveal the named-material reference and compare your choices. || Record what changed in your explanation, including any condition the simplified property label leaves out.",
    note: "Six substances, three properties each. Graphite distinguishes conduction along a sheet from sliding between sheets. The saved best score belongs to this corrected, qualitative reference bank, not a laboratory qualification.",
    checks: [
      {
        prompt: "An uncrosslinked thermoplastic has covalent backbones and weaker inter-chain contacts. What can explain softening without chemical degradation?",
        options: [
          "Very high melting point — covalent bonds are strong",
          "Greater chain mobility without necessarily breaking the covalent backbones",
          "Sublimes directly with no softening",
          "Melting point cannot be estimated at all",
        ],
        answer: 1,
        why: "Glass-transition softening and melting of crystalline regions can occur without chemical decomposition. Crosslinked polymers behave differently; neither a transition temperature nor degradation follows from the structural hint alone.",
      },
      {
        prompt: "For graphite, why should a prediction distinguish conduction along a sheet from behavior across sheets?",
        options: [
          "You misread the hint entirely",
          "Its layered electronic and bonding structure produces directional properties",
          "All insulators conduct a little",
          "The prediction method is useless",
        ],
        answer: 1,
        why: "Graphite is the archetype: covalent in-plane with delocalized π electrons conducts along the sheet, conduction across the sheets is much poorer, not zero. One bond per material is the assumption that fails.",
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
          "It makes the comparison with the reference explicit, including assumptions you need to revise",
          "The bench requires it for scoring",
          "Predictions are always right",
        ],
        answer: 1,
        why: "An explicit prediction lets you identify changed assumptions and missing information. A mismatch is useful feedback, but it does not by itself identify the cause or prove a lack of understanding.",
      },
    ],
  },
];
