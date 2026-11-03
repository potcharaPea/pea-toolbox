// ทดสอบสูตรคำนวณใน index.html — รัน: node test.js
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const src = html.match(/<script id="calc">([\s\S]*?)<\/script>/)[1];
const { calc } = new Function(src + '; return { calc };')();
const near = (a, b, msg) => { if (Math.abs(a - b) > 0.01) throw new Error(`${msg}: ได้ ${a} ควรได้ ${b}`); };

near(calc.bill(200, '1.1.2', 0.1972).total, 815.78, 'ค่าไฟ 200 หน่วย 1.1.2');
near(calc.bill(100, '1.1.1', 0).total, 365.14, 'ค่าไฟ 100 หน่วย 1.1.1 ไม่มี Ft');
near(calc.unbalance(100, 100, 100).pct, 0, 'สมดุล');
near(calc.unbalance(100, 0, 0).inN, 100, 'นิวทรัลเมื่อมีเฟสเดียว');
near(calc.unbalance(180, 120, 95).pct, 36.71, '% unbalance');
near(calc.trCurrent(100, 400), 144.34, 'กระแส LV 100 kVA');
near(calc.cableKg(1350, 54.4), 734.4, 'เศษสาย (ตัวอย่างใน Excel)');
if (calc.ground(34.7, 5).type !== 'GS') throw new Error('กราวด์ตัวอย่างในคู่มือต้องได้ GS');
console.log('ผ่านทุกข้อ ✓');
