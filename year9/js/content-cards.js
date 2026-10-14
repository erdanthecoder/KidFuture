// Flashcards for every topic, taken from the class revision notes. [front, back]
// Card ids are "<lessonId>:<index>", so only ever ADD cards to the end of a list.

export const CARDS = {
  // ---------------- MATHS
  'm1.1': [
    ['10³ = ?', '1000'], ['10² = ?', '100'], ['10⁰ = ?', '1'], ['10⁻¹ = ?', '0.1'], ['10⁻³ = ?', '0.001'],
    ['aᵐ × aⁿ = ?', 'aᵐ⁺ⁿ — multiply → <b>add</b> the powers'], ['aᵐ ÷ aⁿ = ?', 'aᵐ⁻ⁿ — divide → <b>subtract</b> the powers'],
    ['(aᵐ)ⁿ = ?', 'aᵐˣⁿ — power of a power → <b>multiply</b> the powers'], ['a⁻ⁿ = ?', '1/aⁿ'], ['a⁰ = ?', '1'],
    ['(a/b)ⁿ = ?', 'aⁿ/bⁿ'], ['3⁴ × 3⁶ = ?', '3¹⁰'], ['7⁹ ÷ 7⁵ = ?', '7⁴'], ['(2⁴)³ = ?', '2¹²'], ['3⁻² = ?', '1/9'], ['(3/4)² = ?', '9/16'],
  ],
  'm1.2': [
    ['How is standard form written?', '<b>A × 10ⁿ</b>, where 1 ≤ A &lt; 10 and n is a whole number'],
    ['41 000 in standard form', '4.1 × 10⁴'], ['0.00394 in standard form', '3.94 × 10⁻³'], ['3 × 10⁴ as an ordinary number', '30 000'],
    ['A big number in standard form has a … power', 'positive (move the point left)'], ['A small number (less than 1) has a … power', 'negative (move the point right)'],
    ['Back to an ordinary number: a positive power means move the point…', 'right'], ['Back to an ordinary number: a negative power means move the point…', 'left'],
    ['What is wrong with 0.2 × 10²?', '0.2 is not between 1 and 10. It should be 2 × 10¹.'],
  ],
  'm1.3': [
    ['How do you multiply in standard form?', 'Multiply the numbers, <b>add</b> the powers'], ['(3 × 10⁷) × (2 × 10⁴) = ?', '6 × 10¹¹'],
    ['How do you divide in standard form?', 'Divide the numbers, <b>subtract</b> the powers'], ['(8 × 10⁹) ÷ (4 × 10³) = ?', '2 × 10⁶'],
    ['Fix 10.8 × 10⁵', '1.08 × 10⁶ (number ÷ 10, so power + 1)'], ['How do you add or subtract in standard form?', 'Change to ordinary numbers first'],
    ['5 × 10⁷ + 4 × 10⁶ = ?', '54 000 000 = 5.4 × 10⁷'], ['How do you order numbers in standard form?', 'Compare the powers first, then the first numbers'],
  ],
  'm1.4': [
    ['What is the 1st significant figure?', 'The first digit that is not zero'], ['First significant figure of 0.0571?', '5'],
    ['Rounding rule', 'Look at the next digit: 5 or more → round up; 4 or less → stay the same'],
    ['21 561 to 2 s.f.', '22 000'], ['0.05713 to 3 s.f.', '0.0571'], ['How do you estimate?', 'Round every number to 1 s.f.'],
    ['Estimate 37 × 492', '40 × 500 = 20 000'], ['1 m² = ? cm²', '100² = 10⁴ = 10 000 cm²'], ['1 m³ = ? cm³', '100³ = 10⁶ = 1 000 000 cm³'],
  ],
  'm2.1': [
    ['What is a prism?', 'A solid with the same cross-section all the way through (cuboid, triangular prism)'],
    ['How do you find surface area?', 'Add the area of every face'], ['Surface area of a cube with side 2 cm', '6 × 4 = 24 cm²'],
    ['Volume of a prism', 'Cross-section area × length'], ['Triangular prism: triangle ½ × 4 × 3.5, length 5. Volume?', '7 × 5 = 35 cm³'],
    ['1 cm³ = ?', '1 ml'], ['1 litre = ?', '1000 cm³'], ['1 m³ = ?', '1000 litres'],
  ],
  'm2.2': [
    ['Diameter in terms of radius', 'd = 2r'], ['Circumference formulas', 'C = πd or C = 2πr'], ['Area of a circle', 'A = πr² — always use the radius'],
    ['Circumference when d = 12', '37.7 cm'], ['Circumference when r = 7', '44.0 cm'], ['Area when r = 7', '153.9 cm²'],
    ['Area of a semicircle', '½ of the circle’s area'], ['Area of a quarter circle', '¼ of the circle’s area'],
  ],
  'm2.3': [
    ['Volume of a cylinder', 'V = πr²h'], ['Surface area of a cylinder', 'SA = 2πr² + 2πrh'], ['Cylinder r = 5, h = 9: volume?', '706.9 cm³'],
    ['Cylinder r = 3, h = 8: surface area?', '207.3 cm²'], ['In SA = 2πr² + 2πrh, what is 2πr²?', 'The two circle ends'],
    ['In SA = 2πr² + 2πrh, what is 2πrh?', 'The curved surface (a rectangle when unrolled)'],
  ],
  'm2.4': [
    ['When can you use Pythagoras?', 'Only in right-angled triangles'], ['What is the hypotenuse?', 'The longest side, opposite the right angle (c)'],
    ['Finding the long side (hypotenuse)', 'c² = a² + b²'], ['Finding a short side', 'a² = c² − b²'],
    ['Short sides 3 and 4. Hypotenuse?', '5'], ['Hypotenuse 13, one side 5. Other side?', '12'],
  ],
  'm3.1': [
    ['Expression', 'No equals sign. e.g. 3x + 4y'], ['Formula', 'A rule linking variables. e.g. P = 4t + 5'],
    ['Equation', 'True only for some values. e.g. 2x + 5 = 11'], ['Identity', 'True for every value. Uses ≡. e.g. x + x + 5 ≡ 2x + 5'],
    ['What does ≡ mean?', 'Identical — true for every value'], ['Solve 2x + 5 = 11', 'x = 3'],
  ],
  'm3.2': [
    ['How do you multiply terms?', 'Multiply the numbers, add the powers'], ['3x³y × 5xy² = ?', '15x⁴y³'],
    ['How do you divide terms?', 'Divide the numbers, subtract the powers'], ['20x⁵ ÷ 4x⁸ = ?', '5x⁻³ = 5/x³'],
    ['x on its own has power…', '1 (x = x¹)'],
  ],
  'm3.3': [
    ['What does “expand” mean?', 'Multiply every term inside the bracket'], ['2p(4 + 5p + p²) = ?', '8p + 10p² + 2p³'],
    ['−3(p + 2) = ?', '−3p − 6'], ['What are like terms?', 'Terms with the same letters AND the same powers'],
    ['3(x + 5) + 4(x − 1) = ?', '3x + 15 + 4x − 4 = 7x + 11'],
  ],
  'm3.4': [
    ['HCF of algebraic terms', 'Biggest number + lowest power of each shared letter'], ['HCF of 12xy³ and 8x²y²', '4xy²'],
    ['Factorise completely means…', 'Take out the HCF'], ['Factorise 4x² + 12x', '4x(x + 3)'], ['Factorise 12xy³ + 8x²y²', '4xy²(3y + 2x)'],
    ['How do you check a factorisation?', 'Expand it back'],
  ],
  'mq.1': [
    ['nth term of an arithmetic sequence', 'dn + (first term − d)'], ['nth term of 5, 9, 13, …', '4n + 1'],
    ['Quadratic sequence', 'The nth term has n²'], ['Geometric sequence', 'Multiply by the same number each time (common ratio)'],
  ],
  'mq.2': [
    ['(x + 2)(x + 4) = ?', 'x² + 6x + 8'], ['Perfect square: (x + a)² = ?', 'x² + 2ax + a²'], ['Difference of two squares: x² − a² = ?', '(x + a)(x − a)'],
  ],
  'mq.3': [
    ['How do you factorise x² + bx + c?', 'Find two numbers that add to b and multiply to c'], ['Factorise x² + 7x + 10', '(x + 5)(x + 2)'],
    ['How do you solve a quadratic?', 'Make it = 0, factorise, set each bracket = 0'], ['Solve x² + 6x − 27 = 0', 'x = −9 or x = 3'],
  ],

  // ---------------- SCIENCE 8D
  's8d.1': [
    ['The 5 kingdoms', 'Animals, plants, fungi, protoctists, prokaryotes'], ['Unicellular means…', 'Made of one cell'],
    ['What do prokaryotes (bacteria) NOT have?', 'A nucleus and mitochondria'], ['Is a virus alive?', 'No — it is not a cell and not alive'],
    ['Parts of a virus', 'Genes, a protein coat, and an envelope with spikes'],
    ['How does a virus reproduce?', 'It gets inside a cell, makes the cell copy it, then bursts out'],
    ['Viruses are … parasites', 'Obligate parasites — they can only reproduce inside a living cell'],
    ['Size order', 'Protoctist > bacterium > virus'], ['Bacterium: flagellum', 'Movement'], ['Bacterium: cell membrane', 'Controls what goes in and out'],
    ['Bacterium: cell wall + slimy capsule', 'Protect it'], ['Bacterium: where are the genes?', 'Circular chromosome + plasmids'],
  ],
  's8d.2': [
    ['Pathogen', 'A microorganism that causes disease'], ['Vaccine', 'Prevents disease'], ['Antibiotic', 'Kills bacteria'],
    ['Do antibiotics work on viruses?', 'No (e.g. measles is a virus)'], ['Example of a fungal disease', 'Athlete’s foot'],
    ['What causes malaria?', 'Plasmodium (a protoctist)'], ['What spreads malaria?', 'Mosquitoes'],
  ],
  's8d.3': [
    ['Diffusion', 'Particles spread from where there are more to where there are fewer'],
    ['Why do big organisms need a transport system?', 'They have a small surface area : volume ratio, so diffusion is too slow'],
    ['Small things have a … SA : V ratio', 'Large'],
  ],
  's8d.4': [
    ['What type of organism is yeast?', 'A unicellular fungus'], ['Aerobic respiration (word equation)', 'glucose + oxygen → carbon dioxide + water'],
    ['Fermentation (word equation)', 'glucose → ethanol + carbon dioxide'], ['Which releases more energy?', 'Aerobic respiration'],
    ['Is fermentation aerobic or anaerobic?', 'Anaerobic (no oxygen)'], ['How does yeast reproduce?', 'Asexually, by budding — the new cells are identical'],
    ['Growth curve: the steepest part', 'Fastest growth'], ['Growth curve: the flat part at the end', 'No growth — the food has run out (limiting factor)'],
    ['Which bacteria make yoghurt?', 'Lactobacillus'], ['What makes yoghurt sour?', 'Lactic acid (lactic acid fermentation)'],
  ],
  's8d.5': [
    ['Protoctists', 'Unicellular with a nucleus'], ['Euglena', 'Has chloroplasts — an alga'], ['How does Paramecium move?', 'With cilia'],
    ['Photosynthesis (word equation)', 'carbon dioxide + water → glucose + oxygen (needs light)'], ['What absorbs the light for photosynthesis?', 'Chlorophyll'],
    ['Pyramid of biomass', 'Biomass gets smaller at each level, because energy is lost'], ['Decomposer', 'An organism that breaks down dead tissue using enzymes'],
    ['Carbon cycle: which process removes CO₂?', 'Photosynthesis'], ['Carbon cycle: which processes add CO₂?', 'Respiration, combustion and decay'],
    ['Why has CO₂ in the air risen?', 'We burn fossil fuels'],
  ],
  // ---------------- SCIENCE 8G
  's8g.1': [
    ['Properties of metals', 'Shiny, good conductors of heat and electricity, malleable, ductile, strong'], ['Malleable', 'Can be hammered into shape'],
    ['Ductile', 'Can be pulled into wires'], ['Physical property', 'Can be seen without changing the substance'], ['Chemical property', 'How it reacts'],
  ],
  's8g.2': [
    ['metal + oxygen → ?', 'metal oxide'], ['magnesium + oxygen → ?', 'magnesium oxide'], ['metal + water → ?', 'metal hydroxide + hydrogen'],
    ['metal + acid → ?', 'salt + hydrogen'], ['Hydrochloric acid makes salts called…', 'chlorides'], ['Sulfuric acid makes salts called…', 'sulfates'],
    ['Nitric acid makes salts called…', 'nitrates'], ['Test for hydrogen', 'A lit splint gives a squeaky pop'], ['Effervescence', 'Bubbles'],
  ],
  's8g.3': [
    ['Reactivity series (most → least)', 'Potassium, sodium, lithium, calcium, magnesium, aluminium, zinc, iron, tin, lead, copper (silver, gold)'],
    ['Most reactive metal in the series', 'Potassium'], ['Least reactive metals', 'Silver and gold'], ['Catalyst', 'Speeds up a reaction and is not used up'],
  ],
  's8g.4': [
    ['Rusting (word equation)', 'iron + water + oxygen → rust'], ['What does rusting need?', 'BOTH water and oxygen'],
    ['Four ways to prevent rusting', 'Painting, oiling, galvanising, a plastic coat'], ['Galvanising', 'Coating with zinc'], ['How much of the air is oxygen?', 'About 20%'],
  ],
  's8g.5': [
    ['Making a salt (steps)', 'Add metal to acid until it stops reacting → filter → evaporate → crystals'], ['Alloy', 'A mixture of a metal with other elements'],
    ['Why are alloys harder?', 'Different-sized atoms stop the layers sliding'], ['Bronze', 'Copper + tin'], ['Brass', 'Copper + zinc'], ['Steel', 'Iron + carbon'],
    ['Stainless steel', 'Iron + chromium + carbon — does not corrode'], ['How do pure substances and alloys melt?', 'Pure: at one fixed temperature. Alloys: over a range.'],
  ],
  's8g.6': [
    ['Ratio of atoms in MgCl₂', '1 : 2'], ['Ratio of atoms in Al₂O₃', '2 : 3'], ['Accurate', 'Close to the real value'], ['Anomalous', 'Does not fit the pattern'],
    ['Repeatable', 'The same person gets similar results'], ['Reproducible', 'Other people get similar results'],
  ],
  // ---------------- SCIENCE 8L
  's8l.1': [
    ['What causes day and night?', 'The Earth spins on its axis once every 24 hours'], ['What causes the seasons?', 'The Earth’s axis is tilted'],
    ['Summer happens when your hemisphere is…', 'Tilted towards the Sun: longer days, Sun higher, rays more concentrated'],
    ['Are seasons caused by the Earth being closer to the Sun?', 'No!'], ['Why is it hotter at the Equator?', 'The Sun’s rays hit it straight on, so the energy is concentrated on a small area'],
  ],
  's8l.2': [
    ['Star', 'A ball of hot gas'], ['Planet', 'Large and round, orbits the Sun'], ['Moon', 'Orbits a planet'], ['Asteroid', 'Small and rocky, orbits the Sun'],
    ['Ptolemy’s model', 'Earth at the centre'], ['Copernicus’s model', 'Sun at the centre, circular orbits'], ['Modern (Kepler) model', 'Sun at the centre, elliptical orbits'],
    ['Why can we see the Moon and planets?', 'They reflect sunlight'], ['The Moon’s changing shapes are called…', 'Phases'],
  ],
  's8l.3': [
    ['Like poles…', 'Repel'], ['Unlike poles…', 'Attract'], ['Where is a magnet’s field strongest?', 'Near the poles'], ['Which way does a magnetic field go?', 'From N to S'],
    ['How can you find the shape of a magnetic field?', 'Iron filings or a small compass'], ['What is a compass?', 'A small magnet that lines up with the Earth’s magnetic field'],
    ['Is there a real magnet inside the Earth?', 'No'],
  ],
  's8l.4': [
    ['Mass', 'The amount of matter (kg) — the same everywhere'], ['Weight', 'The force of gravity (N)'], ['Weight formula', 'W = m × g'],
    ['Earth’s g', '10 N/kg'], ['Weight of 2 kg on Earth', '20 N'], ['Weight of 2 kg on the Moon (g = 1.6)', '3.2 N'],
    ['Gravity is stronger when…', 'There is more mass, or you are closer'], ['What keeps the Earth in orbit?', 'The Sun’s gravity'],
    ['On top of Everest you weigh…', 'Slightly less'], ['Natural satellite example', 'The Moon'], ['Artificial satellite uses', 'Communications, weather, GPS'],
  ],
  's8l.5': [
    ['Size order', 'Moon < planet < star < galaxy < Universe'], ['Why does the Sun look brightest?', 'It is the closest star'],
    ['Why can’t we see stars by day?', 'The Sun is too bright'], ['Light year', 'The DISTANCE light travels in one year'],
    ['Our galaxy', 'The Milky Way'], ['Why can’t we see the Milky Way’s shape?', 'We are inside it'],
  ],
  // ---------------- ENGLISH
  e1: [
    ['Author of Lord of the Flies', 'William Golding'], ['When was it published?', '1954'], ['Golding’s war service', 'Royal Navy, World War II'],
    ['Setting', 'An uninhabited tropical island, during a war'], ['Genre', 'Allegory — characters and objects stand for bigger ideas'],
    ['The novel in one sentence', 'British schoolboys stranded on an island with no adults slowly turn from order to savagery'],
  ],
  e2: [
    ['Chapter 1: The Sound of the Shell', 'Plane crash. Ralph blows the conch. Vote: Ralph is chief. Jack’s choir become hunters. Jack hesitates to kill a piglet.'],
    ['Chapter 2: Fire on the Mountain', 'Conch rule. The “beastie”. Fire lit with Piggy’s glasses burns part of the forest. Boy with the birthmark goes missing.'],
    ['Chapter 3: Huts on the Beach', 'Jack obsessed with hunting. Ralph and Simon build shelters. Ralph and Jack argue. Simon goes to his clearing.'],
    ['Chapter 4: Painted Faces and Long Hair', 'Jack paints his face. A ship passes but the fire is out. First kill. Jack breaks one lens of Piggy’s glasses.'],
    ['Who becomes chief in Chapter 1?', 'Ralph (by a vote)'], ['What lights the first fire?', 'Piggy’s glasses'], ['Why does the ship pass by in Chapter 4?', 'The hunters let the fire go out to go hunting'],
  ],
  e3: [
    ['Chapter 5: Beast from Water', 'Meeting about fear. Piggy: no beast. Simon: “only us”. Jack rejects the rules and the conch.'],
    ['Chapter 6: Beast from Air', 'Dead parachutist lands on the mountain. Sam and Eric think it is the beast. Castle Rock found.'],
    ['Chapter 7: Shadows and Tall Trees', 'Ralph hits a boar and enjoys it. Robert nearly hurt in a game. They see the parachutist and run.'],
    ['Chapter 8: Gift for the Darkness', 'Jack starts his own tribe. Sow’s head on a stick. Simon’s vision: the beast is part of everyone.'],
    ['What is the “Lord of the Flies”?', 'The sow’s head on a stick, covered in flies'], ['What does Simon say the beast might be?', '“Only us”'],
  ],
  e4: [
    ['Chapter 9: A View to a Death', 'Simon finds the beast is a dead parachutist. Storm and wild dance. The boys kill Simon.'],
    ['Chapter 10: The Shell and the Glasses', 'Guilt. Only Ralph, Piggy, Sam and Eric left. Jack rules with fear. Hunters steal Piggy’s glasses.'],
    ['Chapter 11: Castle Rock', 'Piggy holds the conch. Roger’s rock kills Piggy and smashes the conch. Sam and Eric captured.'],
    ['Chapter 12: Cry of the Hunters', 'Ralph hunted; island set on fire. A naval officer sees the smoke. Ralph cries.'],
    ['Who kills Piggy?', 'Roger (he pushes a huge rock)'], ['Why do the hunters steal the glasses?', 'To make fire'], ['How are the boys rescued?', 'A naval officer sees the smoke'],
    ['What does Ralph cry for at the end?', 'The loss of innocence, the darkness in people’s hearts, and his wise friend Piggy'],
  ],
  e5: [
    ['The conch', 'Order, rules and democracy. When it is smashed, order ends.'], ['Piggy’s glasses', 'Science, reason and intelligence — and the power to make fire'],
    ['The signal fire', 'Hope of rescue and the link to civilisation'], ['The beast / Lord of the Flies', 'The evil inside every person'],
    ['“Maybe it’s only us.”', 'Simon, Chapter 5'], ['“Which is better — to have rules and agree, or to hunt and kill?”', 'Piggy, Chapter 11'],
    ['“Kill the pig. Cut her throat. Spill her blood.”', 'The hunters’ chant, Chapter 4'], ['“Fancy thinking the Beast was something you could hunt and kill!”', 'The Lord of the Flies (to Simon), Chapter 8'],
  ],
  // ---------------- GEOGRAPHY: ROCKS
  g1: [
    ['The three types of rock', 'Igneous, sedimentary, metamorphic'], ['Igneous rock', 'Magma or lava that has cooled and hardened'],
    ['Sedimentary rock', 'Layers of sediment compacted and cemented over millions of years'], ['Metamorphic rock', 'Existing rock changed by heat and pressure, without melting'],
    ['Why does granite have large crystals?', 'The magma cooled slowly underground'], ['Why does basalt have small crystals?', 'The lava cooled quickly on the surface'],
    ['Which rock type can contain fossils?', 'Sedimentary'], ['Limestone becomes… (heat and pressure)', 'Marble'], ['Shale becomes… (heat and pressure)', 'Slate'],
    ['Granite: igneous, sedimentary or metamorphic?', 'Igneous'], ['Chalk: igneous, sedimentary or metamorphic?', 'Sedimentary'], ['Slate: igneous, sedimentary or metamorphic?', 'Metamorphic'],
  ],
  g2: [
    ['What is the rock cycle?', 'Rocks slowly changing from one type to another over millions of years'],
    ['Weathering → erosion → deposition → …?', 'Compaction and cementation → sedimentary rock'], ['What makes metamorphic rock?', 'Heat and pressure'],
    ['What happens when rock melts?', 'It becomes magma'], ['What happens when magma cools?', 'It becomes igneous rock'], ['Uplift', 'Rocks pushed back up to the surface'],
    ['Deposition', 'Sediment is dropped and settles in layers'],
  ],
  g3: [
    ['Weathering', 'Rock breaking down where it is'], ['Erosion', 'Rock worn away and carried off'],
    ['Freeze-thaw', 'Water in a crack freezes, expands (about 9%), widens the crack; repeated, pieces break off'],
    ['Chemical weathering example', 'Rainwater (a weak acid) dissolving limestone'], ['Biological weathering example', 'Plant roots growing into cracks'],
    ['Scree', 'Broken rock at the bottom of a slope'],
  ],
  g4: [
    ['Limestone is mainly…', 'Calcium carbonate'], ['Joints', 'Vertical cracks in limestone'], ['Bedding planes', 'Horizontal cracks between layers'],
    ['Clints', 'Blocks of limestone pavement'], ['Grikes', 'Gaps between the blocks'], ['Stalactite', 'Hangs from the cave ceiling'],
    ['Stalagmite', 'Grows up from the cave floor'], ['Pillar', 'A stalactite and stalagmite joined'], ['Swallow hole', 'Where a river disappears underground'],
    ['UK limestone pavement example', 'Malham, Yorkshire Dales'], ['UK limestone gorge example', 'Cheddar Gorge, Somerset'],
  ],
  g5: [
    ['Slate is used for…', 'Roofs (splits into thin waterproof sheets)'], ['Granite is used for…', 'Buildings, kerbs, worktops (very hard)'],
    ['Limestone is used for…', 'Building, cement, farming'], ['Marble is used for…', 'Statues and decoration'], ['Clay is used for…', 'Bricks and pottery'],
    ['Quarrying: advantages', 'Jobs, building materials, money for the area'], ['Quarrying: disadvantages', 'Noise, dust, lorries, scars on the landscape, habitats lost'],
    ['What is soil made of?', 'Weathered rock, humus, air, water and living things'], ['Humus', 'Rotted plant and animal matter'],
  ],
  // ---------------- HISTORY 1901–TODAY
  h1: [
    ['Leader of the suffragists (NUWSS)', 'Millicent Fawcett'], ['Leader of the suffragettes (WSPU)', 'Emmeline Pankhurst (founded 1903)'],
    ['Suffragette motto', '“Deeds, not words”'], ['Cat and Mouse Act (1913)', 'Hunger strikers released when weak, re-arrested when well'],
    ['Emily Wilding Davison', 'Died after running onto the course at the 1913 Epsom Derby'], ['What happened in 1918?', 'Women over 30 (with property) got the vote'],
    ['What happened in 1928?', 'Women got the vote at 21, the same as men'],
  ],
  h2: [
    ['MAIN causes of WW1', 'Militarism, Alliances, Imperialism, Nationalism'], ['Triple Entente', 'Britain, France, Russia'], ['Triple Alliance', 'Germany, Austria-Hungary, Italy'],
    ['The spark of WW1', 'Archduke Franz Ferdinand assassinated in Sarajevo, 28 June 1914'], ['Why did Britain join the war?', 'Germany invaded Belgium (4 August 1914)'],
    ['No man’s land', 'The land between the two sides’ trenches'], ['First day of the Somme', '1 July 1916 — about 57,000 British casualties'],
    ['Armistice', '11am, 11 November 1918'], ['Treaty of Versailles (1919)', 'Germany blamed, paid reparations, army cut to 100,000, lost land'],
  ],
  h3: [
    ['Russian Revolution', '1917 — Lenin and the Bolsheviks took power'], ['Wall Street Crash', 'October 1929 — started the Great Depression'],
    ['When did Hitler become Chancellor?', 'January 1933'], ['Appeasement', 'Giving in to Hitler’s demands to avoid war (Munich, 1938)'],
    ['Why did Germans support Hitler?', 'Unemployment in the Depression, anger at Versailles, propaganda'],
  ],
  h4: [
    ['WW2 begins', '1 September 1939 Germany invades Poland; 3 September Britain declares war'], ['Dunkirk', '1940 — about 338,000 soldiers rescued from France'],
    ['Battle of Britain', '1940 — the RAF beat the Luftwaffe'], ['The Blitz', '1940–41 German bombing of British cities'], ['Pearl Harbor', '7 December 1941 — USA joins the war'],
    ['D-Day', '6 June 1944 — Allied landings in Normandy'], ['VE Day', '8 May 1945'], ['VJ Day', '15 August 1945'],
    ['Evacuation', 'Children moved from cities to the countryside'], ['Rationing', 'Limits on food like bacon, butter and sugar (from 1940)'],
  ],
  h5: [
    ['The Holocaust', 'The Nazi murder of about 6 million Jewish people, and many others'], ['Nuremberg Laws (1935)', 'Took away Jewish people’s citizenship and rights'],
    ['Kristallnacht (1938)', 'The “Night of Broken Glass” — attacks on Jewish homes, shops and synagogues'], ['Wannsee Conference (1942)', 'Nazi leaders planned the “Final Solution”'],
    ['Holocaust Memorial Day', '27 January — Auschwitz was liberated in 1945'],
  ],
  h6: [
    ['Who won the 1945 election?', 'Labour, led by Clement Attlee'], ['The five giants', 'Want, Disease, Ignorance, Squalor, Idleness'],
    ['When did the NHS begin?', '5 July 1948'], ['Minister who set up the NHS', 'Aneurin Bevan'], ['Indian independence', '15 August 1947 — split into India and Pakistan'],
    ['Empire Windrush', 'Ship that brought people from the Caribbean in 1948'],
  ],
  h7: [
    ['Cold War', 'USA vs USSR tension, about 1947–1991, with no direct war'], ['Berlin Wall', 'Built 1961, fell 9 November 1989'], ['Cuban Missile Crisis', 'October 1962'],
    ['First Moon landing', '20 July 1969 — Neil Armstrong, Apollo 11'], ['End of the USSR', 'December 1991'], ['Rosa Parks', '1955 — refused to give up her bus seat'],
    ['“I have a dream”', 'Martin Luther King, 1963'],
  ],
};
