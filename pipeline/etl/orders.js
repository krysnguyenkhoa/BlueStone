// Chuyển file Order_data (.xlsx) thành work/orders26.json (mảng các dòng, dòng 0 là tiêu đề)
const X = require('xlsx'), fs = require('fs');
const [src, dst] = process.argv.slice(2);
const wb = X.readFile(src);
const r = X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
fs.writeFileSync(dst, JSON.stringify(r));
console.log('orders rows', r.length - 1);
