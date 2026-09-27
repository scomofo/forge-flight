import type { Lesson, Track } from "./types";

export const manufacturingTrack: Track = {
  id: "manufacturing",
  index: "04",
  title: "Manufacturing",
  course: "Manufacturing theory",
  lede: "After you can specify a part. The act that makes it, what the chip costs, why a bend opens, why a riser must freeze last, why the weld's neighbor is the weak line, and why a process is a spread.",
};

export const manufacturingLessons: Lesson[] = [
  {
    id: "mechanism",
    track: "manufacturing",
    index: 1,
    title: "The act",
    minutes: 9,
    lede: "You will pick the physical act that makes a shape, and name the constraint that ruled the others out.",
    ideas: [
      {
        heading: "Name the act, not the brand",
        body: "A process makes shape by one physical act: freeze a liquid, deform a solid, cut a chip, join two pieces, or add material. A mill, a lathe, and a saw are the same act. Arguing about the brand before you name the act is how a simple bar becomes a five-axis story.",
      },
      {
        heading: "The geometry votes first",
        body: "A void a tool cannot enter, a bend repeated a million times, or a tunnel in a one-off lattice each eliminates acts before cost is allowed to speak. Cutting needs a path in and a path out. A rigid die cannot release an undercut. A mold is the wrong first cost if you will only make one.",
      },
      {
        heading: "The act changes the material",
        body: "The strength you specified is the strength of a process history, not of a name on a datasheet. A casting freezes its grains in place. A bend leaves residual stress and springback. A weld rewrites the metal next door. Specify the part, then ask what the act does to it.",
      },
    ],
    bench: "mechanism",
    prompt: "Read the part. Pick Freeze, Deform, Cut, Join, or Add.",
    note: "Several acts can sometimes finish the same outline. The bench asks for the act the constraint is pointing at.",
    checks: [
      {
        prompt: "What should you name before you name a machine?",
        options: [
          "The brand of the controller",
          "The physical act that creates the shape",
          "The color of the finished part",
          "The operator's favorite setup",
        ],
        answer: 1,
        why: "Mill, lathe, and saw differ in tooling and all cut. Freeze, deform, cut, join, and add differ in what geometry they can leave behind.",
      },
      {
        prompt: "A cavity that no tool can enter from outside is a poor job for…",
        options: [
          "Cutting, which needs a path in",
          "Casting with a core",
          "Adding along a path that never had to exit",
          "Any process, because holes are impossible",
        ],
        answer: 0,
        why: "A cutter occupies space and has to arrive there. Liquid around a core, or a bead that builds the roof over a void, does not need that entrance.",
      },
      {
        prompt: "A million identical clips bent from sheet point to which act?",
        options: [
          "Cut each clip from a block",
          "Deform, and pay for the tool once",
          "Join two slabs for every clip",
          "Freeze each clip in its own mold with no reuse",
        ],
        answer: 1,
        why: "The shape is a bend, repeated. The die is the expensive object. Each clip after the first is a stroke, not a new tool.",
      },
      {
        prompt: "Why is a mold the wrong first cost for a one-off lattice?",
        options: [
          "Lattices cannot be drawn",
          "You will not make a second one to share the tool cost",
          "Additive processes cannot make tunnels",
          "One-off parts have no geometry",
        ],
        answer: 1,
        why: "A pattern or die earns its cost across many parts. One lattice does not. Cutting also fails if the tunnels never open onto a face a tool can enter.",
      },
    ],
  },
  {
    id: "chip",
    track: "manufacturing",
    index: 2,
    title: "The chip",
    minutes: 10,
    lede: "You will predict how cutting force and power move when the uncut chip or the speed changes.",
    ideas: [
      {
        heading: "The chip is born in shear",
        body: "The tool does not split the metal the way an axe splits wood. Metal ahead of the edge is driven up a thin shear zone and leaves as a chip. Rake, friction, and that zone set the details. The first useful model skips them and still gets the scaling right.",
      },
      {
        heading: "Force follows the uncut area",
        body: "Cutting force is specific energy times the uncut cross-section, width times uncut thickness. Double the thickness and this model doubles the force. A metal with higher specific energy costs more force at the same area. Sharpness is not in the formula, and that is a warning: the formula is about the chip, not about a fresh edge.",
        formula: "F = u × b × h",
      },
      {
        heading: "Speed rides along in the power",
        body: "Power is force times cutting speed. In this model, speed does not change the force, and it does change the power. Twice the speed at the same chip is the same push and twice the watts. That is why a light fast cut and a heavy slow cut can be different problems for the same motor.",
        formula: "P = F × v",
      },
    ],
    bench: "chip",
    prompt: "Set steel at 0.10 mm, then double the uncut thickness.",
    note: "Specific energies are teaching values. Real energy falls a little as the chip gets thicker, and the edge wears.",
    checks: [
      {
        prompt: "In this model, doubling uncut thickness does what to force?",
        options: ["Doubles it", "Cuts it in half", "Leaves it unchanged", "Doubles it only if speed doubles"],
        answer: 0,
        why: "F = u b h. Width and specific energy stayed put, so force tracks thickness. The edge did not get duller in the formula. The chip got bigger.",
      },
      {
        prompt: "You double the cutting speed and leave the chip alone. What changes?",
        options: [
          "Force doubles and power stays",
          "Force stays and power doubles",
          "Both stay, because speed is not a load",
          "Specific energy doubles",
        ],
        answer: 1,
        why: "P = F v. This model ties force to area and material, not to speed. The motor still has to pay force times the new speed.",
      },
      {
        prompt: "Specific energy u is…",
        options: [
          "How sharp the edge was ground",
          "The work required to remove a volume of that material",
          "The spindle rpm",
          "Always the same for every metal",
        ],
        answer: 1,
        why: "u is energy per volume, shown on the bench as N/mm² so it multiplies area and gives newtons. Titanium's number is higher than aluminum's. That is the material, not the machine.",
      },
      {
        prompt: "Which claim does this model refuse?",
        options: [
          "A thicker chip takes more force",
          "A higher-u metal takes more force at the same chip",
          "A sharper edge appears as a term in F = u b h",
          "More speed at the same force takes more power",
        ],
        answer: 2,
        why: "Sharpness, rake, and wear are real and missing. If the bench's force looks too tidy next to a worn tool, that is the omission, not a new law.",
      },
    ],
  },
  {
    id: "springback",
    track: "manufacturing",
    index: 3,
    title: "Springback",
    minutes: 10,
    lede: "You will predict which way a bend opens after you let go, and which material opens more.",
    ideas: [
      {
        heading: "The bend is partly elastic",
        body: "Under the punch the sheet is bent to a radius. Some of that bend is plastic and stays. Some of it is elastic and comes back when you unload. The part opens. If you wanted 90°, you have to have bent past 90°, or the die has to hold it there.",
      },
      {
        heading: "Yield over modulus sets the recovery",
        body: "For a fully plastic strip in pure bending, the curvature you lose on unloading is 3 times yield strength divided by modulus and thickness. High yield and low modulus give the elastic strain more to recover. Thin sheet and a large radius give that recovery a bigger share of the bend.",
        formula: "1/R − 1/Rf = 3 σ_y / (E t)",
      },
      {
        heading: "Past a point it springs flat",
        body: "If 3 σ_y / (E t) is larger than 1/R, the elastic piece is the whole bend. The strip comes out flat. You did not fail to push hard enough in this model. You chose a radius so gentle, or a sheet so thin and strong, that the metal never had to stay bent.",
      },
    ],
    bench: "springback",
    prompt: "Bend 1 mm aluminum on a 15 mm radius, then switch to titanium.",
    note: "Pure bending, elastic-perfectly plastic. A real press brake adds tension, which reduces springback. No die friction.",
    checks: [
      {
        prompt: "After you unload a bend, the part typically…",
        options: [
          "Opens, because elastic strain returns",
          "Closes tighter than the punch",
          "Keeps the punch radius exactly",
          "Grows thicker at the bend",
        ],
        answer: 0,
        why: "Plastic strain stays. Elastic strain does not. Curvature drops, radius grows, and a 90° bend becomes a larger angle between the legs.",
      },
      {
        prompt: "Titanium opens more than mild steel at the same radius and thickness because…",
        options: [
          "Titanium is heavier",
          "Its yield divided by its modulus is higher",
          "The formula ignores yield",
          "Steel cannot be bent",
        ],
        answer: 1,
        why: "The recovery term is 3 σ_y / (E t). Titanium's σ_y / E is several times mild steel's. Same geometry, more elastic share.",
      },
      {
        prompt: "The strip springs flat when…",
        options: [
          "The punch is slower",
          "3 σ_y / (E t) exceeds 1/R",
          "The sheet is thicker",
          "Modulus is infinite",
        ],
        answer: 1,
        why: "Then the curvature you would give back is more than the curvature you applied. Nothing plastic remains to hold the arc. A thicker sheet moves the other way: it springs less.",
      },
      {
        prompt: "Why might a real press-brake part spring less than this bench?",
        options: [
          "The punch puts the bend in tension as well as bending",
          "Shop modulus is zero",
          "Yield strength rises when you let go",
          "The formula already includes friction",
        ],
        answer: 0,
        why: "Tension shifts the neutral axis and leaves less elastic moment to recover. This bench is pure bending on purpose, so you can see the 3 σ_y / (E t) term alone.",
      },
    ],
  },
  {
    id: "freeze",
    track: "manufacturing",
    index: 4,
    title: "Freeze last",
    minutes: 10,
    lede: "You will size a riser so it freezes after the plate, using volume over surface.",
    ideas: [
      {
        heading: "Time follows the square of the modulus",
        body: "Chvorinov's rule says a shape's solidification time is a mold constant times the square of volume over surface area. A chunky shape, high V/A, freezes late. A thin plate, low V/A, freezes early. The constant depends on the metal and the mold. It cancels when both shapes sit in the same mold.",
        formula: "t_s = C (V/A)²",
      },
      {
        heading: "The riser has to be the last liquid",
        body: "Metal shrinks as it freezes. The last liquid place is where the shrinkage void ends up. Put that place in the riser, which you will cut off, not in the plate, which is the part. The riser must have a larger V/A than the plate. A decorative knob on top is not a riser if it freezes first.",
      },
      {
        heading: "Fast freezing is a finer grain",
        body: "A thin section has more surface for its volume, so it freezes sooner and the grains have less time to grow. That is the same V/A number doing a second job. You did not buy a finer grain with a slogan. You bought it with cooling rate, and a thick section will not match a thin one poured in the same mold.",
      },
    ],
    bench: "freeze",
    prompt: "Thicken the plate, then shrink the riser until the plate freezes last.",
    note: "The shared face between riser and plate is ignored. Height of the riser equals its diameter. C is the same for both and drops out of the comparison.",
    checks: [
      {
        prompt: "Chvorinov's rule says solidification time grows with…",
        options: ["(V/A)²", "Surface area alone", "The color of the sand", "Pouring height only"],
        answer: 0,
        why: "t_s = C (V/A)². More volume per area means a longer path for the heat and a later freeze. C carries the mold and the metal.",
      },
      {
        prompt: "The shrinkage void ends up…",
        options: [
          "Wherever you paint the part number",
          "In the region that freezes last",
          "Always in the thinnest wall",
          "Outside the metal, as extra mass",
        ],
        answer: 1,
        why: "Liquid feeds the shrinkage until the feed path freezes. The last pool has nothing left to feed it, so it caves in. That pool should be the riser.",
      },
      {
        prompt: "A riser fails its job when…",
        options: [
          "Its V/A is greater than the plate's",
          "Its V/A is smaller than the plate's, so the plate freezes later",
          "It is cut off after cooling",
          "The plate is the part you keep",
        ],
        answer: 1,
        why: "Smaller modulus, earlier freeze. If the riser freezes first it cannot feed the plate, and the void opens in the part. Cutting a sound riser off is the success, not the failure.",
      },
      {
        prompt: "Why does the mold constant C drop out of the bench's comparison?",
        options: [
          "C is always 1",
          "Both shapes are in the same mold and metal, so the same C multiplies both times",
          "Volume is dimensionless",
          "Sand does not conduct heat",
        ],
        answer: 1,
        why: "You are asking which finishes later, not how many minutes. Identical C cancels in the ratio of the two times. A different mold would need its own C, and the bench would say so.",
      },
    ],
  },
  {
    id: "haz",
    track: "manufacturing",
    index: 5,
    title: "Beside the weld",
    minutes: 9,
    lede: "You will separate filler strength from joint strength, and watch the weak line move into the heat-affected zone.",
    ideas: [
      {
        heading: "The filler is not the joint",
        body: "A weld is a small casting poured between two plates, plus every millimeter of plate the heat touched. Matching the filler so it is stronger than the plate does not make the joint that strong. The joint fails at its weakest strip, and that strip is often beside the bead, not in it.",
      },
      {
        heading: "Heat writes a new material next door",
        body: "The heat-affected zone never melted, and it was still hot enough to grow grains or undo a heat treatment. More heat per length of weld widens that band. A wide band of coarse or softened metal is a long weak line with the part's name on it.",
        formula: "Wider band as √(heat per length)",
      },
      {
        heading: "Too little heat is not a joint",
        body: "Below fusion there is no continuous metal across the gap. The filler's datasheet is irrelevant because the filler never tied the plates together. The two failures look opposite and neither is fixed by buying a stronger filler: no fusion, or a fused joint whose neighborhood was cooked.",
      },
    ],
    bench: "haz",
    prompt: "Raise heat from no fusion, through a narrow band, to a wide one.",
    note: "Band width grows with the square root of heat per length, and strength falls as the band widens. Aluminum often loses strength by over-aging, not only by grain growth. The weak-line lesson is the same. No preheat, no second pass.",
    checks: [
      {
        prompt: "An overmatched filler means…",
        options: [
          "The joint is automatically stronger than the plate",
          "The weld metal is stronger than the plate, which says nothing about the metal beside it",
          "No heat entered the plate",
          "Fusion is guaranteed",
        ],
        answer: 1,
        why: "Overmatch compares filler to base metal. The heat-affected zone is a third material. The joint's strength is the minimum of the three, not the filler's brochure.",
      },
      {
        prompt: "Once the joint has fused, this model puts the weak line…",
        options: [
          "In the filler, because filler is always soft",
          "In the heat-affected zone beside the bead",
          "Far from the weld, in cold plate",
          "In the gap, which has disappeared",
        ],
        answer: 1,
        why: "The filler is set stronger than the plate. The plate far away keeps its strength. The band that was heated is the one that gives up strength as it widens.",
      },
      {
        prompt: "Doubling heat per length, after fusion, does what?",
        options: [
          "Narrows the heat-affected zone",
          "Widens the band and lowers the strength of that band",
          "Raises yield in the band without a limit",
          "Removes the need for fusion",
        ],
        answer: 1,
        why: "Width tracks the square root of heat per length. The bench then drops the band's strength as that width grows. More heat is not free strength.",
      },
      {
        prompt: "Below the fusion threshold, joint strength is…",
        options: [
          "The filler strength",
          "Zero, because the plates are not one piece",
          "The base-metal strength",
          "Higher, because nothing was heated",
        ],
        answer: 1,
        why: "No continuous metal, no load path. Quoting the filler or the untouched plate is describing a weld you did not make.",
      },
    ],
  },
  {
    id: "spread",
    track: "manufacturing",
    index: 6,
    title: "The spread",
    minutes: 10,
    lede: "You will tell Cp from Cpk, and move the mean until a capable spread still fails.",
    ideas: [
      {
        heading: "A drawing is a window, a process is a pile",
        body: "The drawing allows 10.00 mm ± 0.10 mm. That is a window. The process makes a pile of parts with a mean and a spread. A perfect nominal on the drawing does not put the pile in the middle, and a tight window does not shrink the pile. Both numbers have to be true at once.",
      },
      {
        heading: "Cp sees the width, not the aim",
        body: "Cp compares the window to six standard deviations. It asks only whether the pile could fit if it were centered. A process drifted against one wall can still post a handsome Cp. The pile fits the window in width and misses it in location.",
        formula: "Cp = (USL − LSL) / (6σ)",
      },
      {
        heading: "Cpk uses the nearer wall",
        body: "Cpk takes the distance from the mean to the nearer limit and divides by three standard deviations. Shift the mean and Cp stays. Cpk falls. A common shop gate is 1.33, about four standard deviations from the nearer wall. That gate is a policy, not a law of nature. Name it as a policy when you use it.",
        formula: "Cpk = (nearer limit distance) / (3σ)",
      },
    ],
    bench: "spread",
    prompt: "Center the mean and shrink the spread until Cpk reaches 1.33. Then shift the mean by 0.06 mm.",
    note: "The pile is assumed normal and stable. The window is fixed at 10.00 ± 0.10 mm. 1.33 is a common gate, not a physical constant.",
    checks: [
      {
        prompt: "Cp does not change when…",
        options: [
          "The mean shifts and the spread stays",
          "The standard deviation changes",
          "The tolerance window changes",
          "You widen both limits",
        ],
        answer: 0,
        why: "Cp uses only the window and σ. Aim is invisible to it. That is the reason Cpk exists.",
      },
      {
        prompt: "You slide the mean toward one limit and leave σ alone. Cpk…",
        options: ["Stays with Cp", "Falls", "Becomes equal to the tolerance", "Doubles"],
        answer: 1,
        why: "The nearer wall got closer. Cpk is that distance divided by 3σ. Same spread, worse location, lower Cpk.",
      },
      {
        prompt: "A Cpk gate of 1.33 means…",
        options: [
          "A law: nature forbids anything less",
          "A shop policy: the nearer limit is about four standard deviations out",
          "The mean may sit on the limit",
          "Cp is no longer defined",
        ],
        answer: 1,
        why: "1.33 × 3 is about 4. People pick 1.33, or 1.67, as a rule for how much room they want. Say which rule you are using. Do not call it physics.",
      },
      {
        prompt: "Which pair can both be true?",
        options: [
          "The drawing says ±0.10 mm and every part is automatically inside it",
          "Cp is high and Cpk is low, because the pile is wide-enough but off center",
          "σ is zero whenever the drawing is tight",
          "Cpk uses the farther limit, so drift helps it",
        ],
        answer: 1,
        why: "Capability of the spread and placement of the mean are different facts. The bench's second move is exactly that pair: Cp holds, Cpk drops.",
      },
    ],
  },
  {
    id: "stack",
    track: "manufacturing",
    index: 7,
    title: "The stack",
    minutes: 9,
    lede: "You will add three tolerances as a worst case and as a root sum square, and name which bet you are making.",
    ideas: [
      {
        heading: "Worst case adds",
        body: "Three parts at ±0.20 mm can land 0.60 mm long if each one is long. That sum is the promise: every assembly fits, including the unlucky one. It is expensive, and it is the only one that does not depend on luck.",
        formula: "Worst case = n × tolerance",
      },
      {
        heading: "Root sum square is a bet",
        body: "If the errors are independent and centered, they rarely all point the same way. The statistical stack is the tolerance times the square root of the count, not the count itself. For three parts that is √3, about 1.73, instead of 3. The number is smaller because you gave up the promise.",
        formula: "RSS = tolerance × √n",
      },
      {
        heading: "Do not average the two answers into a pass",
        body: "If worst case misses and root sum square fits, you have not discovered a third truth in the middle. You have chosen a bet. Say so. If both miss the allowance, tighten a part or open the allowance. The spread lesson was one dimension. A stack is that lesson with neighbors.",
      },
    ],
    bench: "stack",
    prompt: "Set each part to ±0.20 mm against a 0.50 mm allowance.",
    note: "Equal tolerances, independent errors. RSS is not a guarantee for the next assembly.",
    checks: [
      {
        prompt: "Three parts at ±0.20 mm, worst case, add to…",
        options: ["±0.20 mm", "±0.60 mm", "±0.07 mm", "Zero, because plus and minus cancel"],
        answer: 1,
        why: "Worst case puts every part at the bad end. 0.20 three times is 0.60. Cancellation is the other model, and it is not free.",
      },
      {
        prompt: "Root sum square is smaller because…",
        options: [
          "It assumes the errors are not all long together",
          "It ignores two of the parts",
          "Tolerances are illegal to add",
          "√n is always 1",
        ],
        answer: 0,
        why: "Independent, centered errors scatter. √3 × 0.20 is about 0.35, not 0.60. You only get that discount if the assumption is true.",
      },
      {
        prompt: "Worst case misses the allowance and root sum square fits. What is true?",
        options: [
          "The assembly is guaranteed",
          "You are betting on scatter, not promising every stack",
          "The allowance moved",
          "The two numbers should be averaged into a pass",
        ],
        answer: 1,
        why: "A bet is allowed if you say it is a bet. Averaging 0.60 and 0.35 does not produce a law. The unlucky stack is still 0.60.",
      },
      {
        prompt: "Both numbers miss the allowance. The honest move is…",
        options: [
          "Tighten a tolerance or open the allowance",
          "Report the smaller number and ship",
          "Add a fourth part so √n grows slower",
          "Declare the errors dependent and keep the RSS",
        ],
        answer: 0,
        why: "The stack does not fit under either story. Changing the story's name does not remove metal. Change a dimension or the gap it has to enter.",
      },
    ],
  },
];
