// สร้าง supabase.sql ใหม่จากข้อมูลใน index.html — รัน: node gen-sql.js
const fs = require('fs'), path = require('path');
const dir = process.argv[2] || __dirname;
const lines = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').split('\n');
const grab = name => {
  const start = lines.findIndex(l => l.startsWith(`let ${name} = [`));
  const end = lines.findIndex((l, i) => i > start && l === '];');
  return new Function('return ' + lines.slice(start, end + 1).join('\n').replace(`let ${name} = `, '').replace(/;$/, ''))();
};
const C = grab('CABLES'), S = grab('STANDARDS'), D = grab('DOCS');
const q = s => `'${String(s).replace(/'/g, "''")}'`;
const sql = `-- PEA ToolBox: รันไฟล์นี้ใน Supabase > SQL Editor ครั้งเดียว (รันซ้ำได้ จะล้างข้อมูลแล้วใส่ใหม่)
create table if not exists cables (
  id bigint generated always as identity primary key,
  sort int not null,
  name text not null,
  kg_per_100m numeric not null check (kg_per_100m > 0)
);
create table if not exists standards (
  id bigint generated always as identity primary key,
  sort int not null,
  grp text not null,                  -- แรงสูง / แรงต่ำ / การต่อลงดิน / ไฟสาธารณะ
  star boolean not null default false, -- ติดดาว = มาตรฐานที่เจอบ่อย
  title text not null,
  ref text,
  description text,
  points text[] not null default '{}',
  imgs jsonb not null default '[]'    -- [["ชื่อปุ่ม","ไฟล์รูป"], ...]
);
create table if not exists docs (
  id text primary key,                -- Google Drive file id
  sort int not null,
  c text not null,                    -- หมวด
  t text not null,                    -- ชื่อเอกสาร
  mb numeric
);

-- RLS: ทุกคนอ่านได้อย่างเดียว · แก้ข้อมูลผ่าน Table Editor ของ Supabase
alter table cables enable row level security;
alter table standards enable row level security;
alter table docs enable row level security;
drop policy if exists "read cables" on cables;
drop policy if exists "read standards" on standards;
drop policy if exists "read docs" on docs;
create policy "read cables" on cables for select using (true);
create policy "read standards" on standards for select using (true);
create policy "read docs" on docs for select using (true);

-- ที่เก็บรูป (public = เปิดดูรูปได้ทุกคน) · อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์ img ผ่าน Storage
insert into storage.buckets (id, name, public) values ('assy', 'assy', true) on conflict (id) do nothing;
-- ห้องสมุดเอกสาร: อัปโหลด PDF ตั้งชื่อเป็น <Drive id>.pdf ตามคอลัมน์ docs.id
insert into storage.buckets (id, name, public) values ('docs', 'docs', true) on conflict (id) do nothing;

truncate cables, standards, docs;
insert into cables (sort, name, kg_per_100m) values
${C.map(([n, w], i) => `  (${i + 1}, ${q(n)}, ${w})`).join(',\n')};

insert into standards (sort, grp, star, title, ref, description, points, imgs) values
${S.map((s, i) => `  (${i + 1}, ${q(s.grp)}, ${!!s.star}, ${q(s.title)}, ${q(s.ref)}, ${q(s.desc)}, array[${s.points.map(q).join(', ')}], ${q(JSON.stringify(s.imgs || []))})`).join(',\n')};

insert into docs (sort, id, c, t, mb) values
${D.map((d, i) => `  (${i + 1}, ${q(d.id)}, ${q(d.c)}, ${q(d.t)}, ${d.mb})`).join(',\n')};
`;
fs.writeFileSync(path.join(dir, 'supabase.sql'), sql);
console.log(C.length, 'cables,', S.length, 'standards,', D.length, 'docs');
