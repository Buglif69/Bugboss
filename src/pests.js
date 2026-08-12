/*
 * pests.js — the dossier database.
 *
 * Each entry is two things at once:
 *   `spec`   the numbers anatomy.js turns into a rotating 3D specimen
 *   the copy the typewriter reads out — vitals, charges, method, evidence
 *
 * Adding a pest is a data edit. Nothing else in the system needs to change.
 * Facts here are pitched at Brisbane / SE QLD conditions.
 */
(function (root) {
  'use strict';
  var BB = (root.BB = root.BB || {});

  BB.PESTS = [
    /* ------------------------------------------------------------------ */
    {
      id: 'german-cockroach',
      name: 'German Cockroach',
      sci: 'Blattella germanica',
      aka: ['Kitchen roach', 'Steam fly'],
      order: 'Blattodea · Ectobiidae',
      threat: 5,
      threatLabel: 'SEVERE — BREEDING INFESTATION RISK',
      actualSize: '12–15 mm',
      tagline: 'The one that turns a clean kitchen into a colony.',
      vitals: [
        ['SIZE', '12–15 mm — thumbnail sized'],
        ['ID MARK', 'Two dark parallel stripes on the shield'],
        ['COLOUR', 'Tan to light brown'],
        ['LIFESPAN', '100–200 days as an adult'],
        ['BREEDING', '30–40 eggs per case, 4–6 cases per female'],
        ['SPEED', 'Egg to adult in 6–12 weeks']
      ],
      charges: [
        'Carries salmonella, E. coli and staph across your benchtops',
        'Triggers asthma and eczema in kids — droppings and shed skins',
        'Contaminates food, cutlery and prep surfaces overnight',
        'Turns one hitchhiked female into 300+ roaches in a season',
        'Fails you on a food-safety audit in a single inspection'
      ],
      mo: [
        'Nocturnal — you see one by day only when the harbourage is full',
        'Lives inside the warmth: dishwasher, kettle base, fridge motor, microwave',
        'Never leaves the kitchen or bathroom if it can help it',
        'Female carries the egg case until hours before it hatches, so sprays miss it',
        'Arrives in cardboard boxes, second-hand appliances and grocery crates'
      ],
      evidence: [
        'Black pepper-like specks in drawer corners and hinges',
        'Sweet, oily, musty smell in the cupboard under the sink',
        'Pale-brown 6 mm egg cases glued into cracks',
        'A live one in daylight — that means heavy numbers'
      ],
      hideouts: ['Dishwasher seals', 'Kettle and toaster bases', 'Fridge motor housing', 'Cupboard hinges', 'Bin cupboards'],
      verdict: 'Aerosols scatter them and make it worse. This one needs gel bait plus an insect growth regulator, hitting the harbourage — not the floor.',
      spec: {
        plan: 'insect', len: 2.0, gloss: 0.5, stand: 0.06,
        abdomenW: 0.30, abdomenH: 0.082, abdomenL: 0.38, abdomenZ: -0.26,
        thoraxW: 0.25, thoraxH: 0.082, thoraxL: 0.20, thoraxZ: 0.16,
        pronotumW: 0.31, pronotumL: 0.22, pronotumH: 0.062,
        headW: 0.15, headH: 0.085, headL: 0.135, headZ: 0.355, headY: 0.085, headPitch: -0.55,
        eye: 0.042, cerci: 0.09,
        colors: {
          body: [148, 104, 58], abdomen: [154, 112, 64], thorax: [138, 96, 54],
          pronotum: [212, 176, 112], head: [150, 106, 58], leg: [186, 144, 88],
          antenna: [126, 88, 50], wing: [164, 120, 68], eye: [40, 28, 20]
        },
        markings: { pronotumStripes: { color: [52, 33, 20], inner: 0.10, outer: 0.58 } },
        wings: { len: 0.40, w: 0.23, thick: 0.020, spread: 0.26, lift: 0.22, z: -0.09, roll: 0.26, yaw: 0.03, pitch: -0.06, taperBack: 0.34, taperFront: 0.50, color: [168, 124, 72], gloss: 0.6 },
        antenna: { len: 1.0, thick: 0.014, segs: 11, splay: 0.30, arch: 0.24, spread: 0.40, rise: 0.10, reach: 1.15 },
        legs: { thick: 0.026, kneeOut: 0.17, kneeUp: 0.05, footOut: 0.30, attachZ: [0.20, 0.04, -0.13], dirs: [0.6, 1.5, 2.4], scale: [0.86, 0.98, 1.16] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'american-cockroach',
      name: 'American Cockroach',
      sci: 'Periplaneta americana',
      aka: ['Sewer roach', 'Palmetto bug', 'The big one'],
      order: 'Blattodea · Blattidae',
      threat: 4,
      threatLabel: 'HIGH — SEWER TRAFFIC INTO LIVING SPACE',
      actualSize: '35–40 mm',
      tagline: 'The dinner-plate flier that comes up the drain line.',
      vitals: [
        ['SIZE', '35–40 mm — largest pest roach in Brisbane'],
        ['ID MARK', 'Pale yellow figure-8 ring on the shield'],
        ['COLOUR', 'Glossy reddish brown'],
        ['LIFESPAN', 'Over a year as an adult'],
        ['BREEDING', '14–16 eggs per case, one case a week'],
        ['FLIGHT', 'Yes — glides when it is warm, usually at you']
      ],
      charges: [
        'Commutes from sewers and grease traps straight onto your bench',
        'Tracks pathogens on its legs from the drain to the dinner plate',
        'Spoils food and packaging with droppings and regurgitate',
        'Costs Brisbane cafés their reputation in one customer photo',
        'Breeds in the sub-floor and roof void where you never look'
      ],
      mo: [
        'Lives in the wet, warm dark: sewer pits, grease traps, sub-floors',
        'Travels the pipework and comes up through dry floor wastes',
        'Feeds on decaying matter, pet food, grease film and glue',
        'Most active on humid Brisbane summer nights',
        'Shelters in garden mulch and palm trees, then moves inside'
      ],
      evidence: [
        'Droppings the size of mouse pellets with blunt ridged ends',
        'Strong musty odour near drains and laundries',
        'Dark 8 mm egg cases stuck near pipe penetrations',
        'Sightings at night in the laundry, garage or bathroom'
      ],
      hideouts: ['Sewer and stormwater pits', 'Grease traps', 'Sub-floor voids', 'Roof voids', 'Garden mulch and palms'],
      verdict: 'Treat the source, not the sighting — pits, drains, sub-floor and perimeter, with a residual barrier at every entry point.',
      spec: {
        plan: 'insect', len: 2.35, gloss: 0.62, stand: 0.065,
        abdomenW: 0.32, abdomenH: 0.088, abdomenL: 0.38, abdomenZ: -0.25,
        thoraxW: 0.27, thoraxH: 0.088, thoraxL: 0.20, thoraxZ: 0.17,
        pronotumW: 0.35, pronotumL: 0.24, pronotumH: 0.062,
        headW: 0.16, headH: 0.085, headL: 0.135, headZ: 0.375, headY: 0.088, headPitch: -0.55,
        eye: 0.05, cerci: 0.12,
        colors: {
          body: [104, 46, 26], abdomen: [112, 52, 28], thorax: [96, 42, 24],
          pronotum: [86, 36, 20], head: [104, 46, 24], leg: [140, 70, 38],
          antenna: [92, 40, 22], wing: [116, 54, 30], eye: [34, 22, 18]
        },
        markings: { pronotumHalo: { color: [206, 168, 74 ] } },
        wings: { len: 0.44, w: 0.24, thick: 0.022, spread: 0.26, lift: 0.22, z: -0.08, roll: 0.26, yaw: 0.03, pitch: -0.06, taperBack: 0.34, taperFront: 0.50, color: [122, 58, 32], gloss: 0.72 },
        antenna: { len: 1.25, thick: 0.014, segs: 12, splay: 0.32, arch: 0.26, spread: 0.44, rise: 0.10, reach: 1.2 },
        legs: { thick: 0.026, kneeOut: 0.18, kneeUp: 0.06, footOut: 0.33, attachZ: [0.21, 0.05, -0.12], dirs: [0.6, 1.5, 2.4], scale: [0.9, 1.0, 1.2] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'subterranean-termite',
      name: 'Subterranean Termite',
      sci: 'Coptotermes acinaciformis',
      aka: ['White ant (wrongly)', 'The silent destroyer'],
      order: 'Blattodea · Rhinotermitidae',
      threat: 5,
      threatLabel: 'CRITICAL — STRUCTURAL DAMAGE IN PROGRESS',
      actualSize: '4–6 mm (soldier caste)',
      tagline: 'Australia\'s most destructive timber pest. Your insurer will not cover it.',
      vitals: [
        ['SIZE', '4–6 mm soldier, pear-shaped head'],
        ['ID MARK', 'Milky body, orange head, snapping mandibles'],
        ['COLONY', 'Up to a million workers from one nest'],
        ['RANGE', 'Forages up to 100 m from the nest'],
        ['DIET', '24 hours a day, 7 days a week, no dormancy'],
        ['EYESIGHT', 'Blind — navigates by scent and moisture']
      ],
      charges: [
        'Eats the structural timber out of a Brisbane home from the inside',
        'Causes more damage nationally than fire, storm and flood combined',
        'Not covered by standard home insurance — you wear the repair bill',
        'Hollows out a wall frame while the paint stays perfectly smooth',
        'Rides a single untreated garden sleeper into the house slab'
      ],
      mo: [
        'Travels underground and through mud tubes to stay out of the light',
        'Enters through slab penetrations, cracks and bridged weep holes',
        'Keeps the nest humid — moisture around your home is the invitation',
        'Works silently for years before the first visible sign',
        'Attacks skirtings, door jambs, roof timbers and decking first'
      ],
      evidence: [
        'Mud leads up piers, walls or slab edges',
        'Skirting or architrave that sounds hollow or dents under a thumb',
        'Bubbling or rippled paint that looks like water damage',
        'Discarded wings on window sills after a summer storm',
        'A clicking or rustling sound inside a quiet wall'
      ],
      hideouts: ['Under the slab', 'Wall cavities', 'Sub-floor timbers', 'Old stumps and sleepers', 'Damp bathroom walls'],
      verdict: 'Never spray them — you split the colony and lose it. Termatrac inspection first, then a baiting system or an Australian-Standard barrier to take the whole nest.',
      spec: {
        plan: 'insect', len: 1.9, gloss: 0.34, stand: 0.11, idle: 1.2,
        abdomenW: 0.20, abdomenH: 0.155, abdomenL: 0.38, abdomenZ: -0.28, abdomenTaper: 0.32, flatBottom: 0.15,
        thoraxW: 0.175, thoraxH: 0.135, thoraxL: 0.19, thoraxZ: 0.08,
        pronotum: false,
        headW: 0.20, headH: 0.155, headL: 0.24, headZ: 0.365, headY: 0.135, headPitch: -0.08,
        eye: 0,
        colors: {
          body: [232, 214, 186], abdomen: [236, 220, 194], thorax: [226, 206, 176],
          head: [186, 106, 44], leg: [226, 202, 168], antenna: [214, 188, 152]
        },
        markings: {},
        mandibles: { len: 0.30, thick: 0.030, color: [122, 62, 26] },
        antenna: { len: 0.45, thick: 0.020, segs: 6, splay: 0.5, arch: 0.22, spread: 0.68, reach: 0.72 },
        legs: { thick: 0.028, kneeOut: 0.16, kneeUp: 0.06, footOut: 0.30, attachZ: [0.16, 0.02, -0.14], dirs: [0.65, 1.5, 2.35], scale: [0.78, 0.82, 0.9] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'black-house-ant',
      name: 'Black House Ant',
      sci: 'Ochetellus glaber',
      aka: ['Sugar ant (wrongly)', 'The kitchen trail'],
      order: 'Hymenoptera · Formicidae',
      threat: 3,
      threatLabel: 'MODERATE — HYGIENE AND FOOD CONTAMINATION',
      actualSize: '2.5–3 mm',
      tagline: 'Kill the trail and you have killed nothing. The nest is in the wall.',
      vitals: [
        ['SIZE', '2.5–3 mm, shiny jet black'],
        ['ID MARK', 'Glossy body, elbowed antennae, single waist node'],
        ['COLONY', 'Thousands of workers, often several queens'],
        ['DIET', 'Sweet first, then grease and protein'],
        ['NESTING', 'Wall cavities, pavers, pot plants, roof void'],
        ['SPREAD', 'Budding — a split colony becomes two nests']
      ],
      charges: [
        'Walks bin juice and drain scum onto food prep surfaces',
        'Contaminates pantry goods, pet bowls and baby bottles',
        'Farms aphids and scale on your garden plants',
        'Nests in wall cavities and roof voids where the spray never reaches',
        'Turns one squashed trail into two colonies when disturbed'
      ],
      mo: [
        'Lays a chemical trail so every worker copies the first scout',
        'Follows pipework, wiring and weep holes indoors',
        'Peaks after Brisbane rain when the nest floods',
        'Forages hardest at dawn and dusk in warm weather',
        'Sends winged reproductives out on humid evenings'
      ],
      evidence: [
        'A defined line of ants along a bench edge or skirting',
        'Fine soil pellets pushed up between pavers or tiles',
        'Ants appearing after rain in the kitchen or bathroom',
        'Winged ants at a window in summer'
      ],
      hideouts: ['Wall cavities', 'Under pavers and edging', 'Pot plants', 'Roof void', 'Behind the splashback'],
      verdict: 'Surface sprays kill the workers and hide the problem. Non-repellent treatment plus transferable bait so the foragers carry the dose back to the queens.',
      spec: {
        plan: 'insect', len: 1.75, gloss: 0.72, stand: 0.16, idle: 1.3,
        abdomenW: 0.175, abdomenH: 0.165, abdomenL: 0.22, abdomenZ: -0.30, abdomenTaper: 0.38, flatBottom: 0.05,
        thoraxW: 0.13, thoraxH: 0.13, thoraxL: 0.22, thoraxZ: 0.10, thoraxLift: 1.15,
        pronotum: false,
        waist: { r: 0.045, len: 0.10 },
        headW: 0.16, headH: 0.15, headL: 0.16, headZ: 0.40, headY: 0.22, headPitch: -0.2,
        eye: 0.035,
        colors: {
          body: [62, 56, 60], abdomen: [58, 52, 56], thorax: [70, 62, 64],
          head: [64, 57, 60], leg: [96, 84, 78], antenna: [92, 80, 74], eye: [14, 12, 14]
        },
        markings: {},
        antenna: { elbowed: true, len: 0.80, thick: 0.020 },
        legs: { thick: 0.021, kneeOut: 0.19, kneeUp: 0.16, footOut: 0.32, attachZ: [0.16, 0.06, -0.06], dirs: [0.6, 1.45, 2.3], scale: [0.9, 0.95, 1.05] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'redback-spider',
      name: 'Redback Spider',
      sci: 'Latrodectus hasselti',
      aka: ['Australian black widow'],
      order: 'Araneae · Theridiidae',
      threat: 4,
      threatLabel: 'HIGH — MEDICALLY SIGNIFICANT VENOM',
      actualSize: '10 mm body (female)',
      tagline: 'Lives exactly where kids put their hands.',
      vitals: [
        ['SIZE', 'Female 10 mm body; male 3–4 mm and harmless'],
        ['ID MARK', 'Red or orange stripe on top, hourglass beneath'],
        ['WEB', 'Messy funnel with sticky ground lines'],
        ['EGGS', '250 eggs per sac, up to 10 sacs'],
        ['BITES', 'Around 2,000 people a year in Australia'],
        ['ANTIVENOM', 'Available since 1956 — always call 000 for a child']
      ],
      charges: [
        'Sets up in letterboxes, meter boxes and under outdoor seats',
        'Bites cause severe pain, sweating and nausea for hours to days',
        'Puts children and pets at real risk in the back yard',
        'Colonises kids\' play equipment, trampolines and sandpit edges',
        'Rebuilds within weeks if only the web is knocked down'
      ],
      mo: [
        'Hides in dry, sheltered, undisturbed spots — never out in the open',
        'Hangs upside down in the web, red stripe facing down',
        'Traps prey with sticky vertical ground lines, then hauls it up',
        'Most active through warm Brisbane months, and after rain',
        'Female stays put for life; males and spiderlings balloon in on the wind'
      ],
      evidence: [
        'Untidy tangled web in a corner with debris in it',
        'Round pale-cream egg sacs the size of a pea',
        'Webbing under outdoor furniture, BBQ, kids\' equipment',
        'Webs in the letterbox, meter box or pool pump housing'
      ],
      hideouts: ['Letterbox', 'Meter box', 'Under outdoor furniture', 'Pool pump housing', 'Retaining walls', 'Kids\' play gear'],
      verdict: 'Full external web-brush and a residual treatment to eaves, fences, boxes and play areas — timed so newly hatched spiderlings walk into it too.',
      spec: {
        plan: 'arachnid', len: 2.0, gloss: 0.72, stand: 0.34, idle: 0.8,
        abdomenW: 0.30, abdomenH: 0.31, abdomenL: 0.31, abdomenZ: 0.30,
        thoraxW: 0.17, thoraxH: 0.11, thoraxL: 0.20, thoraxZ: 0.16,
        colors: {
          body: [52, 47, 52], abdomen: [48, 43, 48], thorax: [60, 54, 58],
          leg: [56, 50, 54], eye: [10, 8, 10]
        },
        markings: {
          dorsalStripe: { color: [204, 32, 34], width: 0.30 },
          hourglass: { color: [206, 38, 36] }
        },
        legs: { thick: 0.024, kneeOut: 0.30, kneeUp: 0.46, footOut: 0.66, attachZ: [0.20, 0.09, -0.02, -0.13], dirs: [0.5, 1.1, 1.9, 2.55], scale: [1.15, 1.0, 0.95, 1.25] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'bed-bug',
      name: 'Bed Bug',
      sci: 'Cimex lectularius',
      aka: ['Mattress bug', 'The hitchhiker'],
      order: 'Hemiptera · Cimicidae',
      threat: 4,
      threatLabel: 'HIGH — BLOOD FEEDER, RAPID SPREAD',
      actualSize: '4–5 mm',
      tagline: 'Apple-seed sized, feeds while you sleep, travels in your suitcase.',
      vitals: [
        ['SIZE', '4–5 mm — flat oval, apple-seed shaped'],
        ['COLOUR', 'Rust brown; deep red and swollen after feeding'],
        ['FEEDING', '5–10 minutes on you, every 3–7 nights'],
        ['SURVIVAL', 'Months without a blood meal'],
        ['BREEDING', '200–500 eggs per female'],
        ['HIDING', 'Fits in a crack the thickness of a credit card']
      ],
      charges: [
        'Feeds on you and your children while you sleep',
        'Leaves itchy welts in lines and clusters on exposed skin',
        'Causes real anxiety, insomnia and loss of income for hosts',
        'Spreads room to room through power points and skirting gaps',
        'Rides home in luggage, second-hand furniture and school bags'
      ],
      mo: [
        'Hides within two metres of the bed and comes out pre-dawn',
        'Shelters in mattress seams, bed slats, bedheads and power points',
        'Detects your body heat and exhaled CO2 to find you',
        'Spreads fast in units, share houses, hotels and aged care',
        'Survives ordinary cleaning — vacuuming alone will not do it'
      ],
      evidence: [
        'Small dark blood spots on sheets and mattress piping',
        'Rusty-black faecal specks in seams and screw holes',
        'Translucent shed skins near the bedhead',
        'Bites in a line of three — breakfast, lunch and dinner',
        'A sweet, sickly smell in a heavy infestation'
      ],
      hideouts: ['Mattress seams', 'Bed slats and frame joints', 'Bedhead backing', 'Power points', 'Skirting behind the bed'],
      verdict: 'One room is never one room. Full-room treatment of every harbourage, all bedding heat-treated, then a mandatory follow-up to catch the hatch.',
      spec: {
        plan: 'insect', len: 1.55, gloss: 0.42, stand: 0.045, idle: 1.1,
        abdomenW: 0.36, abdomenH: 0.075, abdomenL: 0.36, abdomenZ: -0.14, abdomenTaper: 0.22, abdomenTaperFront: 0.10, flatBottom: 0.45,
        thoraxW: 0.28, thoraxH: 0.062, thoraxL: 0.15, thoraxZ: 0.24,
        pronotumW: 0.33, pronotumL: 0.145, pronotumH: 0.038,
        headW: 0.115, headH: 0.05, headL: 0.10, headZ: 0.40, headY: 0.055, headPitch: -0.25,
        eye: 0.028,
        colors: {
          body: [138, 74, 46], abdomen: [146, 80, 50], thorax: [128, 68, 42],
          pronotum: [124, 66, 40], head: [120, 62, 38], leg: [150, 88, 56],
          antenna: [136, 76, 46], eye: [40, 22, 16]
        },
        markings: { abdomenBands: { color: [92, 44, 26], count: 5 } },
        antenna: { len: 0.42, thick: 0.016, segs: 5, splay: 0.5, arch: 0.14, spread: 0.66, reach: 0.7 },
        legs: { thick: 0.021, kneeOut: 0.15, kneeUp: 0.04, footOut: 0.26, attachZ: [0.22, 0.10, -0.04], dirs: [0.7, 1.5, 2.3], scale: [0.72, 0.76, 0.86] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'roof-rat',
      name: 'Roof Rat',
      sci: 'Rattus rattus',
      aka: ['Black rat', 'Ship rat'],
      order: 'Rodentia · Muridae',
      threat: 5,
      threatLabel: 'SEVERE — FIRE RISK AND DISEASE',
      actualSize: '16–20 cm body, tail longer again',
      tagline: 'The scratching above the bedroom ceiling at 2am.',
      vitals: [
        ['SIZE', '16–20 cm body, tail longer than the body'],
        ['ID MARK', 'Large thin ears, pointed nose, slender build'],
        ['CLIMBING', 'Expert — power lines, downpipes, palm trees'],
        ['GAP', 'Squeezes through a hole the size of a 20c coin'],
        ['BREEDING', '5–10 pups per litter, up to 6 litters a year'],
        ['TEETH', 'Grow continuously — it must gnaw to survive']
      ],
      charges: [
        'Gnaws electrical wiring in the roof void — a genuine house-fire cause',
        'Spreads leptospirosis, salmonella and rat-bite fever through urine',
        'Fouls insulation, water tanks and stored goods',
        'Chews irrigation, solar cabling, pool hoses and dishwasher lines',
        'Doubles its numbers in weeks once it has food and shelter'
      ],
      mo: [
        'Lives high — roof voids, wall cavities, palms and dense vines',
        'Travels the same route nightly along beams and pipes',
        'Enters through gaps at eaves, weep holes and roof-sheet ends',
        'Cautious of anything new for several nights before touching it',
        'Feeds on fruit trees, chook feed, pet food and compost'
      ],
      evidence: [
        'Scratching and scurrying overhead after dark',
        'Dark 12–18 mm droppings with pointed ends in the roof or cupboards',
        'Gnaw marks on timber, plastic pipe or cabling',
        'Greasy dark rub marks along beams and pipe runs',
        'Half-eaten fruit on the ground under the tree'
      ],
      hideouts: ['Roof void', 'Wall cavities', 'Palm crowns', 'Dense vines and bougainvillea', 'Under the deck'],
      verdict: 'Baiting alone just feeds them. Lockable stations plus proofing every entry point, and a check of the roof void for damaged wiring.',
      spec: {
        plan: 'rodent', len: 2.4, gloss: 0.22, stand: 0.12, idle: 1.0,
        bodyW: 0.17, bodyH: 0.175, bodyL: 0.40,
        headW: 0.115, headH: 0.115, headL: 0.17,
        ear: 0.082, tail: 1.05,
        colors: {
          body: [74, 64, 58], nose: [198, 138, 140], ear: [124, 100, 100],
          tail: [128, 110, 106], eye: [14, 10, 10], whisker: [228, 224, 218]
        },
        markings: { belly: { color: [176, 166, 150 ] } }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'paper-wasp',
      name: 'Paper Wasp',
      sci: 'Polistes humilis',
      aka: ['Eave wasp'],
      order: 'Hymenoptera · Vespidae',
      threat: 3,
      threatLabel: 'MODERATE — STING RISK, DEFENDS THE NEST',
      actualSize: '10–15 mm',
      tagline: 'Builds the grey papery umbrella right where you reach.',
      vitals: [
        ['SIZE', '10–15 mm, slender with a pinched waist'],
        ['ID MARK', 'Tan-brown with yellow bands, long trailing legs'],
        ['NEST', 'Open grey paper comb on a single stalk'],
        ['COLONY', '12–30 wasps on a mature nest'],
        ['SEASON', 'Spring build-up, peak aggression late summer'],
        ['STING', 'Can sting repeatedly — no barb']
      ],
      charges: [
        'Stings repeatedly when the nest is disturbed',
        'Nests at head height on eaves, pergolas and clotheslines',
        'Risks anaphylaxis in sensitive family members',
        'Turns a ladder, gutter clean or hedge trim into a hospital trip',
        'Rebuilds on the same spot season after season'
      ],
      mo: [
        'Founds a nest in spring, then grows it all summer',
        'Guards a defensive zone of a few metres around the comb',
        'Hunts caterpillars and chews timber fibre into paper',
        'Favours sheltered north and east faces out of the rain',
        'Most reactive on hot, still afternoons'
      ],
      evidence: [
        'Grey papery comb with open cells under an eave or rail',
        'Wasps hovering the same flight line to one spot',
        'Nests in the BBQ, letterbox, pool box or kids\' cubby',
        'Repeated wasps at the same window or vent'
      ],
      hideouts: ['Eaves and gutters', 'Pergolas', 'Clothesline frames', 'BBQ and pool boxes', 'Fence rails'],
      verdict: 'Never knock it down in daylight. Treated and removed at the right time of day, then the eave line dusted so it is not rebuilt.',
      spec: {
        plan: 'insect', len: 2.0, gloss: 0.55, stand: 0.20, idle: 1.2,
        abdomenW: 0.125, abdomenH: 0.135, abdomenL: 0.36, abdomenZ: -0.42, abdomenTaper: 0.55, abdomenTaperFront: 0.50, flatBottom: 0.05,
        thoraxW: 0.16, thoraxH: 0.16, thoraxL: 0.20, thoraxZ: 0.10, thoraxLift: 1.1,
        pronotum: false,
        waist: { r: 0.030, len: 0.16 },
        headW: 0.14, headH: 0.13, headL: 0.11, headZ: 0.36, headY: 0.24, headPitch: -0.1,
        eye: 0.05,
        colors: {
          body: [156, 96, 34], abdomen: [162, 100, 36], thorax: [126, 74, 28],
          head: [186, 140, 44], leg: [178, 122, 42], antenna: [86, 54, 22], eye: [46, 34, 20]
        },
        markings: { abdomenBands: { color: [236, 198, 64], count: 5, sharp: true } },
        wings: { len: 0.46, w: 0.105, thick: 0.008, spread: 0.75, lift: 0.55, z: -0.06, roll: 0.10, yaw: 0.10, pitch: -0.06, taperBack: 0.35, taperFront: 0.45, color: [226, 222, 216], gloss: 0.8, alpha: 0.42 },
        antenna: { len: 0.55, thick: 0.017, segs: 6, splay: 0.42, arch: 0.30, spread: 0.5, reach: 0.7 },
        legs: { thick: 0.018, kneeOut: 0.20, kneeUp: 0.12, footOut: 0.36, attachZ: [0.16, 0.04, -0.08], dirs: [0.6, 1.5, 2.4], scale: [0.95, 1.05, 1.2] }
      }
    }
  ];

  BB.pestById = function (id) {
    for (var i = 0; i < BB.PESTS.length; i++) if (BB.PESTS[i].id === id) return BB.PESTS[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
