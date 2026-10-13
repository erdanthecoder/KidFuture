// SCIENCE – YEAR 8 (Exploring Science): 8D Unicellular organisms, 8G Metals and their uses, 8L Earth and space.
// Built from the class revision notes. Every question is hand-checked against them.

import { pick, shuffle, mcq, toDecimal, parseExact } from './engine.js';
import { mcqS } from './content-maths.js';

const tf = (q, answer, why) => ({ type: 'tf', q, answer, why });
const text = (q, answer, accept, why) => ({ type: 'text', q, answer, accept, why });
const match = (q, pairs, why) => () => ({ type: 'match', q, pairs: shuffle(pairs).slice(0, 4), why });
const order = (q, items, why) => ({ type: 'order', q, items, why });

// ---------- generators ----------

function genSAV() {
  const s = pick([1, 2, 3, 4, 5, 6]);
  const sa = 6 * s * s, v = s ** 3;
  return { type: 'num', q: `A cube-shaped cell model has sides of ${s} cm.<br>Surface area = ${sa} cm², volume = ${v} cm³.<br>What is the surface area : volume ratio, as <b>?</b> : 1`,
    answer: toDecimal(parseExact(`${sa}/${v}`)),
    why: `${sa} ÷ ${v} = ${(sa / v).toFixed(2).replace(/\.00$/, '')}, so the ratio is ${(sa / v).toFixed(2).replace(/\.00$/, '')} : 1. Bigger things have a <b>smaller</b> SA : V ratio, so diffusion alone isn’t enough — they need a transport system.` };
}

function genSaltName() {
  const metal = pick(['Magnesium', 'Zinc', 'Iron', 'Calcium']);
  const [acid, ending] = pick([['hydrochloric acid', 'chloride'], ['sulfuric acid', 'sulfate'], ['nitric acid', 'nitrate']]);
  const salt = `${metal.toLowerCase()} ${ending}`;
  const others = ['chloride', 'sulfate', 'nitrate', 'oxide', 'hydroxide'].filter((e) => e !== ending).map((e) => `${metal.toLowerCase()} ${e} + hydrogen`);
  return mcq(`${metal} + ${acid} → ?`, `${salt} + hydrogen`, shuffle(others),
    { why: `metal + acid → salt + hydrogen. Hydrochloric → chloride, sulfuric → sulfate, nitric → nitrate. So: <b>${salt} + hydrogen</b>.` });
}

function genMetalReaction() {
  const metal = pick(['magnesium', 'zinc', 'calcium', 'sodium', 'iron']);
  const kind = pick(['oxygen', 'water']);
  if (kind === 'oxygen' || metal === 'iron' || metal === 'zinc') {
    return mcq(`${metal[0].toUpperCase() + metal.slice(1)} + oxygen → ?`, `${metal} oxide`, [`${metal} hydroxide`, `${metal} oxide + hydrogen`, `${metal} chloride`],
      { why: `metal + oxygen → metal oxide. (Like magnesium + oxygen → magnesium oxide.)` });
  }
  return mcq(`${metal[0].toUpperCase() + metal.slice(1)} + water → ?`, `${metal} hydroxide + hydrogen`, [`${metal} oxide`, `${metal} hydroxide + oxygen`, `${metal} oxide + oxygen`],
    { why: 'metal + water → metal hydroxide + hydrogen.' });
}

const SERIES = ['potassium', 'sodium', 'lithium', 'calcium', 'magnesium', 'aluminium', 'zinc', 'iron', 'tin', 'lead', 'copper', 'silver', 'gold'];
function genReactivity() {
  const picks = shuffle(SERIES.map((m, i) => [m, i])).slice(0, 4);
  const most = Math.random() < 0.5;
  const best = picks.reduce((a, b) => ((most ? b[1] < a[1] : b[1] > a[1]) ? b : a));
  return mcq(`Which of these metals is the <b>${most ? 'most' : 'least'} reactive</b>?`, best[0], picks.filter((p) => p !== best).map((p) => p[0]),
    { why: `Reactivity series (most → least): ${SERIES.join(', ')}. So <b>${best[0]}</b>.` });
}

const FORMULAE = [['MgCl₂', 'Mg : Cl', '1 : 2'], ['Al₂O₃', 'Al : O', '2 : 3'], ['H₂O', 'H : O', '2 : 1'], ['CO₂', 'C : O', '1 : 2'], ['NaCl', 'Na : Cl', '1 : 1'], ['CaCl₂', 'Ca : Cl', '1 : 2'], ['Fe₂O₃', 'Fe : O', '2 : 3'], ['MgO', 'Mg : O', '1 : 1']];
function genRatio() {
  const [f, atoms, ratio] = pick(FORMULAE);
  return mcq(`What is the ratio of atoms ${atoms} in <b>${f}</b>?`, ratio, ['1 : 1', '1 : 2', '2 : 1', '2 : 3', '3 : 2', '1 : 3'].filter((r) => r !== ratio).slice(0, 5),
    { why: `The small number after a symbol tells you how many of that atom. No number means 1. ${f} → ${atoms} = <b>${ratio}</b>.` });
}

function genWeight() {
  const m = pick([1, 2, 3, 4, 5, 10, 20, 35, 50, 60]);
  const [place, g] = pick([['Earth', '10'], ['Earth', '10'], ['the Moon', '1.6']]);
  const W = toDecimal(parseExact(`${m * (g === '10' ? 100 : 16)}/10`));
  if (Math.random() < 0.3) {
    return { type: 'num', q: `An object weighs <b>${W} N</b> on ${place} (g = ${g} N/kg). What is its <b>mass</b> in kg?`, answer: String(m),
      why: `W = m × g, so m = W ÷ g = ${W} ÷ ${g} = <b>${m} kg</b>.` };
  }
  return { type: 'num', q: `What is the weight of a <b>${m} kg</b> mass on ${place}? (g = ${g} N/kg)`, answer: W,
    why: `W = m × g = ${m} × ${g} = <b>${W} N</b>.${place === 'the Moon' ? ' Its mass is still ' + m + ' kg — mass is the same everywhere.' : ''}` };
}

const PROPS = [['being shiny', 'physical'], ['conducting electricity', 'physical'], ['conducting heat', 'physical'], ['being malleable', 'physical'], ['its melting point', 'physical'],
  ['reacting with acid', 'chemical'], ['burning in oxygen', 'chemical'], ['rusting in damp air', 'chemical'], ['reacting with water', 'chemical']];
function genPhysChem() {
  const [prop, kind] = pick(PROPS);
  const asked = pick(['physical', 'chemical']);
  return tf(`For a metal, <b>${prop}</b> is a <b>${asked}</b> property.`, kind === asked,
    `It is a <b>${kind}</b> property. Physical = can be seen without changing the substance. Chemical = how it reacts.`);
}

// ---------- curriculum ----------

export const SCIENCE = {
  id: 'science', name: 'Science', sub: 'Year 8 · Exploring Science', icon: '⚗', color: 'var(--science)',
  units: [
    {
      n: 1, code: '8D', title: 'Unicellular organisms',
      lessons: [
        {
          id: 's8d.1', title: 'Kingdoms, bacteria and viruses',
          keys: [
            '5 kingdoms: <b>animals, plants, fungi, protoctists, prokaryotes</b>. Unicellular = one cell.',
            '<b>Prokaryotes</b> (bacteria) have <b>no nucleus</b> and <b>no mitochondria</b>.',
            'Bacterium: cell wall + slimy capsule (protect it), cell membrane (controls what goes in and out), cytoplasm, circular chromosome + plasmids (genes), flagellum (movement).',
            '<b>Virus</b>: not a cell and not alive. Genes, a protein coat, and an envelope with spikes. Gets inside a cell, makes the cell copy it, then bursts out. Viruses are <b>obligate parasites</b>.',
            'Size: <b>protoctist &gt; bacterium &gt; virus</b>.',
          ],
          learn: [
            { title: 'The five kingdoms', html: '<div class="chips"><span>Animals</span><span>Plants</span><span>Fungi</span><span>Protoctists</span><span>Prokaryotes</span></div><p><b>Unicellular</b> organisms are made of just <b>one cell</b>. There are unicellular fungi (yeast), protoctists (Euglena, Paramecium) and prokaryotes (bacteria).</p>' },
            { title: 'Inside a bacterium', sim: 'bacterium', html: '<p>Tap each part. Remember: bacteria have <b>no nucleus</b> and <b>no mitochondria</b>.</p>' },
            { title: 'How a virus attacks', sim: 'virus', html: '<p>A virus is <b>not a cell</b> and <b>not alive</b>. It can only reproduce inside a living cell — it is an <b>obligate parasite</b>.</p>' },
            { title: 'How big?', sim: 'sizes', html: '<p><b>Protoctist &gt; bacterium &gt; virus</b>. Viruses are so small you need an electron microscope to see them.</p>' },
          ],
          practice: [
            mcqS('Which of these is <b>not</b> one of the 5 kingdoms?', 'Viruses', ['Fungi', 'Protoctists', 'Prokaryotes'], 'The 5 kingdoms are animals, plants, fungi, protoctists and prokaryotes. Viruses are not cells and not alive.'),
            mcqS('Which two things do bacteria <b>not</b> have?', 'A nucleus and mitochondria', ['A cell wall and a membrane', 'Cytoplasm and genes', 'A flagellum and a capsule'], 'Prokaryotes have no nucleus and no mitochondria. Their genes are in a circular chromosome and plasmids.'),
            match('Match each part of a bacterium to its job.', [['Flagellum', 'Movement'], ['Cell membrane', 'Controls what goes in and out'], ['Slimy capsule', 'Protects the cell'], ['Plasmids', 'Extra genes'], ['Circular chromosome', 'Main genes']], 'From the bacterium diagram.'),
            tf('A virus is a living cell.', false, 'A virus is not a cell and not alive. It has genes, a protein coat and an envelope with spikes.'),
            order('Put these in order of size, <b>biggest first</b>.', ['Protoctist', 'Bacterium', 'Virus'], 'Size: protoctist > bacterium > virus.'),
            order('Put the stages of a virus infection in order.', ['The virus gets inside a cell', 'It makes the cell copy the virus', 'New viruses burst out of the cell', 'They infect more cells'], 'The virus uses the cell to make copies of itself.'),
            text('A virus can only reproduce inside a living cell. What kind of parasite is it?', 'obligate', ['obligate parasite', 'an obligate parasite'], 'Viruses are obligate parasites.'),
            mcqS('What does “unicellular” mean?', 'Made of one cell', ['Has no cells', 'Made of many cells', 'Has one nucleus'], 'Uni = one.'),
            tf('Bacteria store their genes in a circular chromosome and plasmids.', true, 'Without a nucleus, their genes are loose in the cytoplasm: a circular chromosome plus small plasmids.'),
          ],
        },
        {
          id: 's8d.2', title: 'Microbes and disease',
          keys: [
            '<b>Pathogen</b> = a microorganism that causes disease.',
            '<b>Vaccine</b> = prevents disease. <b>Antibiotic</b> = kills bacteria.',
            'Antibiotics do <b>NOT</b> work on viruses (e.g. measles).',
            'Fungal disease: <b>athlete’s foot</b>.',
            '<b>Plasmodium</b> (a protoctist) causes <b>malaria</b> and is spread by <b>mosquitoes</b>.',
          ],
          learn: [
            { title: 'Pathogens', html: '<p>A <b>pathogen</b> is a microorganism that causes disease. Different kinds cause different diseases:</p><table class="mini"><tr><th>Type</th><th>Example disease</th></tr><tr><td>Virus</td><td>Measles</td></tr><tr><td>Fungus</td><td>Athlete’s foot</td></tr><tr><td>Protoctist (Plasmodium)</td><td>Malaria — spread by mosquitoes</td></tr></table>' },
            { title: 'Vaccines and antibiotics', html: '<div class="two-cards"><div class="card-mini"><b>Vaccine</b><p>Given <b>before</b> you are ill. <b>Prevents</b> disease.</p></div><div class="card-mini"><b>Antibiotic</b><p><b>Kills bacteria</b>. Does <b>not</b> work on viruses.</p></div></div><p class="warn-box">You can’t treat measles with antibiotics — measles is a virus.</p>' },
          ],
          practice: [
            text('What is the name for a microorganism that causes disease?', 'pathogen', ['a pathogen', 'pathogens'], 'Pathogen = a microorganism that causes disease.'),
            mcqS('Which would <b>prevent</b> someone catching measles?', 'A vaccine', ['An antibiotic', 'A painkiller', 'Fermentation'], 'Vaccines prevent disease. Antibiotics don’t work on viruses like measles.'),
            tf('Antibiotics can cure measles.', false, 'Measles is caused by a virus. Antibiotics only kill bacteria.'),
            mcqS('Athlete’s foot is caused by a…', 'fungus', ['virus', 'bacterium', 'protoctist'], 'Athlete’s foot is a fungal disease.'),
            mcqS('What causes malaria?', 'Plasmodium, a protoctist', ['A virus', 'Yeast', 'Lactobacillus'], 'Plasmodium causes malaria and is spread by mosquitoes.'),
            match('Match each word to its meaning.', [['Pathogen', 'Microorganism that causes disease'], ['Vaccine', 'Prevents disease'], ['Antibiotic', 'Kills bacteria'], ['Mosquito', 'Spreads malaria']], 'Key words from 8D.'),
            mcqS('What spreads malaria?', 'Mosquitoes', ['Flies', 'Dirty water', 'Coughing'], 'Plasmodium is carried by mosquitoes.'),
          ],
        },
        {
          id: 's8d.3', title: 'Diffusion and size',
          keys: [
            '<b>Diffusion</b> = particles spread from where there are <b>more</b> to where there are <b>fewer</b>.',
            'Unicellular organisms get what they need by diffusion through their surface.',
            'Big organisms have a <b>small surface area : volume ratio</b>, so diffusion is too slow — they need a <b>transport system</b>.',
          ],
          learn: [
            { title: 'Diffusion', sim: 'diffusion', html: '<p>Particles move randomly, so overall they spread from where there are more to where there are fewer, until they’re even.</p>' },
            { title: 'Why size matters', html: '<table class="mini"><tr><th>Cube side</th><th>Surface area</th><th>Volume</th><th>SA : V</th></tr><tr><td>1 cm</td><td>6 cm²</td><td>1 cm³</td><td>6 : 1</td></tr><tr><td>2 cm</td><td>24 cm²</td><td>8 cm³</td><td>3 : 1</td></tr><tr><td>3 cm</td><td>54 cm²</td><td>27 cm³</td><td>2 : 1</td></tr></table><p>As things get bigger, the SA : V ratio gets <b>smaller</b>. There isn’t enough surface for diffusion to supply the whole inside, so big organisms need a <b>transport system</b> (like blood).</p>' },
          ],
          practice: [
            mcqS('Diffusion is the movement of particles from…', 'where there are more to where there are fewer', ['where there are fewer to where there are more', 'cold places to hot places', 'inside a cell only'], 'Particles spread out from high to low concentration.'),
            mcqS('Why do large organisms need a transport system?', 'They have a small surface area : volume ratio', ['They have a large surface area : volume ratio', 'They have no cells', 'Diffusion is faster in big organisms'], 'Diffusion alone can’t supply all their cells.'),
            genSAV, genSAV,
            tf('A unicellular organism can get oxygen by diffusion through its surface.', true, 'It’s tiny, so it has a large SA : V ratio and diffusion is enough.'),
            mcqS('Which cube has the <b>largest</b> SA : V ratio?', '1 cm cube', ['2 cm cube', '3 cm cube', '10 cm cube'], 'Smaller things have larger SA : V ratios (1 cm cube: 6 : 1).'),
          ],
        },
        {
          id: 's8d.4', title: 'Yeast, respiration and growth',
          keys: [
            'Yeast is a <b>unicellular fungus</b>.',
            '<b>Aerobic respiration</b>: glucose + oxygen → carbon dioxide + water (releases <b>more</b> energy).',
            '<b>Fermentation</b> (anaerobic): glucose → ethanol + carbon dioxide.',
            'Yeast reproduces <b>asexually</b> by <b>budding</b>, so the new cells are identical.',
            'Growth curve: slow start → fastest growth (steepest part) → no growth (flat, food runs out = <b>limiting factor</b>).',
            'Yoghurt: <b>Lactobacillus</b> bacteria make <b>lactic acid</b> (lactic acid fermentation), which makes milk sour.',
          ],
          learn: [
            { title: 'Two ways yeast respires', html: '<div class="law"><span>glucose + oxygen → carbon dioxide + water</span><small><b>Aerobic</b> respiration — with oxygen, releases more energy</small></div><div class="law"><span>glucose → ethanol + carbon dioxide</span><small><b>Fermentation</b> (anaerobic) — without oxygen</small></div><p class="ex">Bread rises because of the carbon dioxide gas from yeast.</p>' },
            { title: 'Budding', html: '<div class="bud-anim"><span class="yc"></span><span class="yc bud"></span></div><p>Yeast reproduces <b>asexually</b>: a small bud grows out of the cell and breaks off. Only one parent, so the new cell is <b>identical</b>.</p>' },
            { title: 'Growth curve', sim: 'growth', html: '<p>Drag the slider to see each part of the curve.</p>' },
            { title: 'Making yoghurt', steps: ['Add <b>Lactobacillus</b> bacteria to milk and keep it warm.', 'The bacteria carry out <b>lactic acid fermentation</b>.', 'The <b>lactic acid</b> makes the milk sour and thick → yoghurt.'], html: '' },
          ],
          practice: [
            mcqS('What is the word equation for fermentation in yeast?', 'glucose → ethanol + carbon dioxide', ['glucose + oxygen → carbon dioxide + water', 'carbon dioxide + water → glucose + oxygen', 'glucose → lactic acid'], 'Fermentation is anaerobic: no oxygen. It makes ethanol and carbon dioxide.'),
            mcqS('Which releases more energy?', 'Aerobic respiration', ['Fermentation', 'They release the same', 'Neither releases energy'], 'Aerobic respiration (with oxygen) releases more energy.'),
            tf('Yeast cells made by budding are identical to the parent.', true, 'Budding is asexual reproduction, so the new cells are identical.'),
            mcqS('On a yeast growth curve, where is the growth fastest?', 'The steepest part', ['The flat part at the end', 'The very start', 'Where the line goes down'], 'Steepest = fastest growth.'),
            mcqS('Why does the growth curve go flat at the end?', 'The food runs out — it is a limiting factor', ['The yeast becomes bacteria', 'Too much oxygen', 'The yeast stops budding for no reason'], 'When food runs out, there’s no more growth.'),
            mcqS('Which organism is used to make yoghurt?', 'Lactobacillus', ['Yeast', 'Plasmodium', 'Euglena'], 'Lactobacillus bacteria make lactic acid.'),
            text('Which acid makes milk sour when yoghurt is made?', 'lactic acid', ['lactic'], 'Lactobacillus makes lactic acid.'),
            mcqS('What type of organism is yeast?', 'A unicellular fungus', ['A bacterium', 'A virus', 'A protoctist'], 'Yeast is a unicellular fungus.'),
            order('Put the parts of the growth curve in order.', ['Slow start', 'Fastest growth (steepest)', 'No growth (flat — food runs out)'], 'From the 8D growth curve.'),
          ],
        },
        {
          id: 's8d.5', title: 'Protoctists, photosynthesis and ecosystems',
          keys: [
            '<b>Protoctists</b>: unicellular with a nucleus. <b>Euglena</b> has chloroplasts (an alga). <b>Paramecium</b> moves with cilia.',
            '<b>Photosynthesis</b>: carbon dioxide + water → glucose + oxygen (needs light; chlorophyll absorbs the light).',
            '<b>Pyramid of biomass</b>: biomass gets smaller at each level, because energy is lost.',
            '<b>Decomposer</b> = an organism that breaks down dead tissue using enzymes.',
            '<b>Carbon cycle</b>: photosynthesis removes CO₂; respiration, combustion and decay add CO₂. CO₂ has risen because we burn fossil fuels.',
          ],
          learn: [
            { title: 'Protoctists', html: '<table class="mini"><tr><th>Protoctist</th><th>Key fact</th></tr><tr><td>Euglena</td><td>Has chloroplasts — it’s an alga and can photosynthesise</td></tr><tr><td>Paramecium</td><td>Moves using tiny hairs called cilia</td></tr><tr><td>Plasmodium</td><td>Causes malaria, spread by mosquitoes</td></tr></table><p>Unlike bacteria, protoctists <b>have a nucleus</b>.</p>' },
            { title: 'Photosynthesis', sim: 'leaf', html: '<p class="big-formula small">carbon dioxide + water <span class="arrow">→<small>light</small></span> glucose + oxygen</p><p><b>Chlorophyll</b> absorbs the light.</p>' },
            { title: 'Pyramid of biomass', sim: 'pyramid', html: '<p>Biomass gets smaller at each level, because energy is lost at each step (in movement, heat, waste).</p>' },
            { title: 'The carbon cycle', sim: 'carbon', html: '<p>Tap an arrow. <b>Decomposers</b> break down dead tissue using enzymes, and release CO₂.</p>' },
          ],
          practice: [
            mcqS('Which protoctist has chloroplasts?', 'Euglena', ['Paramecium', 'Plasmodium', 'Lactobacillus'], 'Euglena has chloroplasts — it is an alga.'),
            mcqS('How does Paramecium move?', 'With cilia', ['With a flagellum only', 'It can’t move', 'By budding'], 'Paramecium moves with cilia (tiny hairs).'),
            mcqS('What is the word equation for photosynthesis?', 'carbon dioxide + water → glucose + oxygen', ['glucose + oxygen → carbon dioxide + water', 'glucose → ethanol + carbon dioxide', 'oxygen + water → glucose'], 'Photosynthesis needs light; chlorophyll absorbs the light.'),
            mcqS('Why does biomass get smaller at each level of a pyramid?', 'Energy is lost at each level', ['Animals eat too much', 'Plants are smaller', 'Decomposers take it all'], 'Energy is lost at each step, so less biomass can be supported.'),
            text('What is the name for an organism that breaks down dead tissue using enzymes?', 'decomposer', ['decomposers', 'a decomposer'], 'Decomposer.'),
            match('Match each carbon cycle process to what happens.', [['Photosynthesis', 'Plants take CO₂ out of the air'], ['Respiration', 'Living things release CO₂'], ['Combustion', 'Burning fuels releases CO₂'], ['Decay', 'Decomposers release CO₂']], 'Photosynthesis removes CO₂; respiration, combustion and decay add it.'),
            mcqS('Why has the amount of CO₂ in the air risen?', 'We burn fossil fuels', ['More photosynthesis', 'Fewer volcanoes', 'Decomposers have stopped'], 'Burning fossil fuels (combustion) adds CO₂.'),
            tf('Protoctists have a nucleus.', true, 'Protoctists are unicellular with a nucleus (unlike prokaryotes).'),
            text('Which green substance absorbs light for photosynthesis?', 'chlorophyll', ['chlorophyl'], 'Chlorophyll absorbs the light.'),
          ],
        },
      ],
    },
    {
      n: 2, code: '8G', title: 'Metals and their uses',
      lessons: [
        {
          id: 's8g.1', title: 'Properties of metals',
          keys: [
            'Metals are <b>shiny</b>, <b>good conductors</b> of heat and electricity, <b>malleable</b>, <b>ductile</b> and <b>strong</b>.',
            '<b>Malleable</b> = can be hammered into shape. <b>Ductile</b> = can be pulled into wires.',
            '<b>Physical property</b> = can be seen without changing the substance (e.g. shiny).',
            '<b>Chemical property</b> = how it reacts (e.g. reacts with acid).',
          ],
          learn: [
            { title: 'What makes a metal a metal?', html: '<div class="chips"><span>✨ Shiny</span><span>⚡ Conducts electricity</span><span>🔥 Conducts heat</span><span>🔨 Malleable</span><span>🧵 Ductile</span><span>💪 Strong</span></div><p class="ex">Copper is used for wires: it’s ductile and a great conductor of electricity.</p>' },
            { title: 'Physical or chemical?', html: '<div class="two-cards"><div class="card-mini"><b>Physical property</b><p>You can see or measure it <b>without changing</b> the substance: shiny, conducts, melting point.</p></div><div class="card-mini"><b>Chemical property</b><p><b>How it reacts</b>: reacts with oxygen, rusts, fizzes in acid.</p></div></div>' },
          ],
          practice: [
            mcqS('What does <b>ductile</b> mean?', 'Can be pulled into wires', ['Can be hammered into shape', 'Is shiny', 'Conducts heat'], 'Ductile = pulled into wires. Malleable = hammered into shape.'),
            mcqS('What does <b>malleable</b> mean?', 'Can be hammered into shape', ['Can be pulled into wires', 'Is magnetic', 'Doesn’t react'], 'Malleable = can be hammered or bent into shape.'),
            mcqS('Which is a <b>chemical</b> property of iron?', 'It rusts in damp air', ['It is shiny', 'It conducts heat', 'It is strong'], 'Rusting is a reaction, so it’s a chemical property.'),
            genPhysChem, genPhysChem,
            tf('Metals are good conductors of both heat and electricity.', true, 'From the list of metal properties.'),
            mcqS('Why is copper used for electrical wires?', 'It is ductile and a good conductor of electricity', ['It is the most reactive metal', 'It rusts easily', 'It is a poor conductor'], 'Wires need to conduct and be pulled thin.'),
          ],
        },
        {
          id: 's8g.2', title: 'Reactions of metals',
          keys: [
            'metal + oxygen → metal oxide (magnesium + oxygen → magnesium oxide)',
            'metal + water → metal hydroxide + hydrogen',
            'metal + acid → salt + hydrogen. Hydrochloric → <b>chloride</b>, sulfuric → <b>sulfate</b>, nitric → <b>nitrate</b>',
            'Test for hydrogen: a lit splint gives a <b>squeaky pop</b>. <b>Effervescence</b> = bubbles.',
          ],
          learn: [
            { title: 'Three reactions to learn', html: '<div class="law"><span>metal + oxygen → metal oxide</span><small>magnesium + oxygen → magnesium oxide</small></div><div class="law"><span>metal + water → metal hydroxide + hydrogen</span><small>calcium + water → calcium hydroxide + hydrogen</small></div><div class="law"><span>metal + acid → salt + hydrogen</span><small>zinc + hydrochloric acid → zinc chloride + hydrogen</small></div>' },
            { title: 'Metals in acid', sim: 'reactivity', html: '<p>Watch the <b>effervescence</b> (bubbles of hydrogen). More reactive metals fizz faster.</p>' },
            { title: 'Naming salts', html: '<table class="mini"><tr><th>Acid</th><th>Salt ends in</th></tr><tr><td>Hydrochloric</td><td>chloride</td></tr><tr><td>Sulfuric</td><td>sulfate</td></tr><tr><td>Nitric</td><td>nitrate</td></tr></table><p>Test for hydrogen: hold a <b>lit splint</b> at the mouth of the tube → <b>squeaky pop</b>.</p>' },
          ],
          practice: [genSaltName, genMetalReaction, genSaltName, genMetalReaction,
            mcqS('What is the test for hydrogen?', 'A lit splint gives a squeaky pop', ['A glowing splint relights', 'Limewater turns milky', 'Litmus turns red'], 'Hydrogen burns with a squeaky pop.'),
            text('What is the word for the bubbles given off in a reaction?', 'effervescence', ['effervesence', 'fizzing'], 'Effervescence = bubbles.'),
            genSaltName],
        },
        {
          id: 's8g.3', title: 'The reactivity series and catalysts',
          keys: [
            'Reactivity series (most → least): <b>potassium, sodium, lithium, calcium, magnesium, aluminium, zinc, iron, tin, lead, copper</b> (silver, gold).',
            'More reactive metals react faster and more violently.',
            '<b>Catalyst</b>: speeds up a reaction and is <b>not used up</b>.',
          ],
          learn: [
            { title: 'The reactivity series', sim: 'series', html: '<p>Tap “Shuffle” and put them back in order — or just study the ladder.</p>' },
            { title: 'Catalysts', html: '<p>A <b>catalyst</b> speeds up a reaction and is <b>not used up</b> — you get it all back at the end, so it can be used again.</p>' },
          ],
          practice: [genReactivity, genReactivity,
            order('Put these metals in order of reactivity, <b>most reactive first</b>.', ['Potassium', 'Magnesium', 'Zinc', 'Iron', 'Copper'], 'K, Na, Li, Ca, Mg, Al, Zn, Fe, Sn, Pb, Cu, (Ag, Au).'),
            mcqS('What does a catalyst do?', 'Speeds up a reaction and is not used up', ['Slows down a reaction', 'Gets used up in the reaction', 'Is always a gas'], 'A catalyst speeds up a reaction and is not used up.'),
            tf('Gold is near the bottom of the reactivity series.', true, 'Gold and silver are at the very bottom — that’s why gold stays shiny.'),
            genReactivity,
            order('Put these in order of reactivity, <b>most reactive first</b>.', ['Sodium', 'Calcium', 'Aluminium', 'Tin', 'Silver'], 'From the reactivity series.'),
            genReactivity],
        },
        {
          id: 's8g.4', title: 'Rusting',
          keys: [
            '<b>iron + water + oxygen → rust</b>. Rusting needs <b>BOTH</b> water and oxygen.',
            'Prevent it by <b>painting</b>, <b>oiling</b>, <b>galvanising</b> (zinc coating) or a <b>plastic coat</b>.',
            'These all work by keeping water and oxygen away from the iron.',
            'Air is about <b>20% oxygen</b>.',
          ],
          learn: [
            { title: 'The rusting experiment', sim: 'rusting', html: '<p>Three nails, three conditions. Only one rusts.</p>' },
            { title: 'Stopping rust', html: '<div class="chips"><span>🎨 Painting — car bodies</span><span>🛢 Oiling — bike chains</span><span>⚙ Galvanising — zinc coating on buckets, fences</span><span>🧴 Plastic coat — garden wire</span></div><p>They all put a barrier between the iron and the <b>water and oxygen</b>.</p>' },
          ],
          practice: [
            mcqS('What does iron need in order to rust?', 'Both water and oxygen', ['Only water', 'Only oxygen', 'Only salt'], 'Rusting needs BOTH water and oxygen.'),
            mcqS('What is galvanising?', 'Coating iron with zinc', ['Painting iron', 'Oiling iron', 'Heating iron'], 'Galvanising = a zinc coating.'),
            tf('A nail in dry air (no water) will rust.', false, 'Rusting needs both water and oxygen.'),
            tf('A nail in boiled water with a layer of oil on top will not rust.', true, 'Boiling removes the air from the water and the oil stops air getting back in — no oxygen.'),
            match('Match the object to the best way to stop it rusting.', [['Bicycle chain', 'Oiling'], ['Car body', 'Painting'], ['Steel bucket', 'Galvanising'], ['Garden wire', 'Plastic coat']], 'Each keeps water and oxygen away.'),
            mcqS('About how much of the air is oxygen?', '20%', ['80%', '50%', '1%'], 'Air is about 20% oxygen (most of the rest is nitrogen).'),
            text('Complete: iron + water + oxygen → ______', 'rust', ['hydrated iron oxide', 'iron oxide'], 'iron + water + oxygen → rust.'),
          ],
        },
        {
          id: 's8g.5', title: 'Making salts and alloys',
          keys: [
            'Making a salt: add metal to acid until it stops reacting → <b>filter</b> → <b>evaporate</b> → crystals.',
            '<b>Alloy</b> = a mixture of a metal with other elements. Different-sized atoms stop the layers sliding, so alloys are <b>harder</b>.',
            'Bronze = copper + tin; brass = copper + zinc; steel = iron + carbon; stainless steel = iron + chromium + carbon (does not corrode).',
            'Pure substances melt at <b>one fixed temperature</b>; alloys melt over a <b>range</b>.',
          ],
          learn: [
            { title: 'Making a salt', steps: ['Add the metal to the acid until it <b>stops reacting</b> (no more bubbles — some metal is left over).', '<b>Filter</b> to remove the leftover metal.', '<b>Evaporate</b> some of the water.', 'Leave it to form <b>crystals</b> of the salt.'], html: '' },
            { title: 'Why alloys are harder', sim: 'alloy', html: '<p>Push the layers. In a pure metal they slide easily. In an alloy, different-sized atoms get in the way.</p>' },
            { title: 'Alloys to know', html: '<table class="mini"><tr><th>Alloy</th><th>Made of</th></tr><tr><td>Bronze</td><td>copper + tin</td></tr><tr><td>Brass</td><td>copper + zinc</td></tr><tr><td>Steel</td><td>iron + carbon</td></tr><tr><td>Stainless steel</td><td>iron + chromium + carbon — does not corrode</td></tr></table>' },
          ],
          practice: [
            order('Put the steps for making a salt in order.', ['Add metal to acid until it stops reacting', 'Filter', 'Evaporate', 'Crystals form'], 'Add excess metal → filter → evaporate → crystals.'),
            match('Match each alloy to what it is made of.', [['Bronze', 'Copper + tin'], ['Brass', 'Copper + zinc'], ['Steel', 'Iron + carbon'], ['Stainless steel', 'Iron + chromium + carbon']], 'From the 8G notes.'),
            mcqS('Why are alloys harder than pure metals?', 'Different-sized atoms stop the layers sliding', ['They have no atoms', 'They are always hotter', 'All their atoms are the same size'], 'The different-sized atoms disrupt the layers.'),
            mcqS('Which alloy does <b>not</b> corrode?', 'Stainless steel', ['Steel', 'Iron', 'Bronze'], 'Stainless steel (iron + chromium + carbon) does not corrode.'),
            tf('An alloy melts at one fixed temperature.', false, 'Pure substances melt at one fixed temperature; alloys melt over a range.'),
            mcqS('Why do you filter when making a salt?', 'To remove the leftover metal', ['To remove the salt', 'To add more acid', 'To make crystals form'], 'Excess metal is filtered off, leaving the salt solution.'),
            text('What is the name for a mixture of a metal with other elements?', 'alloy', ['an alloy', 'alloys'], 'Alloy.'),
          ],
        },
        {
          id: 's8g.6', title: 'Formulae and working scientifically',
          keys: [
            'Ratio of atoms from a formula: MgCl₂ = 1 : 2; Al₂O₃ = 2 : 3.',
            '<b>Accurate</b> = close to the real value.',
            '<b>Anomalous</b> = does not fit the pattern.',
            '<b>Repeatable</b> = the same person gets similar results. <b>Reproducible</b> = other people get similar results.',
          ],
          learn: [
            { title: 'Reading formulae', html: '<p>The small number after a symbol tells you how many of that atom. No number means 1.</p><p class="ex">MgCl₂ → 1 Mg : 2 Cl = <b>1 : 2</b></p><p class="ex">Al₂O₃ → 2 Al : 3 O = <b>2 : 3</b></p>' },
            { title: 'Key words', html: '<table class="mini"><tr><td><b>Accurate</b></td><td>close to the real value</td></tr><tr><td><b>Anomalous</b></td><td>doesn’t fit the pattern</td></tr><tr><td><b>Repeatable</b></td><td>the <b>same person</b> gets similar results</td></tr><tr><td><b>Reproducible</b></td><td><b>other people</b> get similar results</td></tr></table>' },
          ],
          practice: [genRatio, genRatio, genRatio,
            match('Match the word to its meaning.', [['Accurate', 'Close to the real value'], ['Anomalous', 'Does not fit the pattern'], ['Repeatable', 'Same person gets similar results'], ['Reproducible', 'Other people get similar results']], 'Working scientifically words.'),
            mcqS('Another class does your experiment and gets similar results. Your results are…', 'reproducible', ['repeatable', 'anomalous', 'accurate'], 'Reproducible = other people get similar results.'),
            mcqS('One result is far away from all the others. It is…', 'anomalous', ['accurate', 'reproducible', 'repeatable'], 'Anomalous = does not fit the pattern.'),
            genRatio],
        },
      ],
    },
    {
      n: 3, code: '8L', title: 'Earth and space',
      lessons: [
        {
          id: 's8l.1', title: 'Day, night and the seasons',
          keys: [
            '<b>Day and night</b>: the Earth spins on its axis once every <b>24 hours</b>.',
            '<b>Seasons</b>: the Earth’s axis is <b>tilted</b>. Summer = tilted <b>towards</b> the Sun: longer days, Sun higher, rays more concentrated.',
            'Seasons are <b>NOT</b> because the Earth is closer to the Sun.',
            'Hotter at the <b>Equator</b>: the Sun’s rays hit it straight on, so the energy is concentrated on a small area.',
          ],
          learn: [
            { title: 'Day and night', sim: 'daynight', html: '<p>The Earth spins on its axis once every 24 hours. The half facing the Sun has day.</p>' },
            { title: 'The seasons', sim: 'seasons', html: '<p>Move the Earth around its orbit. The axis always points the same way, so each hemisphere takes turns tilting towards the Sun.</p>' },
            { title: 'Why the Equator is hotter', html: '<div class="rays-demo"><div><span class="beam straight"></span><small>Equator: straight on → small area → concentrated</small></div><div><span class="beam slanted"></span><small>Near the poles: slanted → spread over a big area</small></div></div>' },
          ],
          practice: [
            mcqS('What causes day and night?', 'The Earth spinning on its axis', ['The Earth orbiting the Sun', 'The Moon blocking the Sun', 'The Sun moving round the Earth'], 'The Earth spins once every 24 hours.'),
            mcqS('What causes the seasons?', 'The tilt of the Earth’s axis', ['The Earth getting closer to the Sun', 'The Moon’s phases', 'Clouds'], 'Seasons are caused by the tilt, NOT the distance from the Sun.'),
            tf('It is summer when the Earth is closer to the Sun.', false, 'Seasons are NOT because the Earth is closer to the Sun. They are caused by the tilt.'),
            mcqS('In summer, which is true?', 'Days are longer and the Sun is higher', ['Days are shorter', 'The Sun is lower in the sky', 'The Earth spins faster'], 'Tilted towards the Sun: longer days, Sun higher, rays more concentrated.'),
            mcqS('Why is it hotter at the Equator?', 'The Sun’s rays hit it straight on, so energy is concentrated on a small area', ['It is closer to the Sun', 'It has more air', 'It spins faster'], 'Straight-on rays concentrate the energy.'),
            text('How many hours does the Earth take to spin once on its axis?', '24', ['24 hours', 'twenty four'], 'Once every 24 hours.'),
          ],
        },
        {
          id: 's8l.2', title: 'The Solar System and its models',
          keys: [
            '<b>Star</b> = a ball of hot gas. <b>Planet</b> = large and round, orbits the Sun. <b>Moon</b> = orbits a planet. <b>Asteroid</b> = small and rocky, orbits the Sun.',
            'Models: <b>Ptolemy</b> = Earth at the centre. <b>Copernicus</b> = Sun at the centre, circular orbits. <b>Modern (Kepler)</b> = Sun at the centre, elliptical orbits.',
            'We see the Moon and planets because they <b>reflect sunlight</b>.',
            'The Moon’s changing shapes = <b>phases</b>.',
          ],
          learn: [
            { title: 'What’s what', html: '<table class="mini"><tr><td>⭐ Star</td><td>a ball of hot gas</td></tr><tr><td>🪐 Planet</td><td>large and round, orbits the Sun</td></tr><tr><td>🌙 Moon</td><td>orbits a planet</td></tr><tr><td>🪨 Asteroid</td><td>small and rocky, orbits the Sun</td></tr></table>' },
            { title: 'Changing models', sim: 'models', html: '<p>Scientists changed the model as they got better evidence.</p>' },
            { title: 'Phases of the Moon', sim: 'phases', html: '<p>The Moon doesn’t make light — it <b>reflects sunlight</b>. As it orbits, we see different amounts of its lit half.</p>' },
          ],
          practice: [
            match('Match each object to its description.', [['Star', 'A ball of hot gas'], ['Planet', 'Large and round, orbits the Sun'], ['Moon', 'Orbits a planet'], ['Asteroid', 'Small and rocky, orbits the Sun']], 'From the 8L notes.'),
            match('Match the scientist to the model.', [['Ptolemy', 'Earth at the centre'], ['Copernicus', 'Sun at the centre, circular orbits'], ['Kepler', 'Sun at the centre, elliptical orbits']], 'Models changed as evidence improved.'),
            mcqS('Why can we see the Moon?', 'It reflects sunlight', ['It makes its own light', 'It is a star', 'It is very hot'], 'The Moon and planets reflect sunlight.'),
            mcqS('What are the Moon’s changing shapes called?', 'Phases', ['Seasons', 'Eclipses', 'Orbits'], 'The Moon’s changing shapes are phases.'),
            mcqS('In the modern model, what shape are the planets’ orbits?', 'Elliptical', ['Circular', 'Square', 'They don’t orbit'], 'Kepler: Sun at the centre, elliptical orbits.'),
            order('Put the models in the order they were suggested.', ['Ptolemy: Earth at the centre', 'Copernicus: Sun at the centre, circles', 'Kepler: Sun at the centre, ellipses'], 'Each model improved on the last.'),
            tf('A planet makes its own light.', false, 'Planets reflect sunlight. Stars make their own light.'),
          ],
        },
        {
          id: 's8l.3', title: 'Magnets and compasses',
          keys: [
            '<b>Like poles repel</b>, <b>unlike poles attract</b>.',
            'The field is <b>strongest near the poles</b> and goes from <b>N to S</b>.',
            'Find the field’s shape with <b>iron filings</b> or a small <b>compass</b>.',
            'A compass is a small magnet that lines up with the Earth’s magnetic field (there is no real magnet inside the Earth).',
          ],
          learn: [
            { title: 'Magnetic fields', sim: 'magnet', html: '<p>Flip a magnet to see like poles repel and unlike poles attract. Field lines go from N to S and are closest together (strongest) at the poles.</p>' },
            { title: 'Compasses', html: '<p>A compass needle is a small magnet. It lines up with the Earth’s magnetic field, so it points north.</p><p class="ex">The Earth behaves as if it had a giant bar magnet inside — but there is no real magnet in there.</p>' },
          ],
          practice: [
            mcqS('Two north poles are pushed together. What happens?', 'They repel', ['They attract', 'Nothing', 'They stick together'], 'Like poles repel.'),
            mcqS('A north pole and a south pole are put near each other. They…', 'attract', ['repel', 'do nothing', 'swap'], 'Unlike poles attract.'),
            mcqS('Where is a bar magnet’s field strongest?', 'Near the poles', ['In the middle', 'Far away from it', 'It is the same everywhere'], 'The field lines are closest together at the poles.'),
            mcqS('Which direction do magnetic field lines go?', 'From N to S', ['From S to N', 'Round in circles in the middle', 'Straight up'], 'The field goes from N to S.'),
            mcqS('Which could you use to find the shape of a magnetic field?', 'Iron filings', ['Copper wire', 'Water', 'A thermometer'], 'Iron filings or a small compass.'),
            tf('There is a real giant bar magnet inside the Earth.', false, 'The Earth has a magnetic field, but there is no real magnet inside it.'),
            text('What is the name of the small magnet that lines up with the Earth’s magnetic field?', 'compass', ['a compass', 'compass needle'], 'A compass.'),
          ],
        },
        {
          id: 's8l.4', title: 'Mass, weight and gravity',
          keys: [
            '<b>Mass</b> = amount of matter (kg), the same everywhere. <b>Weight</b> = force of gravity (N).',
            '<b>W = m × g</b>. Earth g = 10 N/kg. 2 kg on Earth = 20 N; on the Moon (g = 1.6) = 3.2 N.',
            'Everything with mass has gravity. <b>More mass</b> or <b>closer</b> = stronger.',
            'The Sun’s gravity keeps the Earth in orbit. On top of Everest you weigh slightly less.',
            'Satellites: natural (the Moon) or artificial (communications, weather, GPS).',
          ],
          learn: [
            { title: 'Mass vs weight', sim: 'weight', html: '<p>Your <b>mass</b> stays the same everywhere. Your <b>weight</b> depends on the gravity where you are.</p>' },
            { title: 'Gravity', html: '<ul class="facts"><li>Everything with mass has gravity.</li><li><b>More mass</b> = stronger gravity (the Sun’s is enormous).</li><li><b>Closer</b> = stronger. On top of Everest you’re a bit further from Earth’s centre, so you weigh slightly less.</li><li>The Sun’s gravity keeps the Earth in orbit.</li></ul>' },
            { title: 'Satellites', html: '<div class="two-cards"><div class="card-mini"><b>Natural</b><p>The Moon</p></div><div class="card-mini"><b>Artificial</b><p>Communications, weather, GPS</p></div></div>' },
          ],
          practice: [genWeight, genWeight, genWeight,
            mcqS('What is the unit of weight?', 'Newtons (N)', ['Kilograms (kg)', 'N/kg', 'Metres'], 'Weight is a force, so it’s measured in newtons.'),
            tf('Your mass is smaller on the Moon.', false, 'Mass is the same everywhere. Your weight is smaller on the Moon.'),
            mcqS('What keeps the Earth in orbit around the Sun?', 'The Sun’s gravity', ['The Moon’s gravity', 'Magnetism', 'Air'], 'The Sun’s gravity keeps the Earth in orbit.'),
            mcqS('Which of these is an <b>artificial</b> satellite?', 'A GPS satellite', ['The Moon', 'The Sun', 'An asteroid'], 'Artificial satellites: communications, weather, GPS.'),
            mcqS('On top of Mount Everest, you weigh…', 'slightly less', ['slightly more', 'exactly the same', 'nothing'], 'You’re further from the Earth’s centre, so gravity is slightly weaker.'),
            genWeight],
        },
        {
          id: 's8l.5', title: 'Stars, galaxies and the Universe',
          keys: [
            'Size order: <b>moon &lt; planet &lt; star &lt; galaxy &lt; Universe</b>.',
            'The Sun looks brightest because it is the <b>closest star</b>.',
            'We can’t see stars by day because the Sun is too bright.',
            '<b>Light year</b> = the <b>DISTANCE</b> light travels in one year.',
            '<b>Milky Way</b> = our galaxy. We can’t see its shape because we are inside it.',
          ],
          learn: [
            { title: 'From small to huge', sim: 'scale', html: '<p>Tap to zoom out.</p>' },
            { title: 'Facts to remember', html: '<ul class="facts"><li>The Sun is a star — it looks brightest because it’s the <b>closest</b> star to us.</li><li>Stars are still there in the daytime — the Sun is just too bright for us to see them.</li><li>A <b>light year</b> is a <b>distance</b> (how far light travels in one year), not a time!</li><li>Our galaxy is the <b>Milky Way</b>. We can’t see its shape because we are inside it.</li></ul>' },
          ],
          practice: [
            order('Put these in order of size, <b>smallest first</b>.', ['Moon', 'Planet', 'Star', 'Galaxy', 'Universe'], 'moon < planet < star < galaxy < Universe.'),
            mcqS('A light year is a measure of…', 'distance', ['time', 'brightness', 'speed'], 'The distance light travels in one year.'),
            mcqS('Why does the Sun look so much brighter than other stars?', 'It is the closest star', ['It is the biggest star', 'It is the only real star', 'It is a planet'], 'It looks brightest because it is the closest.'),
            mcqS('Why can’t we see stars in the daytime?', 'The Sun is too bright', ['They disappear', 'They are behind the Moon', 'They only shine at night'], 'The stars are there; the Sun outshines them.'),
            text('What is the name of our galaxy?', 'Milky Way', ['the milky way'], 'The Milky Way.'),
            mcqS('Why can’t we see the shape of the Milky Way?', 'We are inside it', ['It has no shape', 'It is too small', 'It is behind the Sun'], 'We can’t see its shape because we are inside it.'),
          ],
        },
      ],
    },
  ],
};

export const _test = { genPhysChem, genSAV, genSaltName, genMetalReaction, genReactivity, genRatio, genWeight };
