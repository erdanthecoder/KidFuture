// GEOGRAPHY – ROCKS (geog.3). Standard Key Stage 3 content on rocks, the rock cycle,
// weathering, limestone landscapes and how we use rocks and soil.

import { pick, shuffle, mcq } from './engine.js';
import { mcqS } from './content-maths.js';

const tf = (q, answer, why) => ({ type: 'tf', q, answer, why });
const text = (q, answer, accept, why) => ({ type: 'text', q, answer, accept, why });
const match = (q, pairs, why) => () => ({ type: 'match', q, pairs: shuffle(pairs).slice(0, 4), why });
const order = (q, items, why) => ({ type: 'order', q, items, why });

export const ROCKS = [
  ['Granite', 'Igneous', 'Magma cooled slowly underground, so it has large crystals.'],
  ['Basalt', 'Igneous', 'Lava cooled quickly on the surface, so it has tiny crystals.'],
  ['Pumice', 'Igneous', 'Frothy lava cooled very fast, trapping gas bubbles. It can float.'],
  ['Obsidian', 'Igneous', 'Lava cooled so fast it formed volcanic glass with no crystals.'],
  ['Sandstone', 'Sedimentary', 'Grains of sand compacted and cemented together.'],
  ['Limestone', 'Sedimentary', 'Made mainly of calcium carbonate from the shells and skeletons of sea creatures.'],
  ['Chalk', 'Sedimentary', 'A soft, white type of limestone made of tiny sea creatures.'],
  ['Clay', 'Sedimentary', 'Made of very fine particles of mud.'],
  ['Shale', 'Sedimentary', 'Mud and clay squashed into thin layers.'],
  ['Marble', 'Metamorphic', 'Limestone or chalk changed by heat and pressure.'],
  ['Slate', 'Metamorphic', 'Shale or mudstone changed by heat and pressure. It splits into thin sheets.'],
  ['Schist', 'Metamorphic', 'Rock changed by strong heat and pressure, with shiny layers.'],
  ['Gneiss', 'Metamorphic', 'Rock changed by very high heat and pressure, with light and dark bands.'],
  ['Quartzite', 'Metamorphic', 'Sandstone changed by heat and pressure.'],
];

function genRockType() {
  const [rock, type, why] = pick(ROCKS);
  return mcq(`What type of rock is <b>${rock.toLowerCase()}</b>?`, type, ['Igneous', 'Sedimentary', 'Metamorphic'].filter((t) => t !== type),
    { why: `${rock} is <b>${type.toLowerCase()}</b>. ${why}` });
}

function genChange() {
  const [from, to] = pick([['Limestone', 'Marble'], ['Chalk', 'Marble'], ['Shale', 'Slate'], ['Mudstone', 'Slate'], ['Sandstone', 'Quartzite']]);
  return mcq(`Heat and pressure change <b>${from.toLowerCase()}</b> into which metamorphic rock?`, to, ['Marble', 'Slate', 'Quartzite', 'Granite', 'Basalt'].filter((r) => r !== to),
    { why: `${from} → <b>${to.toLowerCase()}</b>. Metamorphic rocks are existing rocks changed by heat and pressure, without melting.` });
}

function genWeatheringType() {
  const items = [
    ['Water freezes in a crack, expands and splits the rock', 'Physical'],
    ['Rock in a desert heats up by day and cools at night until the outer layers peel off', 'Physical'],
    ['Rainwater, a weak acid, slowly dissolves limestone', 'Chemical'],
    ['Acid rain eats away at a limestone statue', 'Chemical'],
    ['A tree root grows into a crack and forces it apart', 'Biological'],
    ['Rabbits burrowing break up rock near the surface', 'Biological'],
  ];
  const [what, kind] = pick(items);
  return mcq(`Which type of weathering is this?<br><b>${what}.</b>`, kind, ['Physical', 'Chemical', 'Biological'].filter((k) => k !== kind),
    { why: `${kind} weathering. Physical = broken by forces (like ice or heat). Chemical = changed by a reaction (like acid). Biological = caused by plants or animals.` });
}

export const GEOGRAPHY = {
  id: 'geography', name: 'Geography', sub: 'Rocks · geog.3', icon: '⛰', color: 'var(--geography)',
  units: [
    {
      n: 1, code: 'Rocks', title: 'Rocks',
      lessons: [
        {
          id: 'g1', title: 'The three types of rock',
          keys: [
            'Rocks are made of <b>minerals</b> (granite contains quartz, feldspar and mica).',
            '<b>Igneous</b>: magma or lava cools and hardens into crystals. Slow cooling underground → <b>large crystals</b> (granite). Fast cooling on the surface → <b>small crystals</b> (basalt).',
            '<b>Sedimentary</b>: layers of sediment are <b>compacted and cemented</b> over millions of years. Has layers and may contain <b>fossils</b> (sandstone, limestone, chalk, clay).',
            '<b>Metamorphic</b>: existing rock changed by <b>heat and pressure</b> without melting (limestone → marble, shale → slate).',
          ],
          learn: [
            { title: 'Three types of rock', html: '<table class="mini"><tr><th>Type</th><th>How it forms</th><th>Examples</th></tr><tr><td><b>Igneous</b></td><td>Magma or lava cools and hardens</td><td>Granite, basalt</td></tr><tr><td><b>Sedimentary</b></td><td>Layers of sediment squashed and cemented</td><td>Sandstone, limestone, chalk</td></tr><tr><td><b>Metamorphic</b></td><td>Rock changed by heat and pressure</td><td>Marble, slate</td></tr></table>' },
            { title: 'Crystal size', sim: 'crystals', html: '<p>The slower magma cools, the more time crystals have to grow.</p>' },
            { title: 'Sedimentary layers', steps: ['Rivers carry bits of rock, sand and mud to the sea.', 'They settle in <b>layers</b> on the sea bed. Shells and dead creatures settle too.', 'New layers press down on old ones: <b>compaction</b>.', 'Minerals in the water glue the grains: <b>cementation</b>.', 'After millions of years: <b>sedimentary rock</b>, sometimes with <b>fossils</b>.'], html: '' },
          ],
          practice: [genRockType, genRockType, genRockType, genChange,
            mcqS('Granite has large crystals. Why?', 'The magma cooled slowly underground', ['The lava cooled quickly', 'It was squashed by layers', 'It formed in the sea'], 'Slow cooling gives crystals time to grow.'),
            mcqS('Which type of rock may contain fossils?', 'Sedimentary', ['Igneous', 'Metamorphic', 'All types equally'], 'Dead creatures are buried in the layers of sediment.'),
            tf('Metamorphic rocks form when rock melts completely.', false, 'Metamorphic rocks are changed by heat and pressure WITHOUT melting. Melted rock is magma.'),
            match('Match the rock to how it formed.', [['Basalt', 'Lava cooled quickly'], ['Granite', 'Magma cooled slowly'], ['Sandstone', 'Sand grains cemented'], ['Marble', 'Limestone heated and squashed']], 'Igneous, sedimentary or metamorphic.'),
            genRockType],
        },
        {
          id: 'g2', title: 'The rock cycle',
          keys: [
            'Rocks are always slowly changing from one type to another: the <b>rock cycle</b>.',
            '<b>Weathering and erosion</b> break rock into sediment → <b>transport</b> by rivers, wind and ice → <b>deposition</b> in layers.',
            '<b>Compaction and cementation</b> → sedimentary rock.',
            '<b>Heat and pressure</b> → metamorphic rock. <b>Melting</b> → magma. <b>Cooling</b> → igneous rock.',
            '<b>Uplift</b> pushes rocks back up to the surface, where weathering starts again.',
          ],
          learn: [
            { title: 'Round and round', sim: 'rockcycle', html: '<p>Tap each arrow to see what happens. A full trip round the cycle takes millions of years.</p>' },
            { title: 'What drives it?', html: '<ul class="facts"><li>The <b>Sun</b> drives the weather: rain, ice and wind weather and erode rock.</li><li>The Earth’s <b>internal heat</b> melts rock and pushes it up.</li></ul>' },
          ],
          practice: [
            order('Put these stages in order to make sedimentary rock.', ['Weathering', 'Erosion and transport', 'Deposition', 'Compaction and cementation'], 'Rock is broken up, carried away, dropped in layers, then squashed and glued.'),
            mcqS('What turns magma into igneous rock?', 'Cooling', ['Heat and pressure', 'Compaction', 'Weathering'], 'Magma cools and hardens into igneous rock.'),
            mcqS('What turns rock into metamorphic rock?', 'Heat and pressure', ['Cooling', 'Deposition', 'Erosion'], 'Heat and pressure change rock without melting it.'),
            mcqS('What is deposition?', 'When sediment is dropped and settles in layers', ['When rock melts', 'When rock is pushed up', 'When rock is weathered'], 'Rivers drop sediment when they slow down.'),
            text('What is the name for rocks being pushed back up to the surface?', 'uplift', [], 'Uplift.'),
            tf('A rock can only go round the rock cycle once.', false, 'Rocks go round again and again, over millions of years.'),
            match('Match the process to its result.', [['Melting', 'Magma'], ['Cooling', 'Igneous rock'], ['Heat and pressure', 'Metamorphic rock'], ['Compaction and cementation', 'Sedimentary rock']], 'The main changes in the rock cycle.'),
          ],
        },
        {
          id: 'g3', title: 'Weathering',
          keys: [
            '<b>Weathering</b> = rock breaking down <b>where it is</b>. <b>Erosion</b> = rock being worn away and <b>carried off</b>.',
            '<b>Physical</b>: <b>freeze-thaw</b> — water gets into a crack, freezes, expands by about 9% and widens the crack. Repeated → pieces break off (scree).',
            '<b>Chemical</b>: rainwater is a weak acid. It slowly <b>dissolves limestone</b>. Acid rain makes it faster.',
            '<b>Biological</b>: plant roots grow into cracks; burrowing animals break up rock.',
          ],
          learn: [
            { title: 'Weathering or erosion?', html: '<div class="two-cards"><div class="card-mini"><b>Weathering</b><p>Rock breaks down <b>in place</b>. Nothing moves it.</p></div><div class="card-mini"><b>Erosion</b><p>Rock is worn away and <b>carried off</b> by rivers, sea, ice or wind.</p></div></div>' },
            { title: 'Freeze-thaw', sim: 'freezethaw', html: '<p>Water expands by about 9% when it freezes. Day after day, ice prises the rock apart.</p>' },
            { title: 'Three kinds', html: '<table class="mini"><tr><th>Kind</th><th>How</th></tr><tr><td><b>Physical</b></td><td>Forces break the rock: freeze-thaw, heating and cooling</td></tr><tr><td><b>Chemical</b></td><td>A reaction changes the rock: rainwater dissolves limestone</td></tr><tr><td><b>Biological</b></td><td>Living things: roots and burrowing animals</td></tr></table>' },
          ],
          practice: [genWeatheringType, genWeatheringType, genWeatheringType,
            mcqS('What is the difference between weathering and erosion?', 'Weathering happens in place; erosion carries rock away', ['They mean the same thing', 'Erosion happens in place; weathering carries rock away', 'Weathering only happens in deserts'], 'Weathering breaks rock down where it is. Erosion moves it.'),
            order('Put freeze-thaw weathering in order.', ['Water fills a crack', 'The water freezes and expands', 'The crack gets wider', 'Pieces of rock break off'], 'Repeated many times, this breaks the rock.'),
            tf('Water shrinks when it freezes.', false, 'Water expands by about 9% when it freezes — that’s what breaks the rock.'),
            text('What is the name for the pile of broken rock at the bottom of a slope after freeze-thaw?', 'scree', [], 'Scree.'),
            genWeatheringType],
        },
        {
          id: 'g4', title: 'Limestone landscapes',
          keys: [
            '<b>Limestone</b> is sedimentary, made mainly of <b>calcium carbonate</b> from shells and skeletons of sea creatures.',
            'It has <b>joints</b> (vertical cracks) and <b>bedding planes</b> (horizontal). Water flows down the joints.',
            'Rainwater (a weak acid) dissolves it: <b>chemical weathering</b>.',
            'Features: <b>limestone pavement</b> (<b>clints</b> = blocks, <b>grikes</b> = gaps), <b>swallow holes</b>, <b>caves</b>, <b>stalactites</b> (hang from the ceiling) and <b>stalagmites</b> (grow up from the ground).',
            'UK examples: <b>Malham</b> in the Yorkshire Dales; <b>Cheddar Gorge</b> in Somerset.',
          ],
          learn: [
            { title: 'Above and below ground', sim: 'cave', html: '<p>Water seeps down the joints, dissolving the limestone and carving caves. Drips leave behind tiny amounts of calcite.</p>' },
            { title: 'Remember the difference', html: '<div class="two-cards"><div class="card-mini"><b>Stalac<u>t</u>ite</b><p>Hangs from the <b>top</b> (ceiling).</p></div><div class="card-mini"><b>Stalag<u>m</u>ite</b><p>Grows up from the ground (<b>m</b>ight reach the top!).</p></div></div><p>When they meet, they form a <b>pillar</b>.</p><p class="ex">Limestone pavement: blocks called <b>clints</b> separated by gaps called <b>grikes</b> — e.g. above Malham Cove.</p>' },
          ],
          practice: [
            mcqS('What is limestone mainly made of?', 'Calcium carbonate', ['Quartz', 'Iron', 'Salt'], 'From the shells and skeletons of sea creatures.'),
            mcqS('Why does rainwater dissolve limestone?', 'Rainwater is a weak acid', ['Rain is salty', 'Limestone is soft like clay', 'Rain is hot'], 'Rain absorbs carbon dioxide and becomes weak carbonic acid.'),
            match('Match the feature to its description.', [['Clint', 'A block of limestone pavement'], ['Grike', 'A gap between blocks'], ['Stalactite', 'Hangs from a cave ceiling'], ['Stalagmite', 'Grows up from a cave floor'], ['Swallow hole', 'Where a river disappears underground']], 'Limestone features.'),
            mcqS('Where in the UK is a famous limestone pavement?', 'Malham, Yorkshire Dales', ['The Lake District', 'London', 'The Isle of Wight'], 'Above Malham Cove in the Yorkshire Dales.'),
            tf('Stalactites grow up from the floor of a cave.', false, 'Stalactites hang from the ceiling; stalagmites grow up from the floor.'),
            mcqS('What forms when a stalactite and a stalagmite join?', 'A pillar', ['A grike', 'A swallow hole', 'A clint'], 'They meet and make a column called a pillar.'),
            text('What are the vertical cracks in limestone called?', 'joints', ['joint'], 'Joints. The horizontal ones are bedding planes.'),
          ],
        },
        {
          id: 'g5', title: 'Using rocks and soil',
          keys: [
            'Uses: <b>granite</b> (hard — buildings, kerbs, worktops), <b>slate</b> (splits into thin waterproof sheets — roofs), <b>limestone</b> (building, cement, farming), <b>marble</b> (statues), <b>clay</b> (bricks, pottery).',
            '<b>Quarrying</b> good: jobs, building materials, money for the area. Bad: noise, dust, lorries, scars on the landscape, habitats lost.',
            'Old quarries can become lakes, nature reserves or landfill sites.',
            '<b>Soil</b> = weathered rock + humus (dead plant and animal matter) + air + water + living things. It forms very slowly.',
          ],
          learn: [
            { title: 'Rocks we use', html: '<table class="mini"><tr><th>Rock</th><th>Why it’s useful</th><th>Used for</th></tr><tr><td>Granite</td><td>Very hard, tough</td><td>Buildings, kerbs, worktops</td></tr><tr><td>Slate</td><td>Splits into thin waterproof sheets</td><td>Roofs</td></tr><tr><td>Limestone</td><td>Easy to cut; makes cement</td><td>Buildings, cement, farming</td></tr><tr><td>Marble</td><td>Can be polished</td><td>Statues, decoration</td></tr><tr><td>Clay</td><td>Soft, hardens when baked</td><td>Bricks, pottery</td></tr></table>' },
            { title: 'Quarrying: good or bad?', html: '<div class="two-cards"><div class="card-mini"><b>For</b><p>Jobs · building materials · money for the local area</p></div><div class="card-mini"><b>Against</b><p>Noise and dust · lorries on small roads · ugly scars · wildlife habitats lost</p></div></div>' },
            { title: 'What is soil?', html: '<ul class="facts"><li><b>Mineral particles</b> from weathered rock</li><li><b>Humus</b>: rotted plants and animals — makes soil fertile</li><li><b>Air</b> and <b>water</b> in the gaps</li><li><b>Living things</b> like worms and bacteria</li></ul><p class="ex">Soil forms very slowly. It can take hundreds of years to make 1 cm.</p>' },
          ],
          practice: [
            match('Match the rock to its use.', [['Slate', 'Roofs'], ['Granite', 'Kerbs and worktops'], ['Marble', 'Statues'], ['Clay', 'Bricks'], ['Limestone', 'Cement']], 'Each rock’s properties suit its use.'),
            mcqS('Why is slate good for roofs?', 'It splits into thin, waterproof sheets', ['It is soft and absorbs water', 'It is very heavy', 'It contains fossils'], 'Thin, flat and waterproof.'),
            mcqS('Which is a disadvantage of quarrying?', 'Noise and dust', ['Jobs for local people', 'Building materials', 'Money for the area'], 'The others are advantages.'),
            mcqS('What is humus?', 'Rotted plant and animal matter in soil', ['A type of rock', 'Water in soil', 'A mineral in granite'], 'Humus makes soil fertile.'),
            tf('An old quarry can be turned into a nature reserve.', true, 'Old quarries can become lakes, nature reserves or landfill sites.'),
            text('What hard igneous rock is often used for kerbs and kitchen worktops?', 'granite', [], 'Granite.'),
          ],
        },
      ],
    },
  ],
};

export const _test = { genRockType, genChange, genWeatheringType };
