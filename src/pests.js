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
      actualSize: '4–6 mm soldier',
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
      actualSize: '10 mm (female)',
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
      actualSize: '16–20 cm + tail',
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
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'australian-cockroach',
      name: 'Australian Cockroach',
      sci: 'Periplaneta australasiae',
      aka: ['Garden roach'],
      order: 'Blattodea · Blattidae',
      threat: 3,
      threatLabel: 'MODERATE — OUTDOOR ROACH THAT MOVES IN',
      actualSize: '30–35 mm',
      tagline: 'The one that lives in the mulch and comes in when it rains.',
      vitals: [
        ['SIZE', '30–35 mm'],
        ['ID MARK', 'Yellow margin on the shield, yellow streaks on the wing shoulders'],
        ['COLOUR', 'Rich brown, glossy'],
        ['FLIGHT', 'Yes — short glides on warm nights'],
        ['BREEDING', '20–24 eggs per case'],
        ['HOME GROUND', 'Gardens and glasshouses more than kitchens']
      ],
      charges: [
        'Moves indoors in numbers after Brisbane rain',
        'Feeds on plants, then walks the same legs over your benches',
        'Contaminates stored food and pet food in garages and sheds',
        'Breeds unnoticed in mulch, ferneries and pot bases',
        'Gets mistaken for the American roach, so the wrong treatment gets used'
      ],
      mo: [
        'Lives outdoors in warm, humid, planted areas',
        'Shelters under mulch, bark, pots, and in glasshouses',
        'Comes inside through gaps in doors, weep holes and vents',
        'Feeds on decaying plant matter, seedlings and food scraps',
        'Most active at night, hides in cracks by day'
      ],
      evidence: [
        'Big brown roaches in the garage, laundry or patio at night',
        'Droppings around pot plants and garden edging',
        'Chewed seedlings and soft plant growth',
        'Egg cases tucked into bark, mulch or fern bases'
      ],
      hideouts: ['Garden mulch', 'Pot plant bases', 'Ferneries and glasshouses', 'Bark and leaf litter', 'Garage corners'],
      verdict: 'An outside job. Perimeter and garden-edge treatment plus sealing entry points beats spraying indoors, because the population never lived indoors.',
      spec: {
        plan: 'insect', len: 2.2, gloss: 0.6, stand: 0.065,
        abdomenW: 0.31, abdomenH: 0.086, abdomenL: 0.37, abdomenZ: -0.25,
        thoraxW: 0.26, thoraxH: 0.086, thoraxL: 0.20, thoraxZ: 0.17,
        pronotumW: 0.34, pronotumL: 0.235, pronotumH: 0.062,
        headW: 0.155, headH: 0.085, headL: 0.135, headZ: 0.375, headY: 0.088, headPitch: -0.55,
        eye: 0.048, cerci: 0.11,
        colors: {
          body: [96, 52, 26], abdomen: [104, 58, 30], thorax: [88, 46, 22],
          pronotum: [74, 38, 18], head: [96, 50, 24], leg: [138, 78, 38],
          antenna: [86, 44, 22], wing: [112, 62, 32], eye: [34, 24, 18]
        },
        markings: {
          pronotumHalo: { color: [214, 176, 70] },
          wingEdge: { color: [216, 178, 68], width: 0.34 }
        },
        wings: { len: 0.43, w: 0.235, thick: 0.022, spread: 0.26, lift: 0.22, z: -0.08, roll: 0.26, yaw: 0.03, pitch: -0.06, taperBack: 0.34, taperFront: 0.5, color: [116, 64, 32], gloss: 0.7 },
        antenna: { len: 1.2, thick: 0.014, segs: 12, splay: 0.32, arch: 0.26, spread: 0.44, rise: 0.1, reach: 1.18 },
        legs: { thick: 0.026, kneeOut: 0.18, kneeUp: 0.06, footOut: 0.33, attachZ: [0.21, 0.05, -0.12], dirs: [0.6, 1.5, 2.4], scale: [0.9, 1.0, 1.2] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'coastal-brown-ant',
      name: 'Coastal Brown Ant',
      sci: 'Pheidole megacephala',
      aka: ['Big-headed ant', 'Paver ant'],
      order: 'Hymenoptera · Formicidae',
      threat: 3,
      threatLabel: 'MODERATE — UNDERMINES PAVING, INVADES IN NUMBERS',
      actualSize: '1.5–3 mm',
      tagline: 'The sand piles between your pavers are its spoil heap.',
      vitals: [
        ['SIZE', '1.5–3 mm; soldiers have huge square heads'],
        ['ID MARK', 'Two sizes in one nest — that is the giveaway'],
        ['COLOUR', 'Light golden brown'],
        ['COLONY', 'Supercolonies with many queens'],
        ['SPREAD', 'Splits and re-nests instead of swarming'],
        ['STATUS', 'One of the world\'s worst invasive ants']
      ],
      charges: [
        'Excavates sand out from under pavers, paths and slabs',
        'Invades kitchens and pantries in overwhelming numbers',
        'Displaces native ants across whole suburbs',
        'Gets into wall cavities, meter boxes and electrical fittings',
        'Comes straight back when only the trail is sprayed'
      ],
      mo: [
        'Nests in soil under pavers, edging, slabs and garden beds',
        'Pushes excavated sand up as small piles along joints',
        'Sends workers indoors for grease, protein and sweets',
        'Colonies split and spread rather than flying off to mate',
        'Peaks through warm, wet Brisbane months'
      ],
      evidence: [
        'Fine sand piles along paver joints and path edges',
        'Two clearly different ant sizes on the same trail',
        'Trails along slab edges, weep holes and pipework',
        'Loose, sunken pavers over a hollowed bed'
      ],
      hideouts: ['Under pavers', 'Path and driveway edges', 'Garden beds', 'Wall cavities', 'Under slabs'],
      verdict: 'Baiting matched to what they are feeding on that week, plus a non-repellent perimeter — repellent sprays just split the colony and multiply the nests.',
      spec: {
        plan: 'insect', len: 1.8, gloss: 0.62, stand: 0.16, idle: 1.3,
        abdomenW: 0.175, abdomenH: 0.165, abdomenL: 0.22, abdomenZ: -0.30, abdomenTaper: 0.38, flatBottom: 0.05,
        thoraxW: 0.125, thoraxH: 0.125, thoraxL: 0.22, thoraxZ: 0.10, thoraxLift: 1.15,
        pronotum: false,
        waist: { r: 0.042, len: 0.10 },
        headW: 0.215, headH: 0.185, headL: 0.20, headZ: 0.46, headY: 0.235, headPitch: -0.18,
        eye: 0.032,
        colors: {
          body: [176, 116, 60], abdomen: [150, 96, 48], thorax: [186, 124, 64],
          head: [168, 104, 50], leg: [198, 146, 88], antenna: [186, 132, 76], eye: [40, 26, 18]
        },
        markings: {},
        mandibles: { len: 0.16, thick: 0.020, color: [120, 70, 30] },
        antenna: { elbowed: true, len: 0.72, thick: 0.018 },
        legs: { thick: 0.020, kneeOut: 0.19, kneeUp: 0.16, footOut: 0.32, attachZ: [0.16, 0.06, -0.06], dirs: [0.6, 1.45, 2.3], scale: [0.88, 0.92, 1.02] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'huntsman-spider',
      name: 'Huntsman Spider',
      sci: 'Heteropoda venatoria',
      aka: ['Giant crab spider', 'Tarantula (wrongly)'],
      order: 'Araneae · Sparassidae',
      threat: 1,
      threatLabel: 'LOW — ALARMING, BASICALLY HARMLESS',
      actualSize: 'To 100 mm span',
      tagline: 'Eats the cockroaches you have not noticed yet.',
      vitals: [
        ['SIZE', 'Body 20–25 mm, leg span to 100 mm+'],
        ['ID MARK', 'Flat body, legs angled forward like a crab'],
        ['COLOUR', 'Grey to tan, often mottled'],
        ['WEB', 'None — it hunts on foot'],
        ['SPEED', 'Very fast, sideways, on vertical walls'],
        ['BITE', 'Rare and minor; no antivenom needed']
      ],
      charges: [
        'Appears on the ceiling above the bed at 11pm',
        'Hides behind curtains, picture frames and sun visors',
        'Causes more panic per gram than any pest in Queensland',
        'Drops into the room when the front door is opened',
        'Guilty, mostly, of being enormous and quick'
      ],
      mo: [
        'Hunts at night on walls, fences and tree trunks',
        'Squeezes flat into gaps behind bark, cladding and frames',
        'Comes indoors through open doors and roof gaps in summer',
        'Females guard a flat white egg sac and get bold about it',
        'Feeds on cockroaches, moths and other insects'
      ],
      evidence: [
        'The spider itself — they do not hide subtly',
        'Flat white silk egg sac under bark or behind a frame',
        'Shed skins in wall gaps and behind furniture',
        'Repeat sightings in the same room mean an insect food supply'
      ],
      hideouts: ['Behind picture frames', 'Curtains and pelmets', 'Under bark', 'Roof voids', 'Car sun visors'],
      verdict: 'Honestly, most are best relocated with a container and a bit of card. Where numbers are the problem, treating the insects they hunt is what moves them on.',
      spec: {
        plan: 'arachnid', len: 2.5, gloss: 0.42, stand: 0.20, idle: 0.9,
        abdomenW: 0.20, abdomenH: 0.095, abdomenL: 0.25, abdomenZ: 0.20,
        thoraxW: 0.21, thoraxH: 0.085, thoraxL: 0.21, thoraxZ: 0.14,
        colors: {
          body: [150, 122, 88], abdomen: [140, 114, 82], thorax: [158, 130, 96],
          leg: [146, 116, 82], eye: [16, 12, 10]
        },
        markings: {},
        legs: { thick: 0.021, kneeOut: 0.38, kneeUp: 0.16, footOut: 0.92, attachZ: [0.16, 0.06, -0.04, -0.14], dirs: [0.85, 1.3, 1.9, 2.35], scale: [1.15, 1.25, 1.1, 1.0] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'white-tailed-spider',
      name: 'White-Tailed Spider',
      sci: 'Lampona cylindrata',
      aka: ['White-tip'],
      order: 'Araneae · Lamponidae',
      threat: 3,
      threatLabel: 'MODERATE — PAINFUL BITE, ROAMS INDOORS',
      actualSize: '12–18 mm',
      tagline: 'Hunts other spiders — through your bedroom, at night.',
      vitals: [
        ['SIZE', '12–18 mm body, slim and cigar-shaped'],
        ['ID MARK', 'Single white spot on the tip of the abdomen'],
        ['COLOUR', 'Dark grey to blackish, orange-brown legs'],
        ['WEB', 'None — a nomadic hunter'],
        ['PREY', 'Other spiders, including black house spiders'],
        ['BITE', 'Painful; the necrosis claim is not supported by evidence']
      ],
      charges: [
        'Wanders across floors, beds and towels after dark',
        'Hides in clothing left on the floor and in shoes',
        'Delivers a sharply painful bite when pressed against skin',
        'Turns up wherever black house spiders are established',
        'Peaks indoors exactly when the house is asleep'
      ],
      mo: [
        'Hunts on foot at night, rests in a silk sac by day',
        'Follows other spiders indoors — its food is your spider problem',
        'Shelters in bark, wall cavities, folded washing and shoes',
        'Most active in the warmer months, especially after rain',
        'Does not build a web, so there is nothing to spot'
      ],
      evidence: [
        'Spider sightings on the floor or wall at night, no web',
        'Small silk retreat sacs in wall gaps and under sills',
        'Existing black house spider webs around windows and eaves',
        'Bites reported on skin that was against bedding or clothing'
      ],
      hideouts: ['Under bark', 'Wall cavities', 'Clothing on the floor', 'Shoes', 'Behind wardrobes'],
      verdict: 'You cannot bait a hunter. Clearing the webbing spiders it feeds on, plus a treated perimeter and eave line, takes away the reason it comes in.',
      spec: {
        plan: 'arachnid', len: 2.05, gloss: 0.55, stand: 0.22, idle: 0.9,
        abdomenW: 0.15, abdomenH: 0.15, abdomenL: 0.28, abdomenZ: 0.34, abdomenTaper: 0.15,
        thoraxW: 0.145, thoraxH: 0.10, thoraxL: 0.20, thoraxZ: 0.16,
        colors: {
          body: [58, 54, 58], abdomen: [52, 48, 54], thorax: [70, 60, 58],
          leg: [126, 84, 58], eye: [10, 8, 10]
        },
        markings: { tailSpot: { color: [230, 226, 218], size: 0.82 } },
        legs: { thick: 0.024, kneeOut: 0.26, kneeUp: 0.28, footOut: 0.52, attachZ: [0.18, 0.08, -0.02, -0.12], dirs: [0.6, 1.2, 1.9, 2.5], scale: [1.0, 0.92, 0.9, 1.05] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'house-mouse',
      name: 'House Mouse',
      sci: 'Mus musculus',
      aka: ['Field mouse (wrongly)'],
      order: 'Rodentia · Muridae',
      threat: 4,
      threatLabel: 'HIGH — CONTAMINATION AND FAST BREEDING',
      actualSize: '7–9 cm + tail',
      tagline: 'Contaminates ten times more food than it eats.',
      vitals: [
        ['SIZE', '7–9 cm body, tail about the same again'],
        ['ID MARK', 'Small, grey-brown, pointed nose, big round ears'],
        ['GAP', 'Gets through a 6 mm hole — a biro would not fit'],
        ['BREEDING', '5–6 pups per litter, up to 10 litters a year'],
        ['DROPPINGS', 'Rice-grain sized, 3–6 mm, scattered'],
        ['RANGE', 'Lives its whole life within a few metres of food']
      ],
      charges: [
        'Urinates constantly as it moves — over food, benches and drawers',
        'Spreads salmonella and other food-borne bacteria',
        'Gnaws packaging, wiring, insulation and stored linen',
        'Turns a pair into two hundred inside a year',
        'Fails a food-business inspection on droppings alone'
      ],
      mo: [
        'Nests within a few metres of a food source, often inside a cupboard',
        'Runs the same routes along walls, never out in the open',
        'Nibbles a little from many places instead of one big feed',
        'Explores new objects readily — unlike rats, which avoid them',
        'Moves indoors as the weather cools'
      ],
      evidence: [
        'Rice-grain droppings in drawers, pantries and under the sink',
        'Ammonia smell in an enclosed cupboard',
        'Shredded paper, insulation or fabric pushed into a corner',
        'Gnaw marks on packaging and small greasy smears along skirtings'
      ],
      hideouts: ['Inside kitchen cupboards', 'Behind the dishwasher', 'Wall cavities', 'Stored boxes', 'Garage shelving'],
      verdict: 'Mice are curious, so stations work fast — but only alongside proofing. Every 6 mm gap you leave is an open door.',
      spec: {
        plan: 'rodent', len: 1.75, gloss: 0.20, stand: 0.12, idle: 1.1,
        bodyW: 0.155, bodyH: 0.165, bodyL: 0.34,
        headW: 0.105, headH: 0.105, headL: 0.16,
        ear: 0.088, tail: 0.95,
        colors: {
          body: [126, 110, 94], nose: [206, 150, 148], ear: [172, 140, 132],
          tail: [176, 152, 142], eye: [14, 10, 10], whisker: [232, 228, 222]
        },
        markings: { belly: { color: [206, 196, 178] } }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'silverfish',
      name: 'Silverfish',
      sci: 'Lepisma saccharinum',
      aka: ['Fishmoth', 'Paper fish'],
      order: 'Zygentoma · Lepismatidae',
      threat: 2,
      threatLabel: 'LOW-MODERATE — EATS PAPER, FABRIC AND KEEPSAKES',
      actualSize: '12–15 mm',
      tagline: 'Quietly eating the box of photos in the roof void.',
      vitals: [
        ['SIZE', '12–15 mm, carrot-shaped and flat'],
        ['ID MARK', 'Silver scales, two long antennae, three tail bristles'],
        ['MOVEMENT', 'Wriggles like a fish when the light hits it'],
        ['LIFESPAN', 'Two to eight years — extraordinary for an insect'],
        ['DIET', 'Starch: paper, glue, cotton, rayon, book bindings'],
        ['SURVIVAL', 'Can go a year without food in the right humidity']
      ],
      charges: [
        'Eats photographs, documents, books and wallpaper glue',
        'Holes natural-fibre clothing and stored linen',
        'Grazes the starch off wallpaper and leaves yellow stains',
        'Damages stored archives and keepsakes that cannot be replaced',
        'Does it all silently, over years, in boxes nobody opens'
      ],
      mo: [
        'Nocturnal and light-shy — hides in the dark and the damp',
        'Lives in roof voids, wardrobes, bookshelves and storage boxes',
        'Thrives in humid Brisbane conditions above 75% humidity',
        'Moults its whole life, leaving scales and skins behind',
        'Moves slowly between rooms through wall and ceiling gaps'
      ],
      evidence: [
        'Irregular holes and grazed patches on paper and fabric',
        'Fine silvery scales, like dust, in drawers and boxes',
        'Yellow staining on stored clothing and documents',
        'Live ones in the bath or basin, unable to climb out'
      ],
      hideouts: ['Roof void', 'Wardrobes and linen presses', 'Bookshelves', 'Storage boxes', 'Behind wallpaper'],
      verdict: 'A dust treatment through the roof void and wall cavities, where they actually live, plus fixing the humidity that keeps them there.',
      spec: {
        plan: 'insect', len: 2.0, gloss: 0.66, stand: 0.045, idle: 1.2,
        abdomenW: 0.135, abdomenH: 0.052, abdomenL: 0.46, abdomenZ: -0.26, abdomenTaper: 0.72, abdomenTaperFront: 0.02, flatBottom: 0.5,
        thoraxW: 0.155, thoraxH: 0.058, thoraxL: 0.30, thoraxZ: 0.30,
        pronotum: false,
        headW: 0.10, headH: 0.055, headL: 0.10, headZ: 0.56, headY: 0.065, headPitch: -0.2,
        eye: 0.022,
        cerci: { len: 0.72, count: 3, spread: 1.6, midScale: 1.25, color: [172, 176, 184] },
        colors: {
          body: [178, 182, 190], abdomen: [172, 176, 186], thorax: [188, 192, 198],
          head: [176, 180, 188], leg: [160, 164, 172], antenna: [168, 172, 180], eye: [30, 30, 34]
        },
        markings: { abdomenBands: { color: [120, 128, 142], count: 9 } },
        antenna: { len: 0.85, thick: 0.013, segs: 10, splay: 0.30, arch: 0.16, spread: 0.40, rise: 0.05, reach: 1.05 },
        legs: { thick: 0.016, kneeOut: 0.16, kneeUp: 0.07, footOut: 0.26, attachZ: [0.30, 0.20, 0.08], dirs: [0.75, 1.45, 2.15], scale: [0.7, 0.74, 0.82] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'cat-flea',
      name: 'Cat Flea',
      sci: 'Ctenocephalides felis',
      aka: ['The flea you actually have'],
      order: 'Siphonaptera · Pulicidae',
      threat: 4,
      threatLabel: 'HIGH — BITES PEOPLE AND PETS, HUGE HIDDEN POPULATION',
      actualSize: '1–2 mm',
      tagline: 'For every one you see, the carpet is holding fifty more.',
      vitals: [
        ['SIZE', '1–2 mm, flattened side-to-side'],
        ['ID MARK', 'Dark red-brown, combs of spines on the head'],
        ['JUMP', 'Up to 200 times its own body length'],
        ['BREEDING', '25–50 eggs a day per female'],
        ['THE 5%', 'Adults are 5% of the population — the rest is eggs and larvae'],
        ['DORMANCY', 'Pupae wait months for vibration and warmth']
      ],
      charges: [
        'Bites people around the ankles and lower legs, in clusters',
        'Makes pets miserable — scratching, hair loss, flea allergy dermatitis',
        'Transmits tapeworm to cats and dogs',
        'Ambushes the new occupants of a house the previous pet left',
        'Survives most DIY attempts because the eggs are not touched'
      ],
      mo: [
        'Adults live on the animal; eggs drop off wherever it sleeps',
        'Larvae burrow into carpet pile, bedding, subfloor sand and mulch',
        'Pupae sit dormant until footsteps, warmth and CO2 say a host arrived',
        'Peaks in warm, humid Brisbane weather',
        'Concentrates where the pet sleeps, not where you see the bites'
      ],
      evidence: [
        'Itchy bite clusters around ankles and lower legs',
        'A pet scratching, biting the tail base, or losing hair there',
        '"Flea dirt" — black specks in the coat that go rust-red on wet paper',
        'Bites starting the day you moved into an empty house'
      ],
      hideouts: ['Carpet and rug pile', 'Pet bedding', 'Sub-floor sand', 'Shaded garden soil', 'Lounge and car seats'],
      verdict: 'Treat the environment and the animal together, vacuum daily to trigger the pupae, and expect a second treatment — anything that only kills adults is treating 5% of the problem.',
      spec: {
        plan: 'insect', len: 1.6, gloss: 0.72, stand: 0.08, idle: 1.3,
        abdomenW: 0.10, abdomenH: 0.235, abdomenL: 0.28, abdomenZ: -0.22, abdomenTaper: 0.30, abdomenTaperFront: 0.18, flatBottom: 0.1,
        thoraxW: 0.09, thoraxH: 0.185, thoraxL: 0.15, thoraxZ: 0.14, thoraxLift: 1.05,
        pronotum: false,
        headW: 0.075, headH: 0.135, headL: 0.13, headZ: 0.36, headY: 0.135, headPitch: -0.45,
        eye: 0.022,
        colors: {
          body: [104, 52, 30], abdomen: [110, 56, 32], thorax: [96, 46, 26],
          head: [92, 44, 24], leg: [126, 72, 40], antenna: [92, 48, 26], eye: [26, 16, 12]
        },
        markings: { abdomenBands: { color: [70, 32, 18], count: 6 } },
        antenna: { len: 0.20, thick: 0.014, segs: 4, splay: 0.5, arch: 0.1, spread: 0.5, rise: 0.02, reach: 0.4 },
        legs: { thick: 0.018, kneeOut: 0.16, kneeUp: 0.22, footOut: 0.30, attachZ: [0.14, 0.02, -0.14], dirs: [0.7, 1.5, 2.5], scale: [0.72, 0.9, 1.5] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'european-wasp',
      name: 'European Wasp',
      sci: 'Vespula germanica',
      aka: ['German wasp'],
      order: 'Hymenoptera · Vespidae',
      threat: 4,
      threatLabel: 'HIGH — AGGRESSIVE, STINGS REPEATEDLY, NOTIFIABLE',
      actualSize: '12–15 mm',
      tagline: 'Ground nests, hidden colonies, and it does not need a reason.',
      vitals: [
        ['SIZE', '12–15 mm, stocky, vivid yellow and black'],
        ['ID MARK', 'Black antennae, black dots down the yellow abdomen'],
        ['NEST', 'Hidden — in the ground, a wall cavity or a roof void'],
        ['COLONY', 'Thousands of workers by late summer'],
        ['FLIGHT', 'Wings folded lengthways at rest, legs tucked'],
        ['STING', 'Repeatedly, and it recruits others when alarmed']
      ],
      charges: [
        'Stings repeatedly and swarms when a nest is disturbed',
        'Hunts at outdoor meals, bins and pet bowls, then stings the mouth or throat',
        'Builds unseen nests in wall cavities, roof voids and the ground',
        'Puts anyone with a sting allergy at real risk of anaphylaxis',
        'Turns lawn mowing into an emergency when the nest is underground'
      ],
      mo: [
        'Founded by one queen in spring, thousands strong by February',
        'Scavenges protein and sweet food — unlike bees, it wants your ham',
        'Flies in and out of a single small entry hole all day',
        'Guards the nest for several metres and recruits nestmates to attack',
        'Can overwinter in mild areas and restart bigger the next year'
      ],
      evidence: [
        'A steady stream of wasps in and out of one hole in the ground or wall',
        'Wasps working over bins, meat, pet food and drinks',
        'Papery nest material visible inside a cavity or roof space',
        'Sudden aggression while mowing or trimming'
      ],
      hideouts: ['Ground burrows', 'Wall cavities', 'Roof voids', 'Retaining walls', 'Compost heaps'],
      verdict: 'Never block the entry hole — they will chew a new one, often inwards. Nest treated at dusk in full protective gear, then the entry sealed once traffic stops.',
      spec: {
        plan: 'insect', len: 2.05, gloss: 0.6, stand: 0.20, idle: 1.2,
        abdomenW: 0.155, abdomenH: 0.16, abdomenL: 0.32, abdomenZ: -0.40, abdomenTaper: 0.5, abdomenTaperFront: 0.4, flatBottom: 0.05,
        thoraxW: 0.17, thoraxH: 0.17, thoraxL: 0.20, thoraxZ: 0.10, thoraxLift: 1.1,
        pronotum: false,
        waist: { r: 0.032, len: 0.13 },
        headW: 0.145, headH: 0.135, headL: 0.11, headZ: 0.36, headY: 0.25, headPitch: -0.1,
        eye: 0.052,
        colors: {
          body: [242, 206, 48], abdomen: [244, 210, 50], thorax: [40, 36, 34],
          head: [238, 202, 46], leg: [232, 190, 54], antenna: [28, 26, 26], eye: [30, 26, 22]
        },
        markings: { abdomenBands: { color: [30, 28, 26], count: 6, sharp: true } },
        wings: { len: 0.44, w: 0.09, thick: 0.008, spread: 0.7, lift: 0.6, z: -0.05, roll: 0.08, yaw: 0.08, pitch: -0.05, taperBack: 0.35, taperFront: 0.45, color: [214, 210, 202], gloss: 0.8, alpha: 0.42 },
        antenna: { len: 0.5, thick: 0.018, segs: 6, splay: 0.4, arch: 0.28, spread: 0.46, reach: 0.68 },
        legs: { thick: 0.018, kneeOut: 0.2, kneeUp: 0.12, footOut: 0.34, attachZ: [0.16, 0.04, -0.08], dirs: [0.6, 1.5, 2.4], scale: [0.9, 1.0, 1.12] }
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: 'pantry-moth',
      name: 'Pantry Moth',
      sci: 'Plodia interpunctella',
      aka: ['Indian meal moth', 'Flour moth'],
      order: 'Lepidoptera · Pyralidae',
      threat: 2,
      threatLabel: 'LOW-MODERATE — SPOILS STORED FOOD, SPREADS JAR TO JAR',
      actualSize: '8–10 mm at rest',
      tagline: 'It came home in the birdseed and it is in everything now.',
      vitals: [
        ['SIZE', '8–10 mm at rest, 16 mm wingspan'],
        ['ID MARK', 'Two-tone wings — pale cream inner half, coppery-bronze tips'],
        ['LARVAE', 'Cream caterpillars with a dark head, in the food'],
        ['EGGS', '100–300 per female, laid straight onto food'],
        ['CYCLE', '4–6 weeks in a warm Brisbane pantry'],
        ['CHEWS', 'Larvae bite through thin plastic and cardboard']
      ],
      charges: [
        'Spoils flour, rice, cereal, nuts, spices, pet food and birdseed',
        'Spins webbing and leaves droppings through the food itself',
        'Chews into sealed packets and spreads jar to jar',
        'Comes home already inside a bag from the shop',
        'Costs you the whole pantry once it is established'
      ],
      mo: [
        'Adults do not feed — they exist to lay eggs on your food',
        'Larvae do the damage, then crawl to the ceiling to pupate',
        'Spins silk webbing that mats dry goods together',
        'Hides pupae in cupboard corners, hinges and shelf lips',
        'Breeds year-round indoors in Brisbane warmth'
      ],
      evidence: [
        'Small moths sitting flat on pantry walls and ceilings',
        'Webbing and clumping in flour, rice or pet food',
        'Cream caterpillars crawling on shelves or up the wall',
        'Silk cocoons in cupboard corners and around hinges'
      ],
      hideouts: ['Pantry shelves', 'Cardboard packets', 'Pet food and birdseed', 'Cupboard corners', 'Shelf lips and hinges'],
      verdict: 'Every open packet checked and binned, shelves stripped and cleaned, a residual treatment to the empty cupboard, then everything into sealed containers.',
      spec: {
        plan: 'insect', len: 1.8, gloss: 0.28, stand: 0.06, idle: 1.15,
        abdomenW: 0.10, abdomenH: 0.10, abdomenL: 0.32, abdomenZ: -0.24, abdomenTaper: 0.42, abdomenTaperFront: 0.12,
        thoraxW: 0.115, thoraxH: 0.115, thoraxL: 0.14, thoraxZ: 0.18,
        pronotum: false,
        headW: 0.075, headH: 0.075, headL: 0.08, headZ: 0.32, headY: 0.135, headPitch: -0.3,
        eye: 0.03,
        colors: {
          body: [176, 152, 122], abdomen: [170, 148, 120], thorax: [206, 188, 158],
          head: [206, 188, 158], leg: [180, 158, 128], antenna: [150, 128, 100], eye: [26, 20, 16]
        },
        markings: { wingSplit: { color: [138, 82, 40], at: 0.02 } },
        wings: { len: 0.40, w: 0.115, thick: 0.012, spread: 0.55, lift: 0.55, z: -0.06, roll: -0.22, yaw: 0.04, pitch: -0.04, taperBack: 0.4, taperFront: 0.35, color: [216, 200, 168], gloss: 0.2 },
        antenna: { len: 0.42, thick: 0.011, segs: 7, splay: 0.22, arch: 0.16, spread: 0.28, rise: 0.04, reach: 0.9 },
        legs: { thick: 0.014, kneeOut: 0.16, kneeUp: 0.10, footOut: 0.26, attachZ: [0.18, 0.06, -0.06], dirs: [0.7, 1.5, 2.4], scale: [0.8, 0.86, 0.95] }
      }
    }
  ];

  BB.pestById = function (id) {
    for (var i = 0; i < BB.PESTS.length; i++) if (BB.PESTS[i].id === id) return BB.PESTS[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
