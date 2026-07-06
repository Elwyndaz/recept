// ponytail: minsta möjliga check av summering/skalning - körs med: node test.js
const assert = require('assert');
const fs = require('fs');
const { aggregate, fmtNum, fmtItem } = require('./app.js');

const recipes = JSON.parse(fs.readFileSync(__dirname + '/starter.json', 'utf8'));

// 1. Summering över två recept: vitlök finns i både köttfärssås (20 g) och kebab (5 g)
let items = aggregate(recipes, [{ id: 'kottfarssas', portions: 6 }, { id: 'kebab', portions: 6 }]);
const vitlok = items.find(i => i.key === 'vitlök');
assert.strictEqual(vitlok.amount, 25, 'vitlök ska summeras till 25 g');
assert.strictEqual(vitlok.count, 5, 'vitlök ~5 klyftor');
assert.strictEqual(vitlok.sources.length, 2, 'två källrecept');
const olivolja = items.find(i => i.key === 'olivolja');
assert.strictEqual(olivolja.amount, 170, 'olivolja 100+70 ml');

// 2. Skalning: veg-lasagne 16 -> 4 portioner = fjärdedel
items = aggregate(recipes, [{ id: 'veg-lasagne', portions: 4 }]);
assert.strictEqual(items.find(i => i.key === 'lasagneplattor').amount, 250, 'lasagneplattor 1000/4');
assert.strictEqual(items.find(i => i.key === 'riven ost').amount, 65, 'riven ost (160+100)/4');

// 3. skipList: vatten ska inte hamna i listan
assert.ok(!items.find(i => i.key === 'vatten'), 'vatten utesluts');

// 4. efter smak: svartpeppar i veg-lasagne saknar mängd
const peppar = items.find(i => i.key === 'svartpeppar');
assert.strictEqual(fmtItem(peppar), 'efter smak');

// 5. svenskt talformat
assert.strictEqual(fmtNum(1234), '1 235', 'avrundas till närmsta 5, tusentalsmellanslag');
assert.strictEqual(fmtNum(2.5), '2,5', 'decimalkomma');

console.log('Alla test OK');
