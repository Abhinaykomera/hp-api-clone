/**
 * scripts/seed.js
 *
 * Clears and re-seeds Houses, Characters, Students, and Staff.
 *
 * Usage:
 *   npm run seed
 *
 * Reads MONGO_URI from .env — point it at your Atlas cluster.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const House     = require('../models/House');
const Character = require('../models/Character');
const Student   = require('../models/Student');
const Staff     = require('../models/Staff');

// ── Helpers ────────────────────────────────────────────────────
const log  = (msg) => console.log(`  ✔  ${msg}`);
const warn = (msg) => console.warn(`  ⚠  ${msg}`);

async function seed() {
  // ── Connect ────────────────────────────────────────────────
  console.log('\n🔌  Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅  Connected: ${mongoose.connection.host}\n`);

  // ── Clear ──────────────────────────────────────────────────
  console.log('🗑   Clearing existing data…');
  await Promise.all([
    House.deleteMany({}),
    Character.deleteMany({}),
    Student.deleteMany({}),
    Staff.deleteMany({}),
  ]);
  log('Houses, Characters, Students, Staff cleared');

  // ── Houses ─────────────────────────────────────────────────
  console.log('\n🏰  Seeding Houses…');
  const houseDocs = await House.insertMany([
    {
      name:    'Gryffindor',
      founder: 'Godric Gryffindor',
      colors:  ['scarlet', 'gold'],
      animal:  'Lion',
      traits:  ['bravery', 'nerve', 'chivalry', 'daring', 'courage'],
    },
    {
      name:    'Slytherin',
      founder: 'Salazar Slytherin',
      colors:  ['green', 'silver'],
      animal:  'Serpent',
      traits:  ['ambition', 'cunning', 'leadership', 'resourcefulness', 'self-preservation'],
    },
    {
      name:    'Hufflepuff',
      founder: 'Helga Hufflepuff',
      colors:  ['yellow', 'black'],
      animal:  'Badger',
      traits:  ['dedication', 'patience', 'loyalty', 'hard work', 'fair play'],
    },
    {
      name:    'Ravenclaw',
      founder: 'Rowena Ravenclaw',
      colors:  ['blue', 'bronze'],
      animal:  'Eagle',
      traits:  ['intelligence', 'wit', 'wisdom', 'creativity', 'acceptance'],
    },
  ]);

  // Convenience map: name → _id
  const houses = Object.fromEntries(houseDocs.map((h) => [h.name, h._id]));
  log(`4 houses inserted (${houseDocs.map((h) => h.name).join(', ')})`);

  // ── Characters ─────────────────────────────────────────────
  console.log('\n🧙  Seeding Characters…');
  const characters = await Character.insertMany([
    {
      name:     'Harry Potter',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Stag',
      wand:     { wood: 'Holly', core: 'Phoenix feather', lengthIn: 11 },
    },
    {
      name:     'Hermione Granger',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Otter',
      wand:     { wood: 'Vine', core: 'Dragon heartstring', lengthIn: 10.75 },
    },
    {
      name:     'Ron Weasley',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Jack Russell Terrier',
      wand:     { wood: 'Willow', core: 'Unicorn hair', lengthIn: 14 },
    },
    {
      name:     'Draco Malfoy',
      house:    houses.Slytherin,
      species:  'Human',
      patronus: '',
      wand:     { wood: 'Hawthorn', core: 'Unicorn hair', lengthIn: 10 },
    },
    {
      name:     'Neville Longbottom',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Non-corporeal',
      wand:     { wood: 'Cherry', core: 'Unicorn hair', lengthIn: 13 },
    },
    {
      name:     'Luna Lovegood',
      house:    houses.Ravenclaw,
      species:  'Human',
      patronus: 'Hare',
      wand:     { wood: 'Unknown', core: 'Unknown', lengthIn: null },
    },
    {
      name:     'Cedric Diggory',
      house:    houses.Hufflepuff,
      species:  'Human',
      patronus: 'Non-corporeal',
      wand:     { wood: 'Ash', core: 'Unicorn hair', lengthIn: 12.25 },
    },
    {
      name:     'Ginny Weasley',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Horse',
      wand:     { wood: 'Yew', core: 'Unknown', lengthIn: null },
    },
    {
      name:     'Tom Riddle',
      house:    houses.Slytherin,
      species:  'Human',
      patronus: '',
      wand:     { wood: 'Yew', core: 'Phoenix feather', lengthIn: 13.5 },
    },
    {
      name:     'Cho Chang',
      house:    houses.Ravenclaw,
      species:  'Human',
      patronus: 'Swan',
      wand:     { wood: 'Unknown', core: 'Unknown', lengthIn: null },
    },
    {
      name:     'Fred Weasley',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Non-corporeal',
      wand:     { wood: 'Unknown', core: 'Unknown', lengthIn: null },
    },
    {
      name:     'George Weasley',
      house:    houses.Gryffindor,
      species:  'Human',
      patronus: 'Non-corporeal',
      wand:     { wood: 'Unknown', core: 'Unknown', lengthIn: null },
    },
    {
      name:     'Dobby',
      house:    null,
      species:  'House-elf',
      patronus: '',
      wand:     {},
    },
    {
      name:     'Rubeus Hagrid',
      house:    houses.Gryffindor,
      species:  'Half-giant',
      patronus: 'Non-corporeal',
      wand:     { wood: 'Oak', core: 'Unknown', lengthIn: 16 },
    },
  ]);
  log(`${characters.length} characters inserted`);

  // ── Students ───────────────────────────────────────────────
  console.log('\n🎒  Seeding Students…');
  const students = await Student.insertMany([
    {
      name:        'Harry Potter',
      house:       houses.Gryffindor,
      year:        7,
      bloodStatus: 'half-blood',
    },
    {
      name:        'Hermione Granger',
      house:       houses.Gryffindor,
      year:        7,
      bloodStatus: 'muggle-born',
    },
    {
      name:        'Draco Malfoy',
      house:       houses.Slytherin,
      year:        7,
      bloodStatus: 'pure-blood',
    },
    {
      name:        'Luna Lovegood',
      house:       houses.Ravenclaw,
      year:        6,
      bloodStatus: 'pure-blood',
    },
    {
      name:        'Cedric Diggory',
      house:       houses.Hufflepuff,
      year:        6,
      bloodStatus: 'pure-blood',
    },
  ]);
  log(`${students.length} students inserted`);

  // ── Staff ──────────────────────────────────────────────────
  console.log('\n🦉  Seeding Staff…');
  const staff = await Staff.insertMany([
    {
      name:    'Albus Dumbledore',
      house:   houses.Gryffindor,
      subject: 'Transfiguration (formerly)',
      title:   'Headmaster',
    },
    {
      name:    'Severus Snape',
      house:   houses.Slytherin,
      subject: 'Potions',
      title:   'Professor',
    },
    {
      name:    'Minerva McGonagall',
      house:   houses.Gryffindor,
      subject: 'Transfiguration',
      title:   'Professor',
    },
  ]);
  log(`${staff.length} staff inserted`);

  // ── Done ───────────────────────────────────────────────────
  console.log('\n✨  Seed complete!\n');
  console.log('  Collections seeded:');
  console.log(`    • Houses     : ${houseDocs.length}`);
  console.log(`    • Characters : ${characters.length}`);
  console.log(`    • Students   : ${students.length}`);
  console.log(`    • Staff      : ${staff.length}`);
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
