// HISTORY – 1901 TO TODAY. Standard Key Stage 3 content. Every date in EVENTS is checked;
// generated questions only ever use these.

import { pick, shuffle, mcq } from './engine.js';
import { mcqS } from './content-maths.js';

const tf = (q, answer, why) => ({ type: 'tf', q, answer, why });
const text = (q, answer, accept, why) => ({ type: 'text', q, answer, accept, why });
const match = (q, pairs, why) => () => ({ type: 'match', q, pairs: shuffle(pairs).slice(0, 4), why });
const order = (q, items, why) => ({ type: 'order', q, items, why });

// [year, event, lesson]
export const EVENTS = [
  [1903, 'Emmeline Pankhurst founds the suffragettes (WSPU)', 'h1'],
  [1913, 'Emily Wilding Davison dies at the Epsom Derby', 'h1'],
  [1914, 'Archduke Franz Ferdinand is assassinated and the First World War begins', 'h2'],
  [1916, 'The Battle of the Somme', 'h2'],
  [1917, 'The Russian Revolution', 'h3'],
  [1918, 'The First World War ends (11 November)', 'h2'],
  [1918, 'Some women over 30 get the vote', 'h1'],
  [1919, 'The Treaty of Versailles', 'h2'],
  [1928, 'Women get the vote on the same terms as men (age 21)', 'h1'],
  [1929, 'The Wall Street Crash', 'h3'],
  [1933, 'Hitler becomes Chancellor of Germany', 'h3'],
  [1938, 'Kristallnacht, the “Night of Broken Glass”', 'h5'],
  [1939, 'Germany invades Poland and the Second World War begins', 'h4'],
  [1940, 'Dunkirk evacuation and the Battle of Britain', 'h4'],
  [1941, 'Japan attacks Pearl Harbor and the USA joins the war', 'h4'],
  [1944, 'D-Day: the Allied landings in Normandy', 'h4'],
  [1945, 'The Second World War ends', 'h4'],
  [1945, 'Auschwitz is liberated', 'h5'],
  [1947, 'India and Pakistan become independent', 'h6'],
  [1948, 'The NHS is founded', 'h6'],
  [1948, 'The Empire Windrush arrives from the Caribbean', 'h6'],
  [1955, 'Rosa Parks refuses to give up her bus seat', 'h7'],
  [1961, 'The Berlin Wall is built', 'h7'],
  [1962, 'The Cuban Missile Crisis', 'h7'],
  [1963, 'Martin Luther King gives his “I have a dream” speech', 'h7'],
  [1969, 'Humans land on the Moon', 'h7'],
  [1989, 'The Berlin Wall falls', 'h7'],
  [1991, 'The Soviet Union (USSR) collapses', 'h7'],
];

function genYear(lesson) {
  return () => {
    const pool = lesson ? EVENTS.filter((e) => e[2] === lesson) : EVENTS;
    const [year, ev] = pick(pool);
    return { type: 'num', q: `In what year?<br><b>${ev}</b>`, answer: String(year), why: `<b>${year}</b>: ${ev}.` };
  };
}

function genOrder(lesson) {
  return () => {
    const pool = shuffle(lesson ? EVENTS.filter((e) => lesson.includes(e[2])) : EVENTS);
    const picked = [];
    for (const e of pool) { if (!picked.some((p) => p[0] === e[0])) picked.push(e); if (picked.length === 4) break; }
    picked.sort((a, b) => a[0] - b[0]);
    return order('Put these events in time order, <b>earliest first</b>.', picked.map((e) => e[1]), picked.map((e) => `${e[0]}: ${e[1]}`).join(' → '));
  };
}

export const HISTORY = {
  id: 'history', name: 'History', sub: '1901 to today', icon: '🏛', color: 'var(--history)',
  units: [
    {
      n: 1, code: '1901–today', title: 'The twentieth century and after',
      lessons: [
        {
          id: 'h1', title: 'Votes for women',
          keys: [
            'In 1900 no women could vote in general elections.',
            '<b>Suffragists</b> (NUWSS, led by <b>Millicent Fawcett</b>): peaceful — petitions, marches, meetings.',
            '<b>Suffragettes</b> (WSPU, founded 1903 by <b>Emmeline Pankhurst</b>): “Deeds, not words” — smashed windows, arson, chained themselves to railings, hunger strikes.',
            '<b>Cat and Mouse Act</b> (1913): hunger strikers released when weak, re-arrested when well.',
            '<b>Emily Wilding Davison</b> ran onto the course at the 1913 Epsom Derby and died.',
            '<b>1918</b>: women over 30 (with property) get the vote. <b>1928</b>: women vote at 21, the same as men.',
          ],
          learn: [
            { title: 'Two ways to campaign', html: '<div class="two-cards"><div class="card-mini"><b>Suffragists</b><p>NUWSS · Millicent Fawcett<br>Peaceful: petitions, marches, meetings</p></div><div class="card-mini"><b>Suffragettes</b><p>WSPU · Emmeline Pankhurst, 1903<br>“Deeds, not words”: militant action</p></div></div>' },
            { title: 'Who could vote?', sim: 'votes', html: '<p>Move through the years to see who could vote in general elections.</p>' },
            { title: 'Why did women win the vote?', html: '<ul class="facts"><li>Years of campaigning by suffragists and suffragettes.</li><li><b>War work</b> (1914–18): women worked in munitions factories, on farms and as nurses, which changed many people’s views.</li><li>The <b>1918 Representation of the People Act</b> gave the vote to women over 30 who met a property qualification, and to all men over 21.</li></ul>' },
          ],
          practice: [
            mcqS('Who led the suffragettes (WSPU)?', 'Emmeline Pankhurst', ['Millicent Fawcett', 'Emily Davison', 'Queen Victoria'], 'Emmeline Pankhurst founded the WSPU in 1903.'),
            mcqS('What was the suffragettes’ motto?', '“Deeds, not words”', ['“Votes now”', '“Peace and petitions”', '“Keep calm and carry on”'], 'They believed in militant action.'),
            match('Match each person or law to what it is known for.', [['Millicent Fawcett', 'Led the peaceful suffragists'], ['Emmeline Pankhurst', 'Founded the suffragettes'], ['Emily Wilding Davison', 'Died at the 1913 Derby'], ['Cat and Mouse Act', 'Released hunger strikers, then re-arrested them']], 'Key people and laws in the fight for votes for women.'),
            mcqS('Which method did the <b>suffragists</b> use?', 'Petitions and peaceful marches', ['Smashing windows', 'Setting fire to buildings', 'Hunger strikes in prison'], 'Suffragists were peaceful; the others were suffragette tactics.'),
            mcqS('What did the 1918 Act give?', 'The vote to women over 30 who met a property qualification', ['The vote to all women over 21', 'The vote to all women over 18', 'Nothing to women'], 'Equal voting at 21 only came in 1928.'),
            mcqS('What was the Cat and Mouse Act?', 'Hunger strikers were released when weak, then re-arrested when well', ['A law about pets', 'A law giving women the vote', 'A law against marches'], 'It was passed in 1913.'),
            genYear('h1'), genYear('h1'),
            tf('Women got the vote on the same terms as men in 1918.', false, 'In 1918 only some women over 30 could vote. Equal votes (at 21) came in 1928.'),
          ],
        },
        {
          id: 'h2', title: 'The First World War',
          keys: [
            'Long-term causes — <b>MAIN</b>: <b>M</b>ilitarism, <b>A</b>lliances, <b>I</b>mperialism, <b>N</b>ationalism.',
            '<b>Triple Entente</b>: Britain, France, Russia. <b>Triple Alliance</b>: Germany, Austria-Hungary, Italy.',
            'Spark: <b>Archduke Franz Ferdinand</b> assassinated in Sarajevo, <b>28 June 1914</b>. Britain declared war on <b>4 August 1914</b> after Germany invaded Belgium.',
            '<b>Western Front</b>: trenches, stalemate, no man’s land. Rats, lice, trench foot, mud and shellfire.',
            '<b>Battle of the Somme</b> began 1 July 1916: about 57,000 British casualties on the first day. Tanks first used there.',
            '<b>Armistice</b>: 11am, <b>11 November 1918</b>. <b>Treaty of Versailles</b> (1919): Germany blamed, paid reparations, army cut to 100,000, lost land.',
          ],
          learn: [
            { title: 'Why did war start?', html: '<div class="chips"><span><b>M</b>ilitarism — building up armies</span><span><b>A</b>lliances — countries promised to help each other</span><span><b>I</b>mperialism — competing for empires</span><span><b>N</b>ationalism — pride in your country</span></div><p class="ex">The spark: Archduke Franz Ferdinand of Austria-Hungary was shot by Gavrilo Princip in Sarajevo on 28 June 1914. The alliances dragged country after country in.</p>' },
            { title: 'Life in the trenches', html: '<ul class="facts"><li>Trenches stretched from the Channel coast to Switzerland.</li><li>The land between the two sides was <b>no man’s land</b>.</li><li>Soldiers faced rats, lice, <b>trench foot</b> (from standing in cold water), mud and constant shelling.</li><li>New weapons: machine guns, poison gas, tanks and aircraft.</li></ul>' },
            { title: 'How it ended', steps: ['11am, 11 November 1918: the <b>Armistice</b> — fighting stops.', '1919: the <b>Treaty of Versailles</b>.', 'Germany had to accept the blame (the War Guilt clause).', 'It had to pay <b>reparations</b>, cut its army to 100,000 men and lose land and colonies.', 'Many Germans were angry — this helped Hitler later.'], html: '' },
          ],
          practice: [
            mcqS('What does MAIN stand for?', 'Militarism, Alliances, Imperialism, Nationalism', ['Money, Armies, Invasion, Navies', 'Militarism, Austria, Italy, Nationalism', 'Monarchy, Alliances, Industry, Nations'], 'The four long-term causes.'),
            mcqS('Whose assassination sparked the war?', 'Archduke Franz Ferdinand', ['Tsar Nicholas II', 'Kaiser Wilhelm II', 'King George V'], 'Shot in Sarajevo on 28 June 1914.'),
            mcqS('Which countries made up the Triple Entente?', 'Britain, France and Russia', ['Germany, Austria-Hungary and Italy', 'Britain, Germany and Italy', 'France, Russia and Austria-Hungary'], 'The Triple Alliance was Germany, Austria-Hungary and Italy.'),
            mcqS('Why did Britain declare war on Germany?', 'Germany invaded Belgium', ['Germany attacked London', 'Russia asked Britain to', 'Franz Ferdinand was British'], 'Britain had promised to protect Belgium.'),
            mcqS('What was trench foot?', 'A painful foot condition from standing in cold, wet trenches', ['A type of weapon', 'A trench dance', 'An army rank'], 'It could lead to amputation.'),
            text('What was the land between the two sides’ trenches called?', 'no man’s land', ["no man's land", 'no mans land', 'nomansland'], 'No man’s land.'),
            mcqS('When did the fighting stop?', '11am, 11 November 1918', ['1 July 1916', '28 June 1919', '4 August 1914'], 'The Armistice. Remembrance Day marks it.'),
            genYear('h2'), genOrder(['h2', 'h1']),
          ],
        },
        {
          id: 'h3', title: 'Between the wars',
          keys: [
            '<b>Russian Revolution</b> (1917): Tsar Nicholas II gave up the throne; the <b>Bolsheviks</b> led by <b>Lenin</b> took power and made Russia communist.',
            '<b>Wall Street Crash</b> (October 1929) → the <b>Great Depression</b>: banks failed and millions lost their jobs worldwide.',
            'Germany was hit hard: about 6 million unemployed by 1932. Many turned to <b>Hitler’s Nazi Party</b>.',
            'Hitler became <b>Chancellor in January 1933</b> and soon made himself dictator.',
            '<b>Appeasement</b>: Britain and France gave in to Hitler’s demands to avoid war — the <b>Munich Agreement</b> (1938).',
          ],
          learn: [
            { title: 'A chain of events', steps: ['1917: revolution in Russia — Lenin and the Bolsheviks take over.', '1919: Germans are angry about the Treaty of Versailles.', '1929: the Wall Street Crash starts the Great Depression.', 'Millions unemployed in Germany — people want a strong leader.', '1933: Hitler becomes Chancellor, then dictator.', '1938: appeasement at Munich — Hitler gets the Sudetenland.'], html: '' },
            { title: 'Why did people support Hitler?', html: '<ul class="facts"><li>He promised <b>jobs</b> and bread during the Depression.</li><li>He promised to tear up the <b>Treaty of Versailles</b>.</li><li>Clever <b>propaganda</b> and big rallies.</li><li>He blamed others, especially Jewish people, for Germany’s problems.</li></ul>' },
          ],
          practice: [
            mcqS('Who led the Bolsheviks in 1917?', 'Lenin', ['Stalin', 'Tsar Nicholas II', 'Hitler'], 'Lenin led the Bolshevik takeover.'),
            mcqS('What started the Great Depression?', 'The Wall Street Crash, 1929', ['The Treaty of Versailles', 'The Russian Revolution', 'D-Day'], 'Share prices in New York collapsed in October 1929.'),
            mcqS('What was appeasement?', 'Giving in to Hitler’s demands to avoid war', ['Fighting Hitler straight away', 'A peace treaty after WW1', 'A type of propaganda'], 'Chamberlain’s policy, e.g. the Munich Agreement in 1938.'),
            mcqS('Why did many Germans support the Nazis in the early 1930s?', 'Mass unemployment, and Hitler promised jobs', ['Germany was very rich', 'Britain asked them to', 'There were no other parties'], 'The Depression made people desperate.'),
            genYear('h3'), genYear('h3'),
            tf('Hitler became Chancellor of Germany in 1933.', true, 'January 1933.'),
            genOrder(['h1', 'h2', 'h3']),
          ],
        },
        {
          id: 'h4', title: 'The Second World War',
          keys: [
            'Germany invaded Poland on <b>1 September 1939</b>; Britain and France declared war on <b>3 September</b>.',
            '<b>Dunkirk</b> (1940): about 338,000 Allied soldiers rescued from France. <b>Churchill</b> became Prime Minister in May 1940.',
            '<b>Battle of Britain</b> (1940): the RAF beat the Luftwaffe, stopping an invasion. <b>The Blitz</b> (1940–41): German bombing of British cities.',
            'Home front: <b>evacuation</b> of children, <b>rationing</b> (from 1940), blackouts.',
            '<b>Pearl Harbor</b> (7 December 1941) brought the USA into the war. <b>D-Day</b>: 6 June 1944.',
            '<b>VE Day</b> 8 May 1945. Atomic bombs on Hiroshima and Nagasaki (August 1945); Japan surrendered — <b>VJ Day</b> 15 August 1945.',
          ],
          learn: [
            { title: 'The war in steps', sim: 'histline', range: [1939, 1945], html: '<p>Drag through the war year by year.</p>' },
            { title: 'The home front', html: '<ul class="facts"><li><b>Evacuation</b>: from 1 September 1939, children were moved from cities to the countryside.</li><li><b>Rationing</b>: from January 1940, food like bacon, butter and sugar was limited.</li><li><b>The Blitz</b>: night bombing of London and other cities, 1940–41. People sheltered in Anderson shelters and Underground stations.</li><li><b>Blackout</b>: no lights at night, so bombers couldn’t find targets.</li></ul>' },
          ],
          practice: [
            mcqS('Which event made Britain declare war in 1939?', 'Germany invaded Poland', ['Germany invaded France', 'Japan attacked Pearl Harbor', 'The Blitz began'], 'Germany invaded Poland on 1 September; Britain declared war on 3 September.'),
            mcqS('What happened at Dunkirk?', 'Over 300,000 Allied soldiers were rescued from France', ['The Allies landed in Normandy', 'The RAF beat the Luftwaffe', 'Japan surrendered'], 'May–June 1940.'),
            mcqS('Who won the Battle of Britain?', 'The RAF', ['The Luftwaffe', 'The Navy', 'Nobody'], 'It stopped Hitler invading Britain.'),
            mcqS('What brought the USA into the war?', 'Japan’s attack on Pearl Harbor', ['D-Day', 'The Blitz', 'Dunkirk'], '7 December 1941.'),
            match('Match the event to its date.', [['D-Day', '6 June 1944'], ['VE Day', '8 May 1945'], ['Pearl Harbor', '7 December 1941'], ['War declared by Britain', '3 September 1939']], 'Key WW2 dates.'),
            text('Who became Prime Minister of Britain in May 1940?', 'Churchill', ['Winston Churchill', 'churchil'], 'Winston Churchill.'),
            genYear('h4'), genOrder(['h4']),
          ],
        },
        {
          id: 'h5', title: 'The Holocaust',
          keys: [
            'The <b>Holocaust</b>: the Nazis murdered about <b>6 million Jewish people</b>. Roma, disabled people and others were also persecuted and killed.',
            'It happened step by step: <b>Nuremberg Laws</b> (1935) took away Jewish people’s rights; <b>Kristallnacht</b> (November 1938) attacked Jewish homes, shops and synagogues.',
            '<b>Ghettos</b> were set up in occupied countries; mass shootings followed.',
            'At the <b>Wannsee Conference</b> (January 1942) Nazi leaders planned the “Final Solution”. <b>Death camps</b> such as <b>Auschwitz-Birkenau</b>.',
            'Auschwitz was liberated on <b>27 January 1945</b> — now <b>Holocaust Memorial Day</b>.',
          ],
          learn: [
            { title: 'Step by step', steps: ['1933: Jewish people are boycotted and pushed out of jobs.', '1935: the <b>Nuremberg Laws</b> take away citizenship.', '1938: <b>Kristallnacht</b> — the “Night of Broken Glass”.', '1939–41: <b>ghettos</b> and mass shootings in occupied countries.', '1942: the <b>Wannsee Conference</b> plans the “Final Solution”.', '1942–45: <b>death camps</b> such as Auschwitz-Birkenau.', '27 January 1945: Auschwitz is liberated.'], html: '<p class="muted">We study the Holocaust to remember the victims and to understand how prejudice can lead to genocide.</p>' },
            { title: 'Key words', html: '<table class="mini"><tr><td><b>Antisemitism</b></td><td>Hatred of, or prejudice against, Jewish people</td></tr><tr><td><b>Persecution</b></td><td>Cruel treatment of people because of who they are</td></tr><tr><td><b>Ghetto</b></td><td>A closed-off area of a city where Jewish people were forced to live</td></tr><tr><td><b>Genocide</b></td><td>The deliberate killing of a large group of people because of their nationality, ethnicity, race or religion</td></tr></table>' },
          ],
          practice: [
            mcqS('About how many Jewish people were murdered in the Holocaust?', 'About 6 million', ['About 60,000', 'About 600,000', 'About 60 million'], 'About 6 million Jewish people, and many others.'),
            mcqS('What was Kristallnacht?', 'Attacks on Jewish homes, shops and synagogues in November 1938', ['A peace treaty', 'A battle in Russia', 'A Nazi election'], 'The “Night of Broken Glass”.'),
            mcqS('What did the Nuremberg Laws (1935) do?', 'Took away Jewish people’s citizenship and rights', ['Gave women the vote', 'Ended the war', 'Built the Berlin Wall'], 'A step towards the Holocaust.'),
            mcqS('Why is 27 January Holocaust Memorial Day?', 'Auschwitz was liberated on that day in 1945', ['The war ended that day', 'Hitler came to power that day', 'The Wannsee Conference met that day'], 'Soviet troops liberated Auschwitz.'),
            order('Put these in time order, earliest first.', ['Nuremberg Laws', 'Kristallnacht', 'Wannsee Conference', 'Liberation of Auschwitz'], '1935 → 1938 → 1942 → 1945.'),
            text('What is the name of the largest Nazi death camp?', 'Auschwitz', ['auschwitz-birkenau', 'birkenau', 'auschwitz birkenau'], 'Auschwitz-Birkenau.'),
          ],
        },
        {
          id: 'h6', title: 'Britain after 1945',
          keys: [
            '1945: <b>Labour</b> under <b>Clement Attlee</b> won the election.',
            'The <b>Beveridge Report</b> (1942) named five “giants”: <b>Want, Disease, Ignorance, Squalor, Idleness</b>.',
            'The <b>welfare state</b> tackled them. The <b>NHS</b> began on <b>5 July 1948</b> (Aneurin Bevan): free healthcare for everyone.',
            '<b>Indian independence</b>: 15 August 1947 — split (partitioned) into India and Pakistan. Most of the Empire became independent; many joined the <b>Commonwealth</b>.',
            '<b>Empire Windrush</b> arrived in June 1948, bringing people from the Caribbean to help rebuild Britain.',
          ],
          learn: [
            { title: 'The five giants', html: '<table class="mini"><tr><th>Giant</th><th>Meaning</th><th>Answer</th></tr><tr><td>Want</td><td>Poverty</td><td>National Insurance, benefits</td></tr><tr><td>Disease</td><td>Illness</td><td>The NHS (1948)</td></tr><tr><td>Ignorance</td><td>Lack of education</td><td>Free secondary school</td></tr><tr><td>Squalor</td><td>Bad housing</td><td>New council houses</td></tr><tr><td>Idleness</td><td>Unemployment</td><td>Jobs</td></tr></table>' },
            { title: 'End of empire', html: '<ul class="facts"><li>India became independent on <b>15 August 1947</b>, partitioned into India and Pakistan. Millions were forced to move and many died in the violence.</li><li>Over the next decades most British colonies became independent.</li><li>People from the Caribbean, India and Pakistan came to Britain to work — the <b>Windrush generation</b> arrived from 1948.</li></ul>' },
          ],
          practice: [
            mcqS('When was the NHS founded?', '5 July 1948', ['1 September 1939', '11 November 1918', '15 August 1947'], 'Aneurin Bevan was the minister in charge.'),
            mcqS('Who won the 1945 general election?', 'Labour, led by Clement Attlee', ['The Conservatives, led by Churchill', 'The Liberals', 'Nobody'], 'A surprise defeat for Churchill.'),
            match('Match the giant to its meaning.', [['Want', 'Poverty'], ['Squalor', 'Bad housing'], ['Ignorance', 'Lack of education'], ['Idleness', 'Unemployment'], ['Disease', 'Illness']], 'Beveridge’s five giants.'),
            mcqS('What happened to India in 1947?', 'It became independent and was split into India and Pakistan', ['It joined the EU', 'It became part of Russia', 'It declared war on Britain'], 'Independence on 15 August 1947.'),
            mcqS('What was the Empire Windrush?', 'A ship that brought people from the Caribbean to Britain in 1948', ['A battle', 'A law', 'A plane'], 'The Windrush generation helped rebuild Britain.'),
            genYear('h6'), text('Who wrote the 1942 report about the five giants?', 'Beveridge', ['William Beveridge', 'beverage'], 'William Beveridge.'),
          ],
        },
        {
          id: 'h7', title: 'The Cold War and the modern world',
          keys: [
            '<b>Cold War</b> (about 1947–1991): tension between the <b>USA</b> (capitalist democracy) and the <b>USSR</b> (communist), with no direct war between them. Nuclear arms race and space race.',
            '<b>Berlin Wall</b> built 1961, fell <b>9 November 1989</b>. <b>Cuban Missile Crisis</b>: October 1962.',
            'First Moon landing: <b>20 July 1969</b> (Apollo 11, Neil Armstrong).',
            'The <b>USSR collapsed</b> in December 1991, ending the Cold War.',
            'US civil rights: <b>Rosa Parks</b> (1955, Montgomery bus boycott); <b>Martin Luther King</b>, “I have a dream” (1963).',
          ],
          learn: [
            { title: 'Timeline 1945–1991', sim: 'histline', range: [1945, 1991], html: '<p>Drag through the Cold War.</p>' },
            { title: 'Two sides', html: '<div class="two-cards"><div class="card-mini"><b>USA</b><p>Capitalism and democracy. Led NATO.</p></div><div class="card-mini"><b>USSR</b><p>Communism, one-party state. Led the Warsaw Pact.</p></div></div><p class="ex">“Cold” because the two superpowers never fought each other directly — they competed with weapons, space travel and by supporting other sides in wars.</p>' },
          ],
          practice: [
            mcqS('Why was it called the “Cold” War?', 'The USA and USSR never fought each other directly', ['It was fought in the Arctic', 'It happened in winter', 'Nobody cared about it'], 'They competed in other ways.'),
            mcqS('When did the Berlin Wall fall?', '1989', ['1961', '1945', '1991'], '9 November 1989. It was built in 1961.'),
            mcqS('Who was the first person to walk on the Moon?', 'Neil Armstrong', ['Yuri Gagarin', 'Buzz Lightyear', 'John F. Kennedy'], '20 July 1969, Apollo 11. (Gagarin was the first person in space, in 1961.)'),
            mcqS('What did Rosa Parks do in 1955?', 'Refused to give up her seat on a bus to a white passenger', ['Gave the “I have a dream” speech', 'Became US President', 'Walked on the Moon'], 'It started the Montgomery bus boycott.'),
            genYear('h7'), genYear('h7'),
            tf('The Cold War ended when the USSR collapsed in 1991.', true, 'The Soviet Union broke up in December 1991.'),
            genOrder(null),
          ],
        },
      ],
    },
  ],
};

export const _test = { genYear: genYear(null), genOrder: genOrder(null) };
