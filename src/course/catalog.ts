import type { Lesson, Track, TrackId } from "./types";
import { ladderLessons, ladderTracks } from "./ladder";
import { manufacturingLessons, manufacturingTrack } from "./manufacturing";

export const tracks: Track[] = [
  {
    id: "physics",
    index: "01",
    title: "Physics",
    course: "Physics 101",
    lede: "Start here. Vectors, motion, force, energy, momentum, and waves — the laws the later checks are built on.",
  },
  {
    id: "materials",
    index: "02",
    title: "Materials",
    course: "Materials 101",
    lede: "Next. Why a family bends, snaps, or sags, and how to compare materials against a job instead of a vibe.",
  },
  {
    id: "engineering",
    index: "03",
    title: "Engineering",
    course: "Engineering 101",
    lede: "Then the decisions. Requirements, balance, stress, sag, tradeoffs, and failure. The shelf at the end uses these.",
  },
  manufacturingTrack,
  ...ladderTracks,
];

export const introTrackIds = ["physics", "materials", "engineering"] as const satisfies readonly TrackId[];

export const lessons: Lesson[] = [
  {
    id: "families",
    track: "materials",
    index: 1,
    title: "The four families",
    minutes: 9,
    lede: "You will name the right material family for a job, and say which requirement forced that choice.",
    ideas: [
      {
        heading: "Family before alloy",
        body: "Choose the family before you choose a specific alloy. A datasheet has dozens of numbers. The first cut is coarser than that. Metals conduct and usually bend before they break. Ceramics stay hard when they are hot and tend to snap. Polymers are light and easy to shape, and they soften early. Composites are a designed pair — often a strong fiber in a weaker matrix — so the properties point in a chosen direction.",
      },
      {
        heading: "Properties travel in packs",
        body: "You rarely get one virtue alone. The bonding that lets a metal be drawn into wire also lets it carry current. The bonding that lets alumina face a kiln also makes it brittle. When a requirement says “light, stiff, and cheap in every direction,” no family is comfortable. That discomfort is useful. It tells you which constraint you will have to relax.",
      },
      {
        heading: "A composite is a deal",
        body: "A composite is excellent in one direction and weaker in the others. Carbon fiber in epoxy can beat steel on strength per mass along the fiber. Across the fiber it is a different, lesser material. You pay in cost, in heat resistance, and in the difficulty of knowing which direction the load will come from. Choosing a composite is choosing a direction to be excellent in, and accepting the others.",
        formula: "for a unidirectional composite, strength along the fiber is not the strength across it",
      },
    ],
    bench: "families",
    prompt: "Five jobs. For each one, pick the family that fits the physics of the job — not the one that merely sounds advanced.",
    note: "Real parts mix families (a steel screw in a polymer housing). The point of the sort is to see which demand is doing the deciding.",
    clip: {
      youtubeId: "AQ9jliLFh28",
      title: "Comparing the failure of different materials",
      channel: "Taylor Sparks",
      watch: "The glass, the plastic cup, and the metal can. One snaps, one stretches, one dents and stays in one piece.",
      leave: "He talks about cracks. You do not need that yet. The family sort on this page is the rule.",
    },
    checks: [
      {
        prompt: "Which pairing is the most typical?",
        options: [
          "Metals: brittle, electrically insulating, low density",
          "Metals: ductile and electrically conductive",
          "Polymers: high service temperature and high stiffness",
          "Ceramics: easy to draw into fine wire",
        ],
        answer: 1,
        why: "Metallic bonding gives both mobile electrons and slip systems. That is why wire can be drawn and why it conducts. The other pairings describe a different family.",
      },
      {
        prompt: "A part must survive 1400°C and may be brittle. Where do you look first?",
        options: [
          "Commodity polymers",
          "Soft pure metals",
          "Ceramics",
          "Elastomers",
        ],
        answer: 2,
        why: "Network ceramics keep their strength long after polymers have decomposed and many metals have softened. Brittleness is the usual price.",
      },
      {
        prompt: "What is a composite, in the sense used here?",
        options: [
          "Any alloy of two metals",
          "A fiber (or particle) plus a matrix, arranged on purpose",
          "A ceramic that has been tempered",
          "A polymer with a dye added for color",
        ],
        answer: 1,
        why: "Alloys are still one metallic family. A composite keeps distinct constituents so you can aim stiffness or strength in a chosen direction.",
      },
      {
        prompt: "Why is “best material” not a meaningful phrase by itself?",
        options: [
          "Datasheets are secret",
          "Every family wins on some demands and loses on others",
          "Only cost matters, so the chart is noise",
          "Materials from the same family are identical",
        ],
        answer: 1,
        why: "Selection is always against a job. Stiffness, heat, toughness, mass, and cost pull in different directions. Name the job before you name the winner.",
      },
    ],
  },
  {
    id: "bonding",
    track: "materials",
    index: 2,
    title: "Bonding",
    minutes: 10,
    lede: "You will connect the bond type to conductivity, melting temperature, and whether the solid bends or snaps.",
    ideas: [
      {
        heading: "Four useful pictures",
        body: "Metallic: positive cores in a shared electron sea. Ionic: electrons transferred, opposite charges locked in a lattice. Covalent network: atoms share electrons across a giant lattice, as in diamond or silica. Molecular: strong covalent bonds inside each molecule, weak forces between molecules. Polymers sit near that last picture — strong chains, weak ties between chains.",
      },
      {
        heading: "Electrons decide conductivity",
        body: "If electrons can drift without tearing the structure apart, the solid conducts. Metals have that sea already. Solid ionic salts and network ceramics usually do not; the electrons are stuck with their ions or bonds. Melt an ionic salt and the ions themselves can move, so the liquid conducts. That surprise is a bonding story, not a mystery.",
      },
      {
        heading: "Slip decides ductility",
        body: "A metal yields when planes of atoms slide. The electron sea still holds after the slide, so the piece bends and stays in one piece. Slide a plane in an ionic crystal and like charges are forced together, so it cracks instead. A molecular solid does not need to break strong bonds to melt: only the weak forces between molecules have to let go. That is why wax melts in the hand while the molecules themselves are intact.",
        formula: "metal: the bond survives slip, so it bends. Ionic: slip cracks it",
      },
    ],
    bench: "bonding",
    prompt: "Switch the bond. Watch conduction, melting, and ductility move together — they are not separate dials.",
    note: "These are the textbook extremes. Real materials mix them: graphite is covalent in the sheet and weak between sheets; many ceramics are partly ionic and partly covalent.",
    checks: [
      {
        prompt: "Why do metals conduct electricity as solids?",
        options: [
          "Their nuclei are free to roam",
          "Delocalized electrons can drift through the lattice",
          "They are always liquids at room temperature",
          "Metallic bonds are too weak to hold electrons at all",
        ],
        answer: 1,
        why: "The electron sea is the charge carrier. The ion cores stay put. Weak bonding is not the reason — tungsten is metallic and melts extremely high.",
      },
      {
        prompt: "Why is a typical ionic crystal brittle?",
        options: [
          "It has no bonds",
          "Slip brings ions of the same charge face to face, so the plane pulls apart",
          "It contains long tangled chains",
          "Electrons screen every charge, so nothing holds",
        ],
        answer: 1,
        why: "The electrostatic order that makes the crystal strong also makes a one-plane shift violently unfavorable. The crystal cracks instead of yielding.",
      },
      {
        prompt: "A molecular solid melts at a low temperature. What gave way?",
        options: [
          "The covalent bonds inside each molecule",
          "The weak forces between molecules",
          "A metallic electron sea",
          "The nucleus of the atoms",
        ],
        answer: 1,
        why: "The molecule stays a molecule. Melting only separates neighbors held by intermolecular forces. That is also why many polymers soften long before their chains chemically fall apart.",
      },
      {
        prompt: "Diamond is extremely hard. Which picture explains that?",
        options: [
          "It is a metal with fine grains",
          "It is a molecular solid with strong intermolecular glue",
          "Each carbon is tied into a covalent network",
          "Ionic charges pack into a salt lattice",
        ],
        answer: 2,
        why: "Breaking diamond means breaking covalent bonds throughout a network, not just peeling molecules apart. Graphite shows the other carbon extreme: strong sheets, weak slip between them.",
      },
    ],
  },
  {
    id: "curve",
    track: "materials",
    index: 3,
    title: "The stress–strain curve",
    minutes: 12,
    lede: "You will read stiffness, strength, ductility, and toughness as four different features of one curve.",
    ideas: [
      {
        heading: "Slope is stiffness, not strength",
        body: "The slope of the first straight part is stiffness, called Young’s modulus, not strength. In the first straight part, stress is proportional to strain. A high modulus means the material barely stretches under load. It says nothing, by itself, about how much load will cause a permanent bend or a break. Glass is stiff. It is not tough.",
        formula: "E = σ / ε    in the linear region",
      },
      {
        heading: "Strength is a stress",
        body: "Yield strength is the stress where the piece stops springing all the way back. Ultimate strength is the highest stress on the curve. Both are forces per area. A ceramic can show a high stress at fracture and almost no plastic strain after the line. A mild steel yields, hardens, necks, and only then breaks. “Strong” without “yield or ultimate, tension or compression” is incomplete.",
        formula: "yield and ultimate are both σ = F / A, at two different points on the curve",
      },
      {
        heading: "Toughness is the area",
        body: "Toughness is the area under the curve, the energy required to break the material. Ductility is how much plastic strain you get before fracture. A brittle ceramic can be strong and still be easy to shatter, because the area is a tall thin spike. A metal that yields and keeps stretching swallows energy. Impact, dropping, and crash structure care about area, not just the peak.",
        formula: "toughness ≈ the area under the stress–strain curve",
      },
    ],
    bench: "curve",
    prompt: "Scrub strain on three different curves. Name the region you are in, and notice when the axes quietly change scale.",
    note: "Teaching curves, not a lab certificate. The steel sketch includes a yield plateau and necking; the ceramic fractures in the elastic line; the polymer draws out to a large strain. Axes rescale per material.",
    clip: {
      youtubeId: "uWgnBNOy-rA",
      title: "Tensile testing and the stress–strain diagram",
      channel: "ToolNotes",
      end: 250,
      watch: "The specimen being pulled. The first stretch is small and springy. Later it necks and stays long.",
      leave: "When he draws the graph, use our names. The slope is stiffness. The height where it stops springing back is strength. The area is toughness.",
    },
    checks: [
      {
        prompt: "Young’s modulus is which feature of the curve?",
        options: [
          "The highest stress reached",
          "The strain at fracture",
          "The slope of the initial linear region",
          "The area under the whole curve",
        ],
        answer: 2,
        why: "E is stiffness: stress per strain while the material is still elastic. The peak is a strength. The area is a toughness. Fracture strain is a ductility.",
      },
      {
        prompt: "A ceramic shows high stress at fracture and almost no plastic strain. It is fair to call it…",
        options: [
          "Tough and ductile",
          "Stiff and strong in that sense, but brittle",
          "Low modulus, because it snaps",
          "Unable to carry any elastic stress",
        ],
        answer: 1,
        why: "The spike is tall (stress) and thin (strain). Strength can be high while toughness and ductility stay low. Snapping does not mean the modulus was low — the slope can be steep.",
      },
      {
        prompt: "What does a large area under the curve buy you?",
        options: [
          "Higher electrical conductivity",
          "Energy absorbed before fracture",
          "A lower melting temperature",
          "Perfect elasticity at any strain",
        ],
        answer: 1,
        why: "That area is toughness, energy per volume. It is why a ductile metal can survive a blow that shatters a stronger-looking brittle solid.",
      },
      {
        prompt: "You double the strain and the stress doubles, then you unload and the piece returns to its old length. You were in…",
        options: [
          "Necking",
          "The plastic plateau",
          "The elastic region",
          "Fracture",
        ],
        answer: 2,
        why: "Proportional loading plus full recovery is the elastic region. Past yield, unloading leaves a permanent set even if the material has not broken.",
      },
    ],
  },
  {
    id: "compare",
    track: "materials",
    index: 4,
    title: "Side by side",
    minutes: 10,
    lede: "You will compare materials using the column the job needs, including strength divided by density.",
    ideas: [
      {
        heading: "Read the column, name the unit",
        body: "Read one column at a time, and name its unit before you compare two materials. Density says what a cubic centimeter weighs. Modulus says how hard it is to stretch elastically. Strength, here, is an order-of-magnitude allowable stress — yield for the metals, a tensile failure stress for the brittle ones. Service temperature is where you should stop trusting those room-temperature numbers. None of these is cost, and cost can throw out the winner.",
      },
      {
        heading: "Specific strength",
        body: "Aircraft, bikes, and anything you must lift care about strength per mass. Divide strength by density. A material can lose on raw strength and win once weight is the budget. The reverse happens in a machine base bolted to the floor: mass can be free, or even useful, and stiffness per volume wins.",
        formula: "specific strength ≈ σ / ρ",
      },
      {
        heading: "One column is a trap",
        body: "Do not pick a material from a single column. Pick the stiffest material in the table and you may have bought a brittle, heavy, or impossible-to-form solid. Pick the lightest and you may have a foam that sags under a book. Selection starts by throwing out whatever fails a hard constraint (must insulate, must survive 200°C, must not shatter), then ranking what remains.",
        formula: "a material can lead in σ and lose in σ / ρ",
      },
    ],
    bench: "compare",
    prompt: "Pin up to three materials. Compare density, stiffness, strength, and service temperature — then look at strength per density.",
    note: "Order-of-magnitude teaching values, not a datasheet. Wood and fiber composites are directional; the number assumes the load runs with the grain or the fiber. Glass is much stronger in compression than in tension.",
    checks: [
      {
        prompt: "Specific strength is most useful when…",
        options: [
          "The part is a furnace brick and mass is irrelevant",
          "Mass is expensive, as in something you must lift or accelerate",
          "You only care about electrical resistance",
          "Two materials have the same color",
        ],
        answer: 1,
        why: "Dividing by density rewards materials that buy strength without buying mass. A fixed furnace brick is the opposite problem.",
      },
      {
        prompt: "Aluminum is less stiff than steel, per volume. A fair next thought is…",
        options: [
          "Aluminum can never be used in a stiff structure",
          "A deeper aluminum section can still win on mass",
          "Modulus and density are the same property",
          "Steel’s modulus falls to zero in thin sections",
        ],
        answer: 1,
        why: "Stiffness of a beam depends on modulus and on the second moment of area. Extra depth is a powerful lever, and aluminum’s lower density can pay for that extra depth.",
      },
      {
        prompt: "Why keep cost in the selection even after the mechanics look good?",
        options: [
          "Cost is a disguised name for density",
          "A part that cannot be paid for is not a solution",
          "The cheapest material is always the lightest",
          "Codes forbid using expensive alloys",
        ],
        answer: 1,
        why: "Cost, forming route, and availability are constraints on the same footing as stress. A perfect specific strength that you cannot afford is a different design.",
      },
      {
        prompt: "Glass shows a modest tensile strength here, yet people build with it. What is easy to forget?",
        options: [
          "Glass has no modulus",
          "It is much happier in compression than in tension, and flaws dominate tension",
          "Glass is a polymer",
          "Tensile and compressive strength are always equal",
        ],
        answer: 1,
        why: "Brittle solids fail in tension from cracks. Compression closes cracks. A single “strength” cell hides that split.",
      },
    ],
  },
  {
    id: "grains",
    track: "materials",
    index: 5,
    title: "Grains and processing",
    minutes: 10,
    lede: "You will predict how grain size and a hot anneal change the yield strength of the same alloy.",
    ideas: [
      {
        heading: "A metal is a mosaic",
        body: "Most metals are polycrystalline: many crystals, called grains, meeting at boundaries. Inside a grain the atomic planes are neat. At the boundary the pattern has to turn. Dislocations — the line defects that let a metal slip — have trouble crossing that turn. More boundary per volume means slip gets started later. The metal yields at a higher stress.",
      },
      {
        heading: "Hall–Petch",
        body: "Smaller grains usually mean a higher yield strength. For a wide range of grain sizes the yield strength rises as grains get smaller, roughly with the inverse square root of grain diameter. That is the Hall–Petch relation. It is not magic and it does not continue forever, but it is why “fine grained” shows up in specifications as a strength requirement, not an aesthetic one.",
        formula: "σy = σ0 + k / √d",
      },
      {
        heading: "Heat moves the grain",
        body: "Heating a metal until the grains grow usually makes it softer. Hold a metal hot and the grains can grow. Boundary area falls, and yield strength usually falls with it. Cold work does the opposite kind of thing: it multiplies dislocations and hardens the metal, at the cost of ductility. Annealing can wipe that hardness back out. Processing is a property. The alloy name on the box is only half the story.",
      },
    ],
    bench: "grains",
    prompt: "Grow or refine the grains. The yield strength follows the inverse square root — boundaries are the obstacles.",
    note: "Sketch for a generic metal: σ0 = 120 MPa, k = 0.6 MPa·√m. Real Hall–Petch constants depend on the alloy, and extremely fine grains can change mechanism. The drawing uses a few cells to stand in for millions.",
    clip: {
      youtubeId: "xuL2yT-B2TM",
      title: "Self organising steel balls explain metal heat treatment",
      channel: "Steve Mould",
      start: 71,
      end: 180,
      watch: "The metal under the microscope. The regions with borders are grains.",
      leave: "Stop when the explanation of dislocations starts. Smaller grains, higher yield strength, is the rule on this page.",
    },
    checks: [
      {
        prompt: "In the Hall–Petch range, making grains smaller typically…",
        options: [
          "Lowers yield strength",
          "Raises yield strength",
          "Changes the element on the periodic table",
          "Removes the need for dislocations",
        ],
        answer: 1,
        why: "Finer grains mean more boundary area blocking dislocation motion, so the stress to yield goes up. The formula’s 1/√d term is that effect.",
      },
      {
        prompt: "What is a grain boundary doing in this story?",
        options: [
          "It is a free surface open to the air",
          "It is a mismatch between crystals that dislocations struggle to cross",
          "It is a polymer chain tie",
          "It is the yield stress itself",
        ],
        answer: 1,
        why: "Neighboring crystals meet at different orientations. Slip does not run cleanly from one into the next, so boundaries pile dislocations up.",
      },
      {
        prompt: "A long anneal grows the grains. A likely result is…",
        options: [
          "A higher yield strength",
          "A softer metal, all else equal",
          "The metal becomes a ceramic",
          "Density doubles",
        ],
        answer: 1,
        why: "Larger grains, fewer boundaries, easier slip, lower yield stress. Annealing is often used on purpose to restore ductility after cold work.",
      },
      {
        prompt: "Two bars share a composition. One was cold-worked, one was annealed. Why might their strengths differ?",
        options: [
          "Composition is the only variable that can matter",
          "Processing changed the microstructure — dislocations and grains",
          "Annealing always adds carbon",
          "Cold work changes Young’s modulus by an order of magnitude",
        ],
        answer: 1,
        why: "Cold work stores dislocations and hardens; annealing lets them rearrange and grains grow. Same chemistry, different obstacle course for slip. Modulus, by contrast, barely moves.",
      },
    ],
  },
  {
    id: "selection",
    track: "materials",
    index: 6,
    title: "Choosing",
    minutes: 11,
    lede: "You will screen materials with a strength floor and a density ceiling, then rank whoever is left.",
    ideas: [
      {
        heading: "Log axes, clustered families",
        body: "Use a log scale because strength and density each span factors of a thousand. Modulus, strength, and density each span orders of magnitude, so a linear axis squashes most materials into a corner. On a log–log plot the families form clouds you can learn to see: metals in a band, ceramics up and to the right, polymers down and to the left, woods and foams lighter still. You are looking at bonding and atomic packing, not at a logo.",
      },
      {
        heading: "Screen, then rank",
        body: "First throw out materials that miss a hard limit. Then rank only what remains. Constraints throw materials out. “Strength at least this” and “density at most that” are screens. They do not crown a winner. Among whatever survives, you rank by an index that matches the goal: strength per density for a light tie-rod, modulus per density for a light stiff tie, or cost per unit of that index if money is the objective. Different indexes, different winners.",
        formula: "keep if σ ≥ σ_min and ρ ≤ ρ_max, then rank the survivors by σ / ρ",
      },
      {
        heading: "The chart is not the shop",
        body: "A point that wins specific strength can still lose because you cannot drill it, certify it, or keep it cool. Fiber composites sit high and still demand a direction. The chart’s job is to stop you falling in love with a material that already fails a hard limit, and to show you the neighborhood you should be shopping in.",
      },
    ],
    bench: "ashby",
    prompt: "Set a minimum strength and a maximum density. See who survives, and who leads on strength per density inside that window.",
    note: "Teaching chart. Strength is a generic allowable, density is mass per volume. Composites and wood are plotted for their strong direction. Nothing here knows about price, corrosion, or fatigue.",
    checks: [
      {
        prompt: "Why are Ashby charts usually logarithmic?",
        options: [
          "Logarithms make every material look equally stiff",
          "The properties span factors of hundreds or thousands, and families cluster on a log scale",
          "A log axis removes the need for units",
          "It hides ceramics",
        ],
        answer: 1,
        why: "Density, modulus, and strength cover many decades. A log–log plot gives the clouds room to separate so a screen is something you can see.",
      },
      {
        prompt: "You set a minimum strength and a maximum density. Materials outside the window are…",
        options: [
          "The winners",
          "Screened out by a constraint, before any ranking",
          "Illegal to plot",
          "Automatically the cheapest",
        ],
        answer: 1,
        why: "That is screening. Ranking is a second step, applied only to what is left. A glorious specific strength below the strength floor never enters the contest.",
      },
      {
        prompt: "The lightest material on the chart is not automatically the best structure because…",
        options: [
          "Mass is the only mechanical property",
          "Stiffness, strength, and the shape of the section can matter more than density alone",
          "Light materials cannot be drawn on a log axis",
          "Density and strength are identical numbers",
        ],
        answer: 1,
        why: "A foam is light and useless as a bolt. The right index mixes the properties the duty actually needs, and the shape (tubes, I-beams) is a separate lever.",
      },
      {
        prompt: "A carbon-fiber composite leads the window on specific strength. What should you still ask?",
        options: [
          "Nothing — the index ended the design",
          "Whether the load really runs along the fiber, and whether cost and temperature allow it",
          "Whether the chart used linear axes",
          "Whether metals are allowed to have a density",
        ],
        answer: 1,
        why: "The plotted strength is directional. Perpendicular to the fiber the point would sit somewhere much less flattering. Cost and service temperature are screens the chart did not apply.",
      },
    ],
  },
  {
    id: "birth",
    track: "materials",
    index: 7,
    title: "Where a crack is born",
    minutes: 10,
    lede: "You will say where a fatigue crack starts in a smooth metal, and which property lasts longer when the strain is large.",
    ideas: [
      {
        heading: "Slip that does not come back",
        body: "In a smooth metal the crack is born at the free surface, where slip can leave the crystal. A few planes slip forward under the peak and not all the way back, over and over, until a tongue of metal stands out and a notch stands in. That pair is an extrusion and an intrusion. The intrusion is the crack, a few grains deep, still lying on the slip plane. That is stage I.",
      },
      {
        heading: "Then it turns and opens",
        body: "After a few grains the crack leaves the slip plane and grows straight across the section, opening and closing. That is stage II, and it is the striation you already counted with ΔK. A scratch, an inclusion, or a weld toe is already past stage I. Those parts do not get the long birth this lesson calculates. Their life is propagation.",
      },
      {
        heading: "Strength and ductility trade places",
        body: "Write the strain amplitude as an elastic piece plus a plastic piece. The elastic piece is a strength over modulus, and it governs a small wiggle that stays springy for millions of cycles. The plastic piece is a ductility, and it governs a wiggle large enough to yield every time. A hard steel can win the first contest and lose the second. N is cycles to failure. The powers are on 2N, which is reversals, two per cycle. Those powers do not combine, so there is no tidy algebra for N. The bench searches until the two pieces add up to the strain you set.",
        formula: "ε_a = (σ_f′ / E) (2N)^b + ε_f′ (2N)^c",
      },
    ],
    bench: "strain",
    prompt: "Compare hard steel and mild steel at 0.2% strain, then at 1%.",
    note: "Teaching Coffin-Manson coefficients. Same exponents on purpose.",
    checks: [
      {
        prompt: "In a smooth metal, a fatigue crack usually starts…",
        options: [
          "In the center, where the stress is average",
          "At the surface, from slip that does not fully reverse",
          "Only after the ultimate strength is passed once",
          "At a grain boundary in every case",
        ],
        answer: 1,
        why: "The free surface lets slip step out of the crystal. Extrusion out, intrusion in. The intrusion is stage I. The interior is constrained and is not where this story starts.",
      },
      {
        prompt: "A weld toe or a sharp scratch changes the life because…",
        options: [
          "It raises Young’s modulus",
          "Stage I is already done. What remains is propagation",
          "It removes the stress range",
          "Ductility no longer appears in the formula",
        ],
        answer: 1,
        why: "Birth at a persistent slip band takes most of a smooth specimen’s life. A ready-made notch skips that birth. The crack-growth lesson is then the whole remaining life, not a small tail.",
      },
      {
        prompt: "At a small strain amplitude, which steel lasts longer on this bench, and why?",
        options: [
          "Mild steel, because it is softer",
          "Hard steel, because the elastic term is a strength over modulus",
          "They match, because the exponents match",
          "Neither, because 0.2% is above ultimate",
        ],
        answer: 1,
        why: "Small amplitude, high cycle, almost no plastic strain. The first term carries σ_f′. Hard steel’s 1800 MPa beats mild steel’s 900 MPa. Ductility is barely being asked.",
      },
      {
        prompt: "At 1% strain amplitude the winner flips because…",
        options: [
          "Hard steel’s modulus dropped",
          "The plastic term dominates, and mild steel has more ductility to spend",
          "The exponents were swapped",
          "1% strain is still fully elastic for both",
        ],
        answer: 1,
        why: "c is near −0.6, so the plastic term falls slowly and owns large strains. ε_f′ is 0.70 against 0.25. The metal that yields and keeps going outlasts the hard one when every cycle is plastic.",
      },
    ],
  },
  {
    id: "design",
    track: "engineering",
    index: 1,
    title: "The design loop",
    minutes: 9,
    lede: "You will write requirements as weights and watch the winning concept change when the weights change.",
    ideas: [
      {
        heading: "A problem without numbers is a mood",
        body: "Write the requirements as numbers before you sketch a concept. “A good water bottle” is not yet a problem. How long must it keep water cold, how heavy may it be, what may it cost, does it have to survive a drop, is it allowed to be washed in a dishwasher? Until those are stated, every concept can claim victory. Requirements are how you make “better” into something you can lose at.",
      },
      {
        heading: "Concepts are cheap hypotheses",
        body: "Generate more than one way before you fall in love. A steel vacuum bottle, a plain plastic wall, an aluminum bottle — three hypotheses about which requirement actually matters. The first prototype is not a miniature of the product. It is a tool for killing a bad hypothesis while it is still cheap.",
      },
      {
        heading: "Weights are decisions",
        body: "When requirements conflict, you are not discovering a hidden true winner. You are declaring that cold matters more than grams, or the reverse. Write the weights down. If the winner flips when you change your mind about priorities, that is the method working, not the method failing.",
        formula: "score = Σ (weight × judgment) / Σ weight",
      },
    ],
    bench: "design",
    prompt: "Weight three demands for a day-hike bottle. The winning concept should move when your priorities move.",
    note: "Scores are fixed judgments on a 1–5 scale, higher meaning better for the hiker. The bench multiplies them by your weights. It is a decision record, not a simulation of heat transfer.",
    checks: [
      {
        prompt: "Why write requirements before you sketch concepts?",
        options: [
          "Concepts are illegal until a manager signs",
          "Without them you cannot tell a good idea from one you merely like",
          "Requirements are the same thing as a prototype",
          "The first sketch is always the requirement",
        ],
        answer: 1,
        why: "Requirements are the test. A concept that arrives first tends to rewrite the test around itself. State the test while you can still bear to fail it.",
      },
      {
        prompt: "A useful prototype, early on, is mainly for…",
        options: [
          "Looking finished in a photograph",
          "Learning which assumption is wrong",
          "Replacing the requirements",
          "Matching the final color",
        ],
        answer: 1,
        why: "Early builds are questions. Finish and finish-quality come after the risky assumptions — leakage, mass, heat — have been answered.",
      },
      {
        prompt: "You change your weights and a different bottle wins. What happened?",
        options: [
          "The physics of steel changed",
          "You declared a different priority, so a different compromise won",
          "Weighted scoring is broken if the winner can move",
          "All three concepts are the same object",
        ],
        answer: 1,
        why: "The concept scores did not move. Your statement of what matters did. A method that cannot change its mind when you do is just a costume for the first idea.",
      },
      {
        prompt: "Constraints such as cost and mass belong…",
        options: [
          "In a footnote after the clever concept is chosen",
          "Inside the problem statement, as requirements",
          "Only in the marketing copy",
          "Nowhere, if the physics is elegant",
        ],
        answer: 1,
        why: "A design that ignores its constraints is a different problem than the one you were asked to solve. Elegance does not spend the budget.",
      },
    ],
  },
  {
    id: "equilibrium",
    track: "engineering",
    index: 2,
    title: "Equilibrium",
    minutes: 11,
    lede: "You will find both support forces on a beam and check that they add up to the load.",
    ideas: [
      {
        heading: "Isolate the body",
        body: "A free-body diagram is a portrait of one object with the rest of the world replaced by forces. The floor becomes a normal force. A pin becomes a reaction. Gravity becomes a weight. If you leave the floor in the picture as a floor, you will double-count or forget. Draw the cut, then draw only what crosses the cut.",
      },
      {
        heading: "Two sentences for “at rest”",
        body: "A body at rest needs both zero net force and zero net moment. The forces in each direction sum to zero. The moments about any point you choose sum to zero. The first keeps the center of mass from accelerating. The second keeps the body from angular acceleration. A bridge that satisfies forces but not moments is a bridge that starts to rotate. Both sentences are required.",
        formula: "ΣF = 0    and    ΣM = 0",
      },
      {
        heading: "Move the load, move the reactions",
        body: "On a simply supported beam, a downward load is shared by the two supports. Slide the load toward the left support and the left reaction grows; the right one shrinks. The share is a lever rule: each support takes the load in proportion to how close the load is to the other support. Moments make that inevitable. It is also why you do not stand on the weak end of a plank.",
        formula: "R_A = P (L − a) / L    R_B = P a / L",
      },
    ],
    bench: "beam-reactions",
    prompt: "Slide a load along a simply supported beam. The two supports should always add up to the load, and the nearer support should carry more.",
    note: "The beam is weightless in this model, the supports are pins at the ends, and the load is a single downward force. Moment shown is the sagging moment under the load.",
    checks: [
      {
        prompt: "A body sits still. Which statement is required?",
        options: [
          "Net force is zero, but net moment may be anything",
          "Net force is zero and net moment is zero",
          "Every individual force is zero",
          "The supports must be equal, always",
        ],
        answer: 1,
        why: "Zero net force prevents translational acceleration. Zero net moment prevents rotational acceleration. Individual forces are usually not zero — they cancel.",
      },
      {
        prompt: "You slide the load toward support A. What happens?",
        options: [
          "A carries more, B carries less",
          "Both supports increase",
          "A carries less, because the load is “on” A",
          "The reactions no longer sum to the load",
        ],
        answer: 0,
        why: "Moment balance about B forces A’s reaction up as the load approaches A. Vertical force balance then forces B down. The two reactions still sum to P.",
      },
      {
        prompt: "A free-body diagram should show…",
        options: [
          "The whole assembly, including every neighboring part as a solid",
          "One body, with contacts replaced by the forces they exert",
          "Only the forces you intend to design, not the reactions",
          "Materials and colors, but not vectors",
        ],
        answer: 1,
        why: "Isolation is the point. Neighbors appear only as the forces and moments they apply. If the neighbor is still drawn as geometry, the diagram is a picture, not a balance.",
      },
      {
        prompt: "A moment has units of…",
        options: [
          "Force per area",
          "Force times length",
          "Mass times length",
          "Dimensionless strain",
        ],
        answer: 1,
        why: "Moment is a force times the perpendicular distance to the line of action. Newton-meters, or kN·m. Stress is the one with force per area.",
      },
    ],
  },
  {
    id: "stress",
    track: "engineering",
    index: 3,
    title: "Stress and safety",
    minutes: 11,
    lede: "You will compute stress, stretch, and factor of safety, and say when the bar yields.",
    ideas: [
      {
        heading: "Spread the force",
        body: "Axial stress is the force divided by the area that carries it. Two bolts can share a load that would snap one. A sharp shrinkage of area — a notch, a thread root, a scratch — does the opposite, and the average σ = F/A underestimates the local peak. The average is still the right first calculation. You just do not stop there if the shape is rude.",
        formula: "σ = F / A",
      },
      {
        heading: "Strain is a ratio",
        body: "Strain is the change in length divided by the original length. It has no units. In the elastic range, strain is stress divided by modulus. A stiff material (high E) gives you a small strain for the same stress, which is a small change in length. People mix up “it didn’t stretch” with “it wasn’t stressed.” A ceramic can be highly stressed and still barely move.",
        formula: "ε = ΔL / L = σ / E    while elastic",
      },
      {
        heading: "Factor of safety is a budget",
        body: "Divide the stress the material can take by the stress you expect. If that factor is below one, the model says the part yields or breaks. If it is barely above one, you have spent the entire strength on the load you remembered, and left nothing for uncertainty, wear, or a bad day. Codes tell you how large the budget must be. The idea is older than the codes: do not design to the edge of a number you only half believe.",
        formula: "n = σ_allow / σ",
      },
    ],
    bench: "axial",
    prompt: "Push on a round bar. Change the diameter and the material. Watch stress, stretch, and the factor of safety.",
    note: "Uniform axial stress, elastic until yield. Teaching yield values: mild steel 250 MPa, aluminum 6061-T6 275 MPa, titanium grade 5 880 MPa, nylon 70 MPa. Length is 250 mm. No stress concentration.",
    checks: [
      {
        prompt: "Two bars carry the same force. The thinner one sees…",
        options: [
          "The same stress, because the force is the same",
          "Higher stress, because the area is smaller",
          "Lower stress, because less material is involved",
          "Zero stress if it is shorter",
        ],
        answer: 1,
        why: "σ = F/A. Force fixed, area down, stress up. Length does not appear in the stress; it appears in the elongation.",
      },
      {
        prompt: "Strain ε = ΔL / L is…",
        options: [
          "A force, in newtons",
          "Dimensionless",
          "A modulus, in GPa",
          "Always equal to the factor of safety",
        ],
        answer: 1,
        why: "Length over length cancels. Microstrain is just a convenient scaling (10⁻⁶), not a different dimension. Modulus is stress over strain.",
      },
      {
        prompt: "A computed factor of safety of 0.7 means…",
        options: [
          "The part is 70% lighter than it needs to be",
          "Expected stress is above the allowable — the model predicts failure",
          "The part is safe with a 30% margin",
          "Strain is 0.7",
        ],
        answer: 1,
        why: "n = allowable / actual. Below 1, actual wins. It is not a margin; the margin has already been spent past zero.",
      },
      {
        prompt: "In the elastic range, the same stress produces less elongation in a material with…",
        options: [
          "A lower modulus",
          "A higher modulus",
          "A smaller factor of safety, by definition",
          "A longer free length, always, regardless of modulus",
        ],
        answer: 1,
        why: "ε = σ/E, and ΔL = ε L. Higher E, smaller strain, smaller stretch for a given length. Length still matters — a long bar of the same material stretches more — but the question holds E as the variable.",
      },
    ],
  },
  {
    id: "beams",
    track: "engineering",
    index: 4,
    title: "Beams and stiffness",
    minutes: 11,
    lede: "You will separate “will it break?” from “is it too saggy?”, and see how span and depth change the sag.",
    ideas: [
      {
        heading: "Length is expensive",
        body: "For a simply supported beam with a load at midspan, deflection grows with the cube of the length. Double the span and the sag multiplies by eight, if nothing else changes. That is why a bookshelf bracket and a footbridge are not the same design scaled up. Span is the first number to be suspicious of.",
        formula: "δ = P L³ / (48 E I)",
      },
      {
        heading: "Height is a gift",
        body: "The second moment of area for a rectangle goes with the cube of its height. Double the depth, eight times the I, an eighth of the deflection. This is why I-beams put material far from the center and why a flat plank turned on its edge suddenly feels trustworthy. Width matters only to the first power. Depth is the lever.",
        formula: "I = b h³ / 12",
      },
      {
        heading: "Serviceability",
        body: "A beam can pass the stress check and still be unacceptable because it sags. Strength asks “will it break?” Serviceability asks “will people trust it?” A common rule of thumb throws out beams that sag more than about the span over 250 under ordinary load. Floors that pass the stress check and fail this one feel wrong: dishes rattle, plaster cracks, users invent a complaint they cannot phrase. Both checks are the design.",
        formula: "also require δ ≤ δ_allowed. Strength passing does not settle this",
      },
    ],
    bench: "deflection",
    prompt: "Load a rectangular beam at midspan. Trade length, depth, and material. The drawing exaggerates the sag; the number does not.",
    note: "Elastic small-deflection formula for a simply supported beam, center point load, rectangular section, width fixed at 40 mm. If the predicted sag exceeds about a fifth of the span, the formula has left its range — the bench will say so.",
    checks: [
      {
        prompt: "For this midspan-loaded beam, doubling only the span multiplies deflection by…",
        options: ["2", "4", "8", "16"],
        answer: 2,
        why: "δ scales with L³. 2³ = 8. The load, modulus, and I were held fixed. This is why span reductions are so effective.",
      },
      {
        prompt: "Doubling only the depth of a rectangular section multiplies I by…",
        options: ["2", "4", "8", "It does not change I"],
        answer: 2,
        why: "I = b h³ / 12. Width fixed, depth doubled, h³ grows by 8. Deflection, which has I in the denominator, falls by the same factor.",
      },
      {
        prompt: "A beam is well under its failure stress but sags L/100. A fair verdict is…",
        options: [
          "It is fine, because it will not break",
          "It can still be unacceptable as a serviceable beam",
          "The modulus must be zero",
          "Stress and deflection are the same check",
        ],
        answer: 1,
        why: "L/100 is much limper than the L/250 rule of thumb. Strength did not fail. Stiffness, or the user’s sense of it, did. They are separate limits.",
      },
      {
        prompt: "Swapping in a material with higher Young’s modulus, geometry fixed, will…",
        options: [
          "Increase the sag",
          "Decrease the sag",
          "Change I, not the sag",
          "Remove the need to support the beam",
        ],
        answer: 1,
        why: "E sits in the denominator of δ. Stiffer material, less elastic deflection, same second moment. I is geometry; E is the material.",
      },
    ],
  },
  {
    id: "tradeoffs",
    track: "engineering",
    index: 5,
    title: "Tradeoffs",
    minutes: 9,
    lede: "You will throw out an option that loses on every criterion, then let your weights choose among the rest.",
    ideas: [
      {
        heading: "Dominated options",
        body: "If concept B is worse than concept A on every criterion you actually care about, stop scoring B. It is dominated. No set of positive weights can save it. People keep dominated options in meetings because they were someone’s first sketch. Throw them out before the arithmetic, and the arithmetic gets shorter and harder to fudge.",
        formula: "drop B when A ≥ B on every criterion and A > B on one",
      },
      {
        heading: "Weights are the design",
        body: "The weights are your priorities. They are not a measurement of the one true answer. A weighted sum looks like a machine that outputs truth. It outputs the consequence of the weights you typed. Raise “looks” and the handsome shelf wins. Raise “cost” and the plain one wins. That is not corruption of the method. The method’s whole job is to show that flip in daylight, where someone can disagree with the weight instead of arguing about a vibe.",
        formula: "score = Σ (w × s) / Σ w",
      },
      {
        heading: "What the number hides",
        body: "A single score buries a fatal flaw if you let a high mark elsewhere compensate. Sometimes compensation is fine (a slightly uglier shelf). Sometimes it is not (a shelf that is cheap because it will come off the wall). Hard constraints — “must hold 30 kg”, “must not tip” — should have been screens before the weights. If a criterion can veto, do not average it.",
        formula: "if a criterion can veto, screen with it. Do not put it in the weighted average",
      },
    ],
    bench: "tradeoffs",
    prompt: "Weight stiffness, mass, cost, and looks for a wall shelf. Notice the dominated option, and notice the winner move.",
    note: "Scores are 1–5, higher is better, fixed in advance. “Dominated” means some other concept is at least as good on every criterion and better on one. Weights do not rescue it.",
    checks: [
      {
        prompt: "An option that loses to another on every criterion you listed is…",
        options: [
          "The one weights are designed to save",
          "Dominated — drop it before weighting",
          "Always the cheapest in the shop",
          "Proof that scoring is subjective and should be skipped",
        ],
        answer: 1,
        why: "No positive weights make a unanimously worse option win. Keeping it in the table only creates a place to hide a preference.",
      },
      {
        prompt: "You change the weights and the winner changes. The honest description is…",
        options: [
          "The shelf physics changed",
          "A different stated priority produced a different compromise",
          "The method has failed and should be discarded",
          "All options were dominated",
        ],
        answer: 1,
        why: "The concept scores stayed put. The decision about what matters moved. Being able to see that is the reason to write weights down.",
      },
      {
        prompt: "A criterion that must not be violated, no matter how good the other scores are, should be…",
        options: [
          "Given a modest weight and averaged in",
          "Used as a screen before any weighted sum",
          "Ignored, because averages are fair",
          "Applied only after the winner is announced",
        ],
        answer: 1,
        why: "Averages let excellence in one column pay for failure in another. A veto — “must hold the books” — is a constraint, not a preference. Screen with it first.",
      },
      {
        prompt: "Weighted scoring is best understood as…",
        options: [
          "A measurement of an objective best shelf, the way mass is a measurement",
          "A written record of priorities, whose result you can argue with",
          "A substitute for checking whether the shelf breaks",
          "Useful only when every score is identical",
        ],
        answer: 1,
        why: "It does not replace equilibrium or stress. It starts after the impossible options are gone, and it makes the remaining value judgment explicit enough to disagree with.",
      },
    ],
  },
  {
    id: "failure",
    track: "engineering",
    index: 6,
    title: "How things fail",
    minutes: 12,
    lede: "You will tell buckling apart from yield, and name fatigue and corrosion as two other ways a part can fail.",
    ideas: [
      {
        heading: "Buckling is not yielding",
        body: "Buckling is the column bowing sideways before the material reaches its yield stress. A short, fat bar in compression squashes when the stress hits yield. A long, thin bar bows sideways at a load Euler can predict, while the stress is still far below yield. The material did not “get weaker.” The shape became unstable. Bracing the middle, shortening the span, or thickening the section attacks buckling. Switching to a stronger alloy often barely helps, because Euler’s load depends on modulus and geometry, not on yield strength.",
        formula: "Pcr = π² E I / L²    (pinned ends)",
      },
      {
        heading: "Fatigue is a slow argument",
        body: "A load that is safe once can still grow a crack if it repeats. The stress at the tip of a small flaw is higher than the average σ = F/A. Each cycle advances the crack a little. After enough cycles the remaining ligament fails, sometimes with no visible yield beforehand. Shafts, bridges, airplane skins, and the clip you bend back and forth all live in this regime. “Below yield” is not the same sentence as “safe forever.”",
        formula: "the stress can sit under yield and still use up life, one cycle at a time",
      },
      {
        heading: "The section you used to have",
        body: "Corrosion and wear remove area. The force may be unchanged while the stress climbs, because the denominator shrank. A factor of safety computed on the new part does not apply to the part after ten winters. Failure analysis asks which mechanism is the impatient one: yield, fracture, buckling, fatigue, or section loss. The impatient one is the design.",
        formula: "σ = F / A_remaining",
      },
    ],
    bench: "buckling",
    prompt: "Lengthen a steel column or thicken it. See whether Euler buckling or simple yield gets there first, then push the load past that limit.",
    note: "Square section, pinned ends, mild steel E = 200 GPa and yield 250 MPa. Euler ignores imperfections, so real columns bow earlier. Fatigue and corrosion are in the reading; this bench only settles buckling versus yield.",
    clip: {
      youtubeId: "SUxabSClpAc",
      title: "What is buckling?",
      channel: "StructEd",
      start: 30,
      end: 150,
      watch: "The ruler. Pushing the ends makes it bow. Holding the middle makes that much harder.",
      leave: "Stop after the ruler. Do not take his later formulas. Ours is the pinned-end Euler load on the bench.",
    },
    checks: [
      {
        prompt: "A slender column bows at a load well below yield. This is…",
        options: [
          "Proof the yield strength was measured wrong",
          "Buckling — a loss of stability, not a crush of the material",
          "Fatigue, because it happened once",
          "Only possible in tension",
        ],
        answer: 1,
        why: "Euler load can sit far under the load that would yield the section. The column leaves its straight shape. Stronger steel (higher yield, same E) may not raise that load at all.",
      },
      {
        prompt: "Euler’s pinned-end load depends strongly on length because…",
        options: [
          "L is squared in the denominator",
          "Yield strength is proportional to length",
          "Density increases with length",
          "Modulus falls with L²",
        ],
        answer: 0,
        why: "Pcr = π²EI/L². Doubling a pinned length cuts the buckling load by four. Shortening and bracing are the classic fixes for that reason.",
      },
      {
        prompt: "A part sees a repeating stress below its yield strength and eventually cracks. The likely mechanism is…",
        options: [
          "Single-load yielding",
          "Fatigue crack growth",
          "Euler buckling of a short block",
          "A rise in Young’s modulus",
        ],
        answer: 1,
        why: "Cyclic load can extend a flaw a little each cycle until the remaining section fails. Being under yield once does not retire that mechanism.",
      },
      {
        prompt: "Corrosion makes a bar more likely to yield under the same force because…",
        options: [
          "It increases the area",
          "It removes area, so the same force produces higher stress",
          "It changes π in Euler’s formula",
          "It converts steel into a polymer",
        ],
        answer: 1,
        why: "σ = F/A. Lose area, gain stress, spend the factor of safety you computed on the original drawing. Section loss is a loading increase you did not schedule.",
      },
    ],
  },
  {
    id: "notch",
    track: "engineering",
    index: 7,
    title: "The notch",
    minutes: 9,
    lede: "You will separate the average stress from the peak at a fillet, and refuse to trust the average alone.",
    ideas: [
      {
        heading: "The average is the polite number",
        body: "Average stress is force divided by the net area, and it does not know the corner exists. The metal at a sharp fillet or a hole sees more than that average. A part can yield at the corner while F/A still looks comfortable. If you only checked the average, you checked a different bar.",
        formula: "σ_peak = Kt × σ_avg",
      },
      {
        heading: "Radius is the lever you actually have",
        body: "Kt falls as the fillet radius grows, and it climbs without a polite limit as the radius goes to zero. On this bench the net section is fixed, so the average cannot move. Only the peak moves. Buying a stronger alloy while keeping a razor corner is how people spend money on the wrong term.",
      },
      {
        heading: "A hole in a wide plate is the textbook three",
        body: "A small circular hole in a wide plate in tension has Kt near 3, based on the net-section average. The bench is a shoulder fillet instead, so you can watch one radius. The lesson is the same one. The peak is a multiple of the average, and the multiple is geometry.",
        formula: "Kt ≈ 3 for a small round hole in a wide plate",
      },
    ],
    bench: "notch",
    prompt: "Set the fillet to 0.5 mm, then to 4 mm.",
    note: "Teaching Kt for a 30 mm to 20 mm step. Not a Peterson chart.",
    checks: [
      {
        prompt: "On this bench, what stays put when you grow the fillet?",
        options: [
          "The peak stress",
          "The average stress, because the net area and the force did not change",
          "Kt",
          "The yield strength",
        ],
        answer: 1,
        why: "Average is 8 kN over 20 mm by 5 mm, which is 80 MPa whatever the corner is. The fillet changes Kt, and the peak is Kt times that average.",
      },
      {
        prompt: "A 0.5 mm fillet can yield while the average still looks safe because…",
        options: [
          "Yield strength depends on radius",
          "The peak, not the average, is what the metal at the corner feels",
          "The force doubles at a corner",
          "Kt is always 1",
        ],
        answer: 1,
        why: "The corner is a smaller, harsher problem than the bar as a whole. Reporting only F/A is reporting the bar you wish you had drawn.",
      },
      {
        prompt: "A small hole in a wide plate in tension is classically…",
        options: [
          "Kt near 3 on the net-section average",
          "Unstressed, because the hole removed the load",
          "Kt = 1, because circles are smooth",
          "Stronger than the plate without a hole",
        ],
        answer: 0,
        why: "The classic result is a peak about three times the net average. Smooth is not the same as mild. A hole is a notch with a name.",
      },
      {
        prompt: "Which change attacks the peak without changing the average?",
        options: [
          "A larger fillet radius",
          "A smaller net section at the same force",
          "A longer bar of the same section",
          "Painting the bar",
        ],
        answer: 0,
        why: "Radius is in Kt. Area and force are in the average. Length does not appear. Paint does not carry load.",
      },
    ],
  },
  {
    id: "fatigue",
    track: "engineering",
    index: 8,
    title: "A load that returns",
    minutes: 10,
    lede: "You will read a life off a repeating stress that is still below yield.",
    ideas: [
      {
        heading: "Below yield is not forever",
        body: "A stress the bar survives once can still grow a crack if it keeps coming back. The crack starts at a notch, a scratch, or a fillet, where the local stress is the peak from the previous lesson. Each cycle adds a little length. The bar can finish as a fracture with almost no visible yield.",
        formula: "a stress below yield can still finish the part, after enough cycles",
      },
      {
        heading: "Life is a line on log paper",
        body: "Plot alternating stress against cycles, both on log scales, and a polished metal gives a sloping line. Higher stress, shorter life. Steel, in this model, flattens after about a million cycles. Below that plateau the model stops counting and calls it a runout. Aluminum does not flatten. A modest stress still has a number.",
        formula: "Life from the slope between 10³ cycles and the far end",
      },
      {
        heading: "The chart is for a smooth, dry specimen",
        body: "Bring a notched part and you must enter the peak, not the average. Add salt water or a pit and the steel plateau can disappear. This bench is fully reversed and polished on purpose, so the slope is the only thing moving. It is not a certified life.",
      },
    ],
    bench: "fatigue",
    prompt: "Set aluminum to 120 MPa, then steel to 200 MPa.",
    note: "Teaching S-N curves. Not an ASME fatigue calculation.",
    checks: [
      {
        prompt: "Aluminum at 120 MPa on this bench is…",
        options: [
          "Above yield, so it breaks on the first pull",
          "Under yield, with a finite life anyway",
          "On a plateau, so the model stops counting",
          "Unstressed",
        ],
        answer: 1,
        why: "Yield is 280 MPa. 120 is under it. Aluminum's line has not flattened, so the chart still names a number of cycles.",
      },
      {
        prompt: "Steel at 200 MPa is called a runout here because…",
        options: [
          "200 is above yield",
          "It sits under the plateau, where this model stops the crack",
          "Steel cannot crack",
          "The chart has no steel line",
        ],
        answer: 1,
        why: "The plateau is 300 MPa, yield is 480. Under the plateau the sloping line is over. The note is the warning: a notch or corrosion can put you back on a slope.",
      },
      {
        prompt: "A filleted part should enter this chart at…",
        options: [
          "The average stress",
          "The peak stress, Kt times the average",
          "The yield strength, always",
          "Zero, because fillets are safe",
        ],
        answer: 1,
        why: "The chart is for a smooth specimen. The metal at a fillet feels the peak. Feeding it the average is how a 'safe' life is printed for a part that is cracking.",
      },
      {
        prompt: "What does this model refuse to be?",
        options: [
          "A way to see that life can be finite below yield",
          "A certified service life for a salty, notched part",
          "A contrast between a steel plateau and aluminum",
          "Fully reversed",
        ],
        answer: 1,
        why: "Polished, dry, no notch, fully reversed. Change any of those and you need a different chart. The shape of the lesson survives. The number does not automatically.",
      },
    ],
  },
  {
    id: "crack",
    track: "engineering",
    index: 9,
    title: "The crack grows",
    minutes: 11,
    lede: "You will take a crack that already exists and see why it crawls, then runs.",
    ideas: [
      {
        heading: "One stripe per cycle",
        body: "Each cycle can leave one stripe on the broken face, called a striation. Load up and slip at the tip blunts the crack. Load down and slip the other way resharpens it, a little farther on. The smooth-bar lesson never looked at that tip. It gave the whole bar one life.",
      },
      {
        heading: "Name the tip with K",
        body: "Elastic theory sends the stress at the tip to infinity, which is not a usable number. The usable number is the stress intensity: a geometry factor, times the remote stress, times the square root of the crack length. Double the stress, or make the crack four times as long, and K doubles. Under a threshold range this model sets the growth to zero. The crack is still there. It sits.",
        formula: "ΔK = Y Δσ √(π a)",
      },
      {
        heading: "The rate feeds on itself",
        body: "In the middle regime the growth per cycle is a constant times ΔK raised to a power, near 3 for many steels. ΔK rises as the crack gets longer, so a load that barely moves the tip at the start is sprinting at the end. Life is the sum of those steps from the crack you have to the crack that reaches the toughness. Most of the cycles are spent while the crack is still short.",
        formula: "da/dN = C (ΔK)^m",
      },
    ],
    bench: "crack",
    prompt: "Set steel, a 0.50 mm crack, and 120 MPa. Then double the stress.",
    note: "Barsom ferrite-pearlite constants, with a teaching toughness so the end of the curve is visible.",
    checks: [
      {
        prompt: "Doubling the stress, with m = 3, does what to the growth on the first cycle?",
        options: [
          "Doubles it",
          "Multiplies it by about eight",
          "Leaves it unchanged, because the crack length did not change",
          "Stops the crack",
        ],
        answer: 1,
        why: "ΔK doubles with the stress, and the rate goes with ΔK cubed. Two cubed is eight. The life falls by a little more than that, because the crack that reaches the toughness also got shorter.",
      },
      {
        prompt: "You keep the stress and lengthen the starter crack. Life…",
        options: [
          "Stays the same, because stress did not change",
          "Gets shorter, because ΔK is already larger",
          "Becomes infinite",
          "Depends only on yield strength",
        ],
        answer: 1,
        why: "K carries the square root of the length. A longer crack is a harder tip on day one, and it has less distance left before the toughness. Same remote stress, shorter life.",
      },
      {
        prompt: "Under the threshold range, this model says the crack…",
        options: [
          "Runs away at once",
          "Sits, with no growth per cycle",
          "Grows at the Paris rate anyway",
          "Heals shut",
        ],
        answer: 1,
        why: "Threshold is a floor on ΔK, not a claim that the metal is immortal. Salt water, a sharper defect, or a higher stress can put the same crack over the floor. The bench is air, room temperature, and a single edge crack.",
      },
      {
        prompt: "Why does this bench count the whole stress range?",
        options: [
          "The stress runs from zero up to the top, so the crack stays open",
          "Cracks grow fastest in compression",
          "Y is zero in tension",
          "Toughness is the same thing as ΔK",
        ],
        answer: 0,
        why: "Faces that are pressed shut do not add to the opening. A fully reversed cycle is a different count: only the part that opens the crack belongs in ΔK. This bench never goes compressive, so the whole range counts.",
      },
    ],
  },
  {
    id: "bolt",
    track: "engineering",
    index: 10,
    title: "The bolt",
    minutes: 9,
    lede: "You will tell a clamping bolt from a pin, and keep the threads out of the shear plane.",
    ideas: [
      {
        heading: "Clamp is tension",
        body: "A bolt's first job is to squeeze the joint. That squeeze is tension in the bolt and compression in the plates. While friction from that squeeze can carry the sideways load, the shank is not in shear. The bolt is a clamp, not a nail.",
        formula: "Slip load = μ × clamp",
      },
      {
        heading: "Past friction, the bolt becomes a pin",
        body: "When the sideways load exceeds μ times the clamp, the plates slip. Now the shank has to carry shear. More clamp buys more friction, which is why a joint that 'just needs a bigger bolt' often needed a tighter one. The grade sets the tension the bolt can hold. It does not set μ.",
        formula: "the joint slips when the shear load exceeds μ × clamp",
      },
      {
        heading: "Threads are the small section",
        body: "If the shear plane cuts through the threads, the area is the smaller thread area, not the shank. The load did not change. The stress did, because the denominator shrank. Put the shank, not the threads, in the plane where the plates meet.",
        formula: "thread stress = force / tensile-stress area, and that area is smaller than the shank",
      },
    ],
    bench: "bolt",
    prompt: "Hold 1 kN of shear with a 12 kN clamp, then raise the shear to 4 kN and move the threads into the plane.",
    note: "One M8, μ = 0.20, one interface.",
    checks: [
      {
        prompt: "While friction holds, the bolt's load is…",
        options: [
          "Shear in the shank",
          "Tension from the clamp",
          "Zero, because friction replaced the bolt",
          "Compression in the threads",
        ],
        answer: 1,
        why: "Friction is what carries the shear between the plates. The bolt produces that friction by staying in tension. Remove the tension and the friction goes with it.",
      },
      {
        prompt: "Slip starts when the shear load…",
        options: [
          "Exceeds μ times the clamp",
          "Exceeds the bolt's yield, always",
          "Is any number above zero",
          "Equals the plate thickness",
        ],
        answer: 0,
        why: "That is the whole model. μ = 0.20 here, so a 12 kN clamp holds 2.4 kN of shear and not a newton more. The bolt grade never entered that sentence.",
      },
      {
        prompt: "Moving the threads into the shear plane…",
        options: [
          "Raises the shear load",
          "Raises the shear stress, because the area got smaller",
          "Removes friction",
          "Increases μ",
        ],
        answer: 1,
        why: "Same shear force, smaller area, higher stress. 36.6 mm² against about 50 mm² of shank. The load arrow did not grow.",
      },
      {
        prompt: "μ = 0.20 on this bench is…",
        options: [
          "A property stamped on an M8 bolt",
          "A teaching friction for dry steel, not a bolt grade",
          "Always true for oiled joints",
          "Equal to the yield strength",
        ],
        answer: 1,
        why: "Friction belongs to the surfaces. Oil, paint, and vibration change it. The bolt grade tells you how much tension you may use to create the clamp. It does not tell you μ.",
      },
    ],
  },
  {
    id: "mean",
    track: "engineering",
    index: 11,
    title: "A tensile mean",
    minutes: 9,
    lede: "You will put a steady tension under a wiggle and watch a runout leave the safe side of the Goodman line.",
    ideas: [
      {
        heading: "The plateau was for zero mean",
        body: "The steel runout on the fully reversed bench had the stress swinging through zero. A tensile mean holds the crack open for more of the cycle and spends some of the ultimate strength. Goodman draws the boundary as a straight line from that fully reversed fatigue strength down to the ultimate strength on the mean axis.",
        formula: "σ_a / Se + σ_m / Sut = 1",
      },
      {
        heading: "Yield can still be first",
        body: "The top of the cycle is the mean plus the alternating stress. If that peak reaches yield, the bar has taken a permanent set on the first pull. The fatigue line is then the wrong failure to quote. Say which limit you actually hit.",
        formula: "σ_max = σ_mean + σ_amplitude    and that peak still has to stay under yield",
      },
      {
        heading: "This line is the conservative one",
        body: "Gerber bows the same idea into a parabola and lets more combinations through. Compression is kinder than this picture, because it closes the crack, and it is not on the bench. Use Goodman when you want the straight, severe claim, and say that you did.",
      },
    ],
    bench: "mean",
    prompt: "Keep 200 MPa alternating. Raise the mean from 0 to 250 MPa.",
    note: "Se = 300 MPa, Sut = 600 MPa, yield = 480 MPa, matching the steel on the fully reversed bench.",
    checks: [
      {
        prompt: "200 MPa alternating and no mean is inside the line because…",
        options: [
          "200 is under the 300 MPa fully reversed plateau",
          "Mean stress is never allowed to be zero",
          "Ultimate strength is 200 MPa",
          "Goodman ignores alternating stress",
        ],
        answer: 0,
        why: "The intercept of the line at zero mean is Se, 300 MPa. 200 sits under it. That is the same 200 MPa the other bench called a runout, and that bench had no mean to spend.",
      },
      {
        prompt: "Raising the mean to 250 MPa, still at 200 MPa alternating, does what?",
        options: [
          "Nothing. Only the wiggle matters",
          "Pushes the sum over 1, so the runout is gone",
          "Cuts the ultimate strength in half permanently",
          "Moves the point onto the yield line only",
        ],
        answer: 1,
        why: "200/300 + 250/600 is about 1.08. The wiggle did not grow. The mean spent ultimate strength the plateau was assuming you still had.",
      },
      {
        prompt: "The peak of the cycle is…",
        options: [
          "The mean alone",
          "The alternating stress alone",
          "Mean plus alternating",
          "Ultimate minus the mean",
        ],
        answer: 2,
        why: "The steady tension is already there when the wiggle adds its top. If that sum reaches the 480 MPa yield, you have yielded, whether or not the Goodman sum is under 1.",
      },
      {
        prompt: "Gerber, compared with this bench, is…",
        options: [
          "The same straight line",
          "A parabola that allows more tensile-mean combinations",
          "A rule that forbids zero mean",
          "A measurement of ductility",
        ],
        answer: 1,
        why: "Gerber is less severe. This bench stays on the straight Goodman line so a point is either under it or not. If you switch rules, say so. Do not call a Gerber pass a Goodman pass.",
      },
    ],
  },
  {
    id: "measure",
    track: "physics",
    index: 1,
    title: "Measure and vectors",
    minutes: 10,
    lede: "You will add vectors by their components, and refuse to add the magnitudes when the directions differ.",
    ideas: [
      {
        heading: "Pick a unit and stay there",
        body: "Use one unit system for the whole calculation, and keep the unit attached to the number. SI is the dialect these benches speak: meters, kilograms, seconds, newtons. Mixing centimeters into a meter formula does not create a small, forgivable error. It creates a different problem. Convert first, then compute. A number without a unit is not a measurement. “The force was 10” is the start of an argument, not the end of one.",
      },
      {
        heading: "Direction is not decoration",
        body: "A vector has size and direction, and a scalar has only size. Distance is how much ground you covered. Displacement is where you ended relative to where you started, including the way. Speed is how fast. Velocity is how fast and which way. Mass, temperature, and energy do not point. Force, displacement, velocity, acceleration, and momentum do. If it points, you do not add it with ordinary arithmetic unless you already took components.",
      },
      {
        heading: "Components, then Pythagoras",
        body: "Break each vector into x and y. Add the x pieces to each other. Add the y pieces to each other. The resultant is a right triangle whose legs are those sums. Two forces of 3 N and 4 N only make 5 N if they are perpendicular. If they are parallel and opposed, they make 1 N or 7 N. The picture decides. The magnitudes alone do not.",
        formula: "|R| = √(Rx² + Ry²)",
      },
    ],
    bench: "vectors",
    prompt: "Add two vectors by components. Try perpendicular, then try nearly opposite, and watch the resultant refuse to be a simple sum.",
    note: "The angle is measured from the +x axis, counterclockwise, in the ordinary mathematical sense. Units are whatever you imagine, as long as both vectors share them.",
    checks: [
      {
        prompt: "Which quantity is a scalar?",
        options: ["Velocity", "Force", "Speed", "Displacement"],
        answer: 2,
        why: "Speed is the magnitude of velocity. It has no direction. Velocity, force, and displacement all point, so they are vectors.",
      },
      {
        prompt: "A 3 N force east and a 4 N force north act together. The resultant magnitude is…",
        options: ["7 N", "1 N", "5 N", "12 N"],
        answer: 2,
        why: "The components are perpendicular, so |R| = √(3² + 4²) = 5 N. Ordinary addition would be 7 N, which is what you get only if they point the same way.",
      },
      {
        prompt: "Why convert everything to SI before combining terms?",
        options: [
          "SI units are more precise than other units",
          "Terms can be added only when they are the same kind of quantity, in the same unit",
          "Newton’s laws are false in centimeters",
          "Conversion removes the need for vectors",
        ],
        answer: 1,
        why: "Precision is a separate issue. A kilometer plus a meter is not 2 of anything until you express them alike. The laws don’t care which consistent system you use; they care that it is consistent.",
      },
      {
        prompt: "Two equal magnitudes point in exactly opposite directions. Their vector sum…",
        options: [
          "Has magnitude twice either one",
          "Is the zero vector",
          "Is a scalar equal to their product",
          "Points at 45 degrees",
        ],
        answer: 1,
        why: "Components cancel: Rx = a − a = 0, Ry = 0. Equal and opposite vectors sum to nothing. That is the entire content of a balanced tug-of-war.",
      },
    ],
  },
  {
    id: "kinematics",
    track: "physics",
    index: 2,
    title: "Kinematics",
    minutes: 11,
    lede: "You will relate position, velocity, and acceleration, and read displacement as the area under the velocity graph.",
    ideas: [
      {
        heading: "Velocity is the slope of position",
        body: "On a graph of position against time, the slope is velocity. Steep and upward means fast in the positive direction. Flat means sitting still. A downward slope means moving backward — negative velocity — not “negative speed.” Speed is the absolute value. You can be moving quickly and have a negative velocity if you chose the opposite direction to be positive.",
        formula: "v = Δx / Δt",
      },
      {
        heading: "Acceleration is the slope of velocity",
        body: "Acceleration says how fast velocity is changing, not how fast you are going. A car at 30 m/s with a = 0 keeps 30 m/s. A car at 2 m/s with a large acceleration will not be slow for long. Slowing down while moving in the positive direction means the acceleration points backward. “Deceleration” is just acceleration aimed against the velocity. The sign does that work if you let it.",
        formula: "v = v0 + a t",
      },
      {
        heading: "Area is the trip",
        body: "The area under a velocity–time graph is the change in position. A rectangle of 4 m/s for 3 s is 12 m. If the velocity is negative, that area is negative displacement: you ended up behind where you started. The other useful companion, for constant acceleration, builds position out of the starting velocity and the extra triangle from acceleration.",
        formula: "x = x0 + v0 t + ½ a t²",
      },
    ],
    bench: "kinematics",
    prompt: "Give a cart a starting velocity and an acceleration. Scrub time, or let it run. The shaded area under the velocity graph is the displacement.",
    note: "Motion is along one line, acceleration is constant, and x starts at 0. The track drawing only marks a window; the numbers stay valid if the cart leaves it.",
    checks: [
      {
        prompt: "An object moves at constant velocity. Its acceleration is…",
        options: [
          "Equal to its velocity",
          "Zero",
          "Increasing with time",
          "Undefined, because velocity is constant",
        ],
        answer: 1,
        why: "Acceleration is the rate of change of velocity. If velocity does not change, that rate is zero — whether the velocity itself is large or small.",
      },
      {
        prompt: "The area under a velocity–time graph equals…",
        options: [
          "Acceleration",
          "Mass",
          "Displacement over that interval",
          "Force",
        ],
        answer: 2,
        why: "Velocity times time is a length. On a varying graph you add the thin slices. Negative velocity contributes negative area, meaning displacement the other way.",
      },
      {
        prompt: "A cart moves to the right, which you called positive, and is slowing down. Its acceleration is…",
        options: [
          "Positive",
          "Negative",
          "Zero, because it is still moving",
          "Equal to its speed",
        ],
        answer: 1,
        why: "Velocity is positive and decreasing, so the slope of velocity is negative. Acceleration points against the motion. It is not zero just because the cart has not stopped yet.",
      },
      {
        prompt: "From rest, a = 2 m/s² for 3 s. The velocity is then…",
        options: ["2 m/s", "3 m/s", "5 m/s", "6 m/s"],
        answer: 3,
        why: "v = v0 + a t = 0 + 2 × 3 = 6 m/s. The ½ a t² formula is for position, which would be 9 m here, not velocity.",
      },
    ],
  },
  {
    id: "forces",
    track: "physics",
    index: 3,
    title: "Forces",
    minutes: 12,
    lede: "You will say when a pushed block stays still, and the moment the push is large enough to accelerate it.",
    ideas: [
      {
        heading: "Zero net force is not zero motion",
        body: "Zero net force means the velocity stays constant, including a steady speed that is not zero. The first law: if the net force is zero, velocity does not change. That includes staying at rest, and it includes sliding forever in a straight line at constant speed. A hockey puck on imagined perfect ice does not need a forward force to keep its velocity. It needs a net force to change its velocity. People spend their lives pushing because the real world is full of friction, and then they mistake friction’s absence for a mystery.",
        formula: "ΣF = 0  ⇒  velocity is constant",
      },
      {
        heading: "Net force sets acceleration",
        body: "Acceleration equals the net force divided by the mass. The second law is about the sum, not about one heroic force. Directions matter: a 10 N push and a 10 N opposing friction add to nothing, so a = 0. Mass is the reluctance of velocity to change. The same net force accelerates a light cart more than a heavy one. Weight is a force, mg, downward. It is not the same word as mass.",
        formula: "ΣF = m a",
      },
      {
        heading: "Pairs, and friction’s budget",
        body: "A third-law pair is one interaction acting on two different objects. The third law: forces come in pairs, equal, opposite, and on different bodies. The book pushes on the table; the table pushes on the book. Those two are a pair. The book’s weight and the table’s normal force are not a pair — they both act on the book, which is why they can cancel in the book’s free-body diagram. Static friction, meanwhile, is not always μN. It is whatever value up to μN is needed to prevent slip. Only at the moment of slipping does it spend the whole budget.",
        formula: "friction ≤ μ N, and it points against the slip",
      },
    ],
    bench: "newton",
    prompt: "Push a block from rest. Friction matches the push until the push exceeds μN — only then does the block accelerate.",
    note: "Horizontal push, kinetic friction taken equal to μN once sliding starts, g = 9.81 m/s². The model starts from rest, so it does not cover a block already skidding the other way. Vertical forces cancel.",
    clip: {
      youtubeId: "F_UiBwTk9DM",
      title: "Friction until the block slips",
      channel: "Rhett Allain",
      watch: "The block stays still while the push climbs. It moves only after the push passes a limit, and then the force drops.",
      leave: "That drop is kinetic friction, which our bench does not model. The lesson is the wait before it moves.",
    },
    checks: [
      {
        prompt: "Net force on a body is zero. Which conclusion is justified?",
        options: [
          "The body must be at rest",
          "Its velocity is constant — rest is only a special case",
          "No forces act on it at all",
          "Its mass is zero",
        ],
        answer: 1,
        why: "The first law allows any constant velocity, including zero. Forces may still act; they have to cancel. Mass is not implied.",
      },
      {
        prompt: "The third-law partner of “the book pushes down on the table” is…",
        options: [
          "Gravity pulling the book down",
          "The table pushing up on the book",
          "The table pushing down on the floor",
          "Friction on the book",
        ],
        answer: 1,
        why: "A pair is the same interaction on two different bodies. Gravity is a different interaction (book and Earth). The normal force from the table on the book closes the contact pair.",
      },
      {
        prompt: "You increase mass and keep the net force the same. Acceleration…",
        options: ["Increases", "Decreases", "Stays the same", "Becomes equal to g"],
        answer: 1,
        why: "a = Fnet / m. Larger mass, smaller acceleration. This is the content of inertia. Weight would also change if you moved to a new planet, but mass is the quantity in the law.",
      },
      {
        prompt: "A crate is at rest and the push is smaller than μN. Static friction is…",
        options: [
          "Always exactly μN",
          "Equal to the push, and opposite it",
          "Zero, because the crate is heavy",
          "Equal to the weight",
        ],
        answer: 1,
        why: "From rest, friction spends only what it must to keep a = 0, up to a maximum of about μN. Below that maximum it matches the push. It is not obliged to sit at the maximum.",
      },
    ],
  },
  {
    id: "energy",
    track: "physics",
    index: 4,
    title: "Energy",
    minutes: 11,
    lede: "You will watch potential become kinetic, see friction divert some of it into heat, and check that mass does not change the speed.",
    ideas: [
      {
        heading: "Work is force along the motion",
        body: "A constant force does work equal to the component along the displacement, times the distance. A force perpendicular to the motion — the normal force on a block sliding along a floor — does no work. Holding a heavy bag still also does no work in the physics sense, however tired your arm is. Muscles spend chemical energy to stay clenched; the bag’s mechanical energy is not increasing. The word “work” is narrower here than in conversation.",
        formula: "W = F d cosθ",
      },
      {
        heading: "Kinetic energy cares about speed squared",
        body: "Doubling speed quadruples kinetic energy. That is why a modest change in driving speed is an immodest change in stopping distance, and why a falling object picks up the ability to dent things so late in the drop. Mass matters too, but only to the first power. Gravitational potential energy, near Earth’s surface, is mgh. Only the vertical gap counts. A gentle ramp and a steep ramp between the same two heights offer the same potential-energy change.",
        formula: "K = ½ m v²     U = m g h",
      },
      {
        heading: "Conservation has a clause",
        body: "If only conservative forces do work — gravity, an ideal spring — mechanical energy K + U stays constant. Friction and air drag are not in that club. They turn mechanical energy into thermal energy, which is still energy, just no longer useful as organized motion of the whole object. “Energy is always conserved” and “mechanical energy is conserved on this ramp” are different claims. The second one is the one you can spend on a homework problem, and only when the clause holds.",
        formula: "K + U stays constant only when no energy leaves",
      },
    ],
    bench: "energy",
    prompt: "Lower a mass down a ramp. Watch potential become kinetic. Turn friction on and see part of that trade diverted into heat. Mass changes the energies, not the speed.",
    note: "g = 9.81 m/s². Height is measured from the bottom of the ramp. With friction on, 30% of the lost potential becomes thermal energy instead of kinetic — a teaching fraction, not a measured coefficient.",
    clip: {
      youtubeId: "yccxgkYFvoQ",
      title: "Conservation of energy with a pendulum",
      channel: "Science Explained",
      watch: "He lets the weight go from rest at his chin. It comes back to that height and does not hit him.",
      leave: "The clip has almost no friction, and it does not change the mass. Your bench is where friction takes energy, and where mass does not change the speed.",
    },
    checks: [
      {
        prompt: "A force points straight up. The object moves horizontally. The work done by that force is…",
        options: [
          "Equal to the weight times the distance",
          "Zero, because the force is perpendicular to the displacement",
          "Negative, always",
          "Equal to the kinetic energy",
        ],
        answer: 1,
        why: "cosθ is zero at 90°. No component lies along the motion, so that force transfers no mechanical energy. Other forces might.",
      },
      {
        prompt: "You double an object’s speed. Its kinetic energy…",
        options: ["Doubles", "Quadruples", "Is unchanged", "Halves"],
        answer: 1,
        why: "K depends on v². A factor of 2 in speed is a factor of 4 in kinetic energy. Mass was unchanged.",
      },
      {
        prompt: "Gravitational potential energy near the ground depends on…",
        options: [
          "The path taken between two heights",
          "The vertical height difference (and mass and g)",
          "Only the horizontal distance traveled",
          "The color of the ramp",
        ],
        answer: 1,
        why: "U = mgh. A spiral ramp and a ladder between the same heights change U by the same amount. The path matters for friction, not for gravity’s potential.",
      },
      {
        prompt: "Friction acts along a slide. Mechanical energy K + U…",
        options: [
          "Stays exactly constant, by Newton’s first law",
          "Decreases; the difference shows up as thermal energy",
          "Increases, because friction is a force",
          "Becomes equal to the weight",
        ],
        answer: 1,
        why: "Friction is nonconservative. It does negative work on the object and leaves energy as heat in the surfaces. Total energy, counting thermal, still balances. Organized mechanical energy does not.",
      },
    ],
  },
  {
    id: "momentum",
    track: "physics",
    index: 5,
    title: "Momentum",
    minutes: 11,
    lede: "You will show that an isolated collision keeps momentum, and that kinetic energy survives only when the collision is elastic.",
    ideas: [
      {
        heading: "Inertia, already moving",
        body: "Momentum p = mv packages the two things that make an object hard to stop: it is heavy, or it is fast, or both. Because velocity is a vector, momentum points. Two equal momenta aimed at each other can add to zero even though both objects are decidedly in motion. The total is what the law cares about, not the drama of each piece.",
        formula: "p = m v",
      },
      {
        heading: "Isolated means no outside push",
        body: "If the net external force on a system is zero, the total momentum of the system does not change. Internal forces — the two carts shoving each other — come in third-law pairs and cancel in the total. That is why a collision can be violent and still conserve momentum. Friction from the track, or a hand that grabs one cart, is an external force. Then the system you drew was not isolated, and the total inside it is allowed to change.",
        formula: "Σ p before = Σ p after, when the outside force is zero",
      },
      {
        heading: "Elastic is a second rule",
        body: "Momentum conservation alone does not tell you the two velocities after a collision. You have one equation and two unknowns. “They stick” is an extra fact (perfectly inelastic) and it closes the problem. “Kinetic energy is also conserved” is a different extra fact (elastic) and it closes the problem another way. Real collisions sit between them: momentum conserved if isolated, kinetic energy partly turned into heat and deformation. Bouncy is not the same adjective as “momentum-conserving.” Everything isolated is momentum-conserving. Almost nothing is perfectly elastic.",
        formula: "for a perfectly elastic hit, separation speed = approach speed",
      },
    ],
    bench: "collision",
    prompt: "Set two masses and two velocities. Compare a perfectly bouncy collision with one where they stick. Momentum should agree before and after; kinetic energy should not, once they stick.",
    note: "One-dimensional collision, no external force during the impact. “Elastic” uses the standard two-body result. “Stick” means a perfectly inelastic collision: one shared velocity afterward.",
    clip: {
      youtubeId: "Qco-M6BajjA",
      title: "Conservation of momentum on an air track",
      channel: "Caltech's Feynman Lecture Hall",
      watch: "Equal gliders. The moving one stops and the resting one leaves. Then a heavier one, which does not hand over all of its motion.",
      leave: "He says the bounce is not perfect. That is real. Momentum still holds. Kinetic energy holds only for the elastic case, which is the split on the bench.",
    },
    checks: [
      {
        prompt: "Momentum is…",
        options: [
          "A scalar, because mass is a scalar",
          "A vector, because velocity is a vector",
          "The same quantity as kinetic energy",
          "Always conserved for one object, even if a net force acts",
        ],
        answer: 1,
        why: "p = mv inherits direction from v. Kinetic energy is a scalar and depends on speed squared. A single object’s momentum changes whenever a net force acts; conservation is a statement about an isolated system.",
      },
      {
        prompt: "Two carts collide on a track you are treating as frictionless. During the collision…",
        options: [
          "Total momentum is conserved because the forces between them are internal",
          "Total momentum falls to zero because the crash is inelastic-looking",
          "Kinetic energy must be conserved, always",
          "Mass is not conserved",
        ],
        answer: 0,
        why: "Internal pairs cancel in the total momentum. Whether kinetic energy survives is a separate question about how bouncy the collision is. Isolation was the frictionless assumption.",
      },
      {
        prompt: "A perfectly inelastic collision of an isolated pair…",
        options: [
          "Conserves kinetic energy and discards momentum",
          "Conserves momentum; kinetic energy drops",
          "Conserves both, always",
          "Conserves neither",
        ],
        answer: 1,
        why: "They share one velocity afterward, fixed by momentum. Deformation and heat take the kinetic-energy difference. “Inelastic” names that loss. It does not cancel the isolation argument.",
      },
      {
        prompt: "Two equal masses collide head-on, elastically, with equal and opposite velocities. Afterward…",
        options: [
          "Both stop",
          "They stick and drift",
          "Each leaves with the other’s incoming velocity",
          "Kinetic energy is zero and momentum is not",
        ],
        answer: 2,
        why: "Equal masses in a one-dimensional elastic collision exchange velocities. Each reverses. Total momentum was already zero and stays zero. Kinetic energy is unchanged. Sticking would have left them both at rest — that is the inelastic version.",
      },
    ],
  },
  {
    id: "waves",
    track: "physics",
    index: 6,
    title: "Waves",
    minutes: 10,
    lede: "You will show that wave speed equals frequency times wavelength, and that amplitude is not wavelength.",
    ideas: [
      {
        heading: "Amplitude is not wavelength",
        body: "Amplitude is how far a piece of the medium swings away from its rest position. It is a statement about energy and about loudness or brightness, depending on the wave. Wavelength is the distance from one crest to the next crest — a length along the direction the pattern travels. Turning the amplitude up does not stretch the wavelength. Students mix them because both can be “the height of the drawing” if the drawing was careless.",
        formula: "amplitude is how far a point moves. Wavelength is the length of one repeat. v = f λ does not mix them",
      },
      {
        heading: "One relation",
        body: "Wave speed equals frequency times wavelength. Frequency is how many crests pass a point each second. Wavelength is the spacing of those crests. Their product is how fast the pattern runs. Shake a rope faster without changing the wave speed, and the crests pack closer. The same relation covers sound, light, and the ripple in a tray, with very different speeds behind it.",
        formula: "v = f λ",
      },
      {
        heading: "The medium is not the message",
        body: "The pattern and the energy travel. The material mostly wiggles in place. Sound needs a material; the air oscillates and the pattern travels. Light does not need a material. In both cases the thing that arrives across the room is energy and information, not a lump of the source. Superposition is the next surprise: two waves in the same place add their displacements. They can cancel at a point without either wave being destroyed. Earplugs and noise-cancelling headphones are applied superposition. So are thin-film colors.",
      },
    ],
    bench: "wave",
    prompt: "Change amplitude, frequency, and wavelength on a fixed window of rope. Check that the speed you read equals frequency times wavelength.",
    note: "The drawing shows a fixed 4 m of a transverse wave, y = A sin(2πx/λ − 2πft). The medium moves up and down; the pattern moves along the rope. This bench does not model what sets the speed — tension and mass per length would, for a real rope.",
    clip: {
      youtubeId: "-gr7KmTOrx0",
      title: "Standing waves, demonstration",
      channel: "James Dann",
      end: 140,
      watch: "The string. When he raises the frequency, more waves fit on the same length. That is a shorter wavelength.",
      leave: "He names harmonics. You do not need those names. Speed equals frequency times wavelength is the relation on the bench.",
    },
    checks: [
      {
        prompt: "Wave speed, frequency, and wavelength are related by…",
        options: ["v = f / λ", "v = f λ", "v = f + λ", "v = A λ"],
        answer: 1,
        why: "Each second, f crests pass, spaced λ apart, so the pattern covers fλ meters per second. Amplitude is not in the speed.",
      },
      {
        prompt: "Amplitude is…",
        options: [
          "The distance from one crest to the next",
          "The maximum displacement from equilibrium",
          "The number of crests per second",
          "Always equal to the wavelength",
        ],
        answer: 1,
        why: "Crest-to-crest is the wavelength. Crests per second is the frequency. Amplitude is how large the wiggle is, measured from the middle.",
      },
      {
        prompt: "Frequency doubles and wave speed stays the same. Wavelength…",
        options: ["Doubles", "Halves", "Stays the same", "Becomes equal to the amplitude"],
        answer: 1,
        why: "λ = v/f. Same v, twice f, half λ. On the bench, that is more crests inside the same window.",
      },
      {
        prompt: "Which statement is sound?",
        options: [
          "A sound wave carries a chunk of the source’s material to your ear",
          "Air particles oscillate locally; the pattern and the energy travel",
          "Sound does not need a medium",
          "Wavelength is the loudness",
        ],
        answer: 1,
        why: "The air does not stream from the speaker to you as a wind of signal. Each bit of air jiggles about its rest position. Light is the wave that needs no medium. Loudness tracks amplitude, not wavelength.",
      },
    ],
  },
  ...manufacturingLessons,
  ...ladderLessons,
];

const coreOrder: TrackId[] = ["physics", "materials", "engineering"];

export function isIntroTrack(track: string) {
  return (introTrackIds as readonly string[]).includes(track);
}

export function getTrack(id: string) {
  return tracks.find((t) => t.id === id);
}

export function lessonsFor(track: TrackId) {
  return lessons.filter((l) => l.track === track).sort((a, b) => a.index - b.index);
}

export function getLesson(track: string, id: string) {
  return lessons.find((l) => l.track === track && l.id === id);
}

export function lessonNeighbors(track: TrackId, id: string) {
  const ordered = isIntroTrack(track)
    ? coreOrder.flatMap((t) => lessonsFor(t))
    : lessonsFor(track);
  const i = ordered.findIndex((l) => l.track === track && l.id === id);
  return {
    prev: i > 0 ? ordered[i - 1] : undefined,
    next: i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : undefined,
  };
}
