import type { Lesson, Track } from "./types.ts";

export const manufacturingTrack: Track = {
  id: "manufacturing",
  index: "04",
  title: "Manufacturing",
  course: "Manufacturing theory",
  lede: "How process choice changes geometry, cost, material condition, tolerance capability, and quality."
};

export const manufacturingLessons: Lesson[] = [
  {
    id: "mechanism",
    track: "manufacturing",
    index: 1,
    title: "The act",
    minutes: 9,
    lede: "Pick the physical act that makes a shape, and name the constraint that ruled the others out.",
    start: "Manufacturing processes differ first in what they do to the material: solidify it, deform it, remove it, join it, or add to it. || Start by identifying which of those actions can produce the required geometry and material condition. A feature that a cutting tool cannot reach, for example, may need to be cast, printed, or assembled from separate pieces. || Choose the process family before choosing a specific machine or brand.",
    use: "A shape has to be made, and someone is naming a machine. || Name the act first: freeze, deform, cut, join, or add. Let the geometry rule acts out before cost gets a say. || The constraint picked the act, not the brand. Naming the machine first is how a simple bar turns into a five-axis story.",
    example: "You need 500 identical brackets with a pocket a drill can enter, and one lattice with a tunnel no tool can reach. || The brackets are a cut, or a deform, once the tool has a path in and out. The lattice is an add, because a rigid tool cannot get into the tunnel. The machine brand has not come up yet. || The geometry voted first. Name the act, then the machine.",
    ideas: [
      {
        heading: "Choose the process family before the machine",
        body: "A process makes shape by one physical act: freeze a liquid, deform a solid, cut a chip, join two pieces, or add material. A mill, a lathe, and a saw are the same act wearing different tooling. Arguing about the brand before you name the act is how a simple bar turns into a five-axis story.",
        formula: "the act is freeze, deform, cut, join, or add. The machine only carries out the act",
      },
      {
        heading: "Let the geometry eliminate impossible process families",
        body: "A void a tool cannot enter, a bend repeated a million times, or a tunnel in a one-off lattice each rules out acts before cost gets a say. Cutting needs a path in and a path out. A rigid die cannot release an undercut. A mold is the wrong first cost if you will only ever make one.",
      },
      {
        heading: "Each process also changes the material condition",
        body: "The strength you specified is the strength of a process history, not of a name on a datasheet. A casting freezes its grains in place. A bend leaves residual stress and springback. A weld rewrites the metal next door. Specify the part, then ask what the act does to it.",
      },
    ],
    bench: "mechanism",
    prompt: "Read the part. Pick Freeze, Deform, Cut, Join, or Add.",
    note: "Several acts can sometimes finish the same outline. The bench asks for the one the constraint is pointing at.",
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
    lede: "Predict how cutting force and power move when the uncut chip or the speed changes.",
    start: "Machining force and machining power are related, but they are not controlled by exactly the same variables. || The uncut chip thickness and width set the area being sheared and therefore strongly influence cutting force. Cutting speed then turns that force into power through P = Fv. || Increasing chip load tends to raise force. Increasing cutting speed at the same chip geometry mainly raises power and heat generation."
    use: "You are about to take a heavier chip or a faster cut. || Force follows the uncut area. Power is that force times the cutting speed. || You can say which one moved, and why. Do not expect the force to rise just because the spindle got faster.",
    example: "A steel cut 3 mm wide with an uncut chip 0.10 mm thick. Steel's u is 2500 N/mm², so F = 2500 × 3 × 0.10 = 750 N. || Double that thickness and the cutting force doubles to 1500 N, because the shear area doubled. Leave the thickness and raise the surface speed, and the force stays while the power rises. || You say which knob you turned. A faster spindle is not automatically a harder cut.",
    ideas: [
      {
        heading: "Chip formation is a shear process",
        body: "The tool does not split the metal the way an axe splits wood. Metal ahead of the edge is driven up a thin shear zone and leaves as a chip. Rake, friction, and that zone set the details. The first useful model skips them and still gets the scaling right.",
      },
      {
        heading: "Cutting force follows the uncut chip area",
        body: "Cutting force is specific energy times the uncut cross-section, width times uncut thickness. Double the thickness and this model doubles the force. A metal with higher specific energy costs more force at the same area. Sharpness is not in the formula, and that is a warning: the formula is about the chip, not about a fresh edge.",
        formula: "F = u × b × h",
      },
      {
        heading: "Cutting speed strongly affects power demand",
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
    lede: "Predict which way a bend opens after you let go, and which material opens more.",
    start: "Sheet metal springs back after forming because part of the deformation remains elastic. || The amount of springback depends on the material's yield behavior, stiffness, geometry, and forming conditions. High yield strength relative to elastic modulus generally means more recovery. || Tooling therefore has to compensate for springback. The tool angle is not necessarily the final part angle."
    use: "A bend has to hold an angle after you let go. || Compare yield with modulus. The higher that ratio, the more the bend opens. || Predict which material opens more before you switch it. Do not set the die to the angle on the drawing.",
    example: "A 1 mm aluminum sheet bent over a 15 mm radius, then the same bend in titanium. || Aluminum (270 MPa, 70 GPa): the quick estimate 3 × 270 / (70,000 × 1) = 0.0116 per mm is close to the exact 0.0115 per mm the bench uses. The radius grows to about 18.1 mm and a 90° bend opens about 15.6°. Titanium (880 MPa, 110 GPa) gives back 0.0235 per mm: about 23.2 mm, and it opens about 31.8°. || Do not set the die to the angle on the drawing. Overbend the one that opens more.",
    ideas: [
      {
        heading: "Elastic recovery causes springback",
        body: "Under the punch the sheet is bent to a radius. Some of that bend is plastic and stays. Some of it is elastic and comes back when you unload. The part opens. If you wanted 90°, you have to have bent past 90°, or the die has to hold it there.",
      },
      {
        heading: "Yield strength relative to modulus strongly affects springback",
        body: "For a sharp bend in pure bending, the curvature you lose on unloading is close to 3 times yield strength divided by modulus and thickness. That is the large-bend approximation. The bench solves the strip exactly: with κ = 1/R and first-yield curvature κ_y = 2 σ_y / (E t), the curvature left is κ − 1.5 κ_y + 0.5 κ_y³ / κ². High yield and low modulus give the elastic strain more to recover. Thin sheet and a large radius give that recovery a bigger share of the bend.",
        formula: "1/R − 1/Rf ≈ 3 σ_y / (E t)  (sharp bends)",
      },
      {
        heading: "Past a point it springs flat",
        body: "The strip stays elastic, and springs flat, when 1/R ≤ 2 σ_y / (E t). The bench uses that exact limit. 3 σ_y / (E t) assumes a fully plastic section, so it is trustworthy only when 1/R is well above the limit; near it, the quick estimate would call the bend flat too early. You did not fail to push hard enough in this model. You chose a radius so gentle, or a sheet so thin and strong, that the metal never had to stay bent.",
      },
    ],
    bench: "springback",
    prompt: "Bend 1 mm aluminum on a 15 mm radius, then switch to titanium.",
    note: "Pure bending, elastic-perfectly plastic. Bending under applied tension (stretch-bending), or bottoming/coining the bend, reduces springback. No die friction.",
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
        why: "The recovery scales with σ_y / (E t), about 3 σ_y / (E t) for a sharp bend. Titanium's σ_y / E is several times mild steel's. Same geometry, more elastic share.",
      },
      {
        prompt: "The strip springs flat when…",
        options: [
          "The punch is slower",
          "1/R is at or below 2 σ_y / (E t)",
          "The sheet is thicker",
          "Modulus is infinite",
        ],
        answer: 1,
        why: "Then no fiber ever yielded, so the whole bend was elastic. Nothing plastic remains to hold the arc. The bench uses this exact limit. The fully plastic 3 σ_y / (E t) estimate is only trustworthy well above it. A thicker sheet moves the other way: it springs less.",
      },
      {
        prompt: "Why might a stretch-bent part spring less than this bench?",
        options: [
          "Pulling on the sheet while it bends adds tension to the bending",
          "Shop modulus is zero",
          "Yield strength rises when you let go",
          "The formula already includes friction",
        ],
        answer: 0,
        why: "Tension shifts the neutral axis and leaves less elastic moment to recover. Bottoming or coining the bend does a similar job by pressing it hard into the die. This bench is pure bending on purpose, so you can see the yield-over-modulus effect alone.",
      },
    ],
  },
  {
    id: "freeze",
    track: "manufacturing",
    index: 4,
    title: "Freeze last",
    minutes: 10,
    lede: "Size a riser so it freezes after the plate, using volume over surface.",
    start: "Castings usually solidify from the mold walls inward. Thick regions with a high volume-to-surface ratio stay liquid longer and are more vulnerable to shrinkage cavities. || Chvorinov-style reasoning relates solidification time to a power of V/A. A riser is designed to remain liquid longer than the casting section it feeds. || The goal is directional solidification: feed the shrinking casting from liquid metal and leave the final shrinkage cavity in the riser, not the part."
    use: "The shrinkage has to happen in the riser, not in the part. || Compare solidification time through volume over area. The riser must be the slower one to freeze. || The riser stays liquid longest. Do not feed a thick section from a thin one.",
    example: "A 120 × 80 × 20 mm plate fed by a riser whose height equals its diameter. || The plate's V/A is 192,000 / 27,200 = 7.06 mm. The riser's V/A is D/6, so D has to beat 42 mm. A 60 mm riser gives 10 mm and freezes about (10 / 7.06)² ≈ 2.0 times later than the plate. A 30 mm riser gives 5 mm, freezes first, and leaves the shrinkage hollow in the plate. || The riser has to be the last liquid. Do not feed a thick section from a thin one.",
    ideas: [
      {
        heading: "Solidification time grows strongly with section modulus V/A",
        body: "Chvorinov's rule says a shape's solidification time is a mold constant times the square of volume over surface area. V/A is called the casting modulus. A chunky shape, high V/A, freezes late. A thin plate, low V/A, freezes early. The constant depends on the metal and the mold. It cancels when both shapes sit in the same mold.",
        formula: "t_s = C (V/A)²",
      },
      {
        heading: "The riser should solidify after the casting section it feeds",
        body: "Metal shrinks as it freezes. The last liquid place is where the shrinkage void ends up. Put that place in the riser, which you will cut off, not in the plate, which is the part. The riser must have a larger V/A than the plate. A decorative knob on top is not a riser if it freezes first.",
      },
      {
        heading: "Fast freezing is a finer grain",
        body: "A thin section has more surface for its volume, so it freezes sooner and the grains have less time to grow. That is the same V/A number doing a second job: faster cooling, finer grain. A thick section poured in the same mold will not match a thin one.",
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
    lede: "Separate filler strength from joint strength, and watch the weak line move into the heat-affected zone.",
    start: "A weld affects more than the deposited filler metal. The surrounding base metal experiences a thermal cycle that can change its microstructure and properties. || That altered region is the heat-affected zone. Heat input, travel speed, material, and prior condition all influence its width and severity. || Evaluate the joint as a system: weld metal, fusion boundary, HAZ, and base material."
    use: "A weld is being judged by the filler metal. || The weak line is the band beside the bead. More heat per length makes that band wider and weaker. || The filler strength says little about the joint. Do not turn the heat up and call the joint stronger.",
    example: "A fillet weld judged by a filler that is stronger than the plate. || Once the joint actually fuses, the weak line is the band beside the bead, where the heat rewrote the metal. More heat per length widens that band. || The filler strength says little about the joint. Turning the heat up does not make the neighbor stronger.",
    ideas: [
      {
        heading: "The weld metal is only one part of the joint",
        body: "A weld is a small casting poured between two plates, plus every millimeter of plate the heat touched. Matching the filler so it is stronger than the plate does not make the joint that strong. The joint fails at its weakest strip, and that strip is often beside the bead, not in it.",
      },
      {
        heading: "The heat-affected zone can have different properties from the base material",
        body: "The heat-affected zone never melted, and it was still hot enough to grow grains or undo a heat treatment. More heat per length of weld widens that band. A wide band of coarse or softened metal is a long weak line with the part's name on it.",
        formula: "Wider band as √(heat per length) (thick-plate model)",
      },
      {
        heading: "Too little heat is not a joint",
        body: "Below fusion there is no continuous metal across the gap. The filler's datasheet is irrelevant because the filler never tied the plates together. The two failures look opposite and neither is fixed by buying a stronger filler: no fusion, or a fused joint whose neighborhood was cooked.",
      },
    ],
    bench: "haz",
    prompt: "Raise heat from no fusion, through a narrow band, to a wide one.",
    note: "Band width grows with the square root of heat per length (a thick-plate model), and strength falls as the band widens. Aluminum often loses strength by over-aging, not only by grain growth. The weak-line lesson is the same. No preheat, no second pass.",
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
    lede: "Tell Cp from Cpk, and see what a shift of the mean does to a capable spread.",
    start: "Process capability has two separate questions: how wide is the process variation, and where is the process centered relative to the specification limits? || Cp compares process spread with specification width. Cpk also accounts for how close the mean is to the nearest specification limit. || A process can have good repeatability and still make bad parts if it is off-center. Check both spread and centering."
    use: "A process makes a pile of parts, and the drawing has two limits. || Width against the window is one number. Distance to the nearer limit is the other. A shift of the mean can fail a pile that was narrow enough. || A capable width can still miss. Do not quote the width as proof the parts are in the window.",
    example: "Pins aimed at 10.00 mm, limits ±0.10 mm. With σ = 0.025 mm, Cp = 0.20 / 0.15 = 1.33 while it is centered. || Shift the mean by 0.06 mm and Cp stays 1.33, because the pile is the same width. Cpk = 0.04 / 0.075 = 0.53, because the pile walked toward one wall. || A capable width can still miss. Do not quote Cp as proof the pins are in the window.",
    ideas: [
      {
        heading: "Compare the process distribution with the specification window",
        body: "The drawing allows 10.00 mm ± 0.10 mm. That is a window. The process makes a pile of parts with a mean and a spread. A perfect nominal on the drawing does not put the pile in the middle, and a tight window does not shrink the pile. Both numbers have to be true at once.",
      },
      {
        heading: "Cp measures spread, not centering",
        body: "Cp compares the window to six standard deviations. It asks only whether the pile could fit if it were centered. A process drifted against one wall can still post a handsome Cp. The pile fits the window in width and misses it in location.",
        formula: "Cp = (USL − LSL) / (6σ)",
      },
      {
        heading: "Cpk includes distance to the nearest specification limit",
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
          "Cp is high and Cpk is low, because the pile is narrow enough but off center",
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
    lede: "Add three tolerances as a worst case and as a root sum square, and name which bet you are making.",
    start: "Tolerance stacks can be evaluated in more than one way, and the methods answer different questions. || Worst-case analysis adds the full unfavorable contribution from every dimension and guarantees the stack if the individual tolerances are met. RSS gives a statistical estimate when the variations are independent and random. || Choose the method based on the required assurance and the validity of the statistical assumptions. Do not blend the two methods into an arbitrary middle value."
    use: "Three tolerances have to fit inside one allowance. || Add them if you need every stack to fit. Combine them as a root sum square only if you accept that they will not all land the same way. || Say which bet you are making. Do not average the two answers into a pass.",
    example: "Three blocks, each ±0.20 mm, have to stack inside a ±0.50 mm allowance. || Worst case is ±0.60 mm, and it does not fit. Root sum square is 0.20 × √3, about ±0.35 mm, and it does fit. || Say which bet you are making. Do not average 0.60 and 0.35 into a pass.",
    ideas: [
      {
        heading: "Worst-case stacking adds the full unfavorable tolerance",
        body: "Three parts at ±0.20 mm can land 0.60 mm long if each one is long. That sum is the promise: every assembly fits, including the unlucky one. It is expensive, and it is the only one that does not depend on luck.",
        formula: "Worst case = n × tolerance",
      },
      {
        heading: "RSS relies on independent random variation",
        body: "If the errors are independent and centered, they rarely all point the same way. The statistical stack is the tolerance times the square root of the count, not the count itself. For three parts that is √3, about 1.73, instead of 3. The number is smaller because you gave up the promise.",
        formula: "RSS = tolerance × √n",
      },
      {
        heading: "Choose the stack method explicitly rather than averaging methods",
        body: "If worst case misses and root sum square fits, you are betting, not discovering. Say so. If both miss the allowance, tighten a part or open the allowance. The spread lesson was one dimension. A stack is that lesson with neighbors.",
      },
    ],
    bench: "stack",
    prompt: "Set each part to ±0.20 mm against a ±0.50 mm allowance.",
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
        why: "The stack does not fit under either story. Tighten a tolerance or open the allowance.",
      },
    ],
  },
];
