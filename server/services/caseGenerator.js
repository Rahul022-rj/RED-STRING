// Local (offline) case generator + optional real-AI path.

const THEMES = {
  museum: { location: "Ashford Museum, London", thing: "a priceless artifact", roles: ["Museum Curator", "Private Collector", "Security Guard", "Event Photographer"], scenes: ["Main Hall", "Vault Corridor", "Security Office", "Curator's Office", "Cloakroom"] },
  mansion: { location: "Blackwood Manor, Yorkshire", thing: "a sealed family heirloom", roles: ["Estate Owner", "Family Physician", "Estate Manager", "Business Partner"], scenes: ["Library", "East Wing", "Basement", "Dining Room", "Study"] },
  facility: { location: "Aurora Research Facility, Iceland", thing: "a classified research prototype", roles: ["Lead Engineer", "Research Partner", "Facility Guard", "Lab Technician"], scenes: ["Server Room", "Main Lab", "Security Office", "Crew Quarters", "Storage Bay"] },
  ship: { location: "The SS Meridian, mid-Atlantic", thing: "a locked captain's log", roles: ["Captain", "First Mate", "Ship's Doctor", "Wealthy Passenger"], scenes: ["Bridge", "Captain's Cabin", "Engine Room", "Dining Saloon", "Promenade Deck"] },
  theatre: { location: "The Orpheum Theatre, Paris", thing: "the lead actor's missing script", roles: ["Director", "Lead Actor", "Stage Manager", "Costume Designer"], scenes: ["Main Stage", "Dressing Rooms", "Prop Store", "Box Office", "Orchestra Pit"] },
  school: { location: "St. Aldric's Academy", thing: "a stolen examination paper", roles: ["Headmaster", "Senior Teacher", "Prefect", "Groundskeeper"], scenes: ["Headmaster's Study", "Exam Hall", "Dormitory", "Library", "Groundskeeper's Shed"] },
  gallery: { location: "Vermeer Gallery, Amsterdam", thing: "a forged signature", roles: ["Gallery Owner", "Art Restorer", "Night Watchman", "Visiting Critic"], scenes: ["Exhibition Hall", "Restoration Studio", "Security Office", "Loading Dock", "Owner's Office"] },
  hotel: { location: "The Grand Continental, Vienna", thing: "a guest's missing inheritance", roles: ["Hotel Manager", "Concierge", "Housekeeping Lead", "Long-term Guest"], scenes: ["Grand Lobby", "Penthouse Suite", "Concierge Desk", "Housekeeping Room", "Hotel Bar"] }
};

const NAMES = [
  ["Eleanor", "Voss"], ["Marcus", "Hale"], ["Priya", "Nair"], ["Thomas", "Reed"],
  ["Margot", "Blackwood"], ["Harold", "Finch"], ["Clara", "Wren"], ["James", "Oduya"],
  ["Viktor", "Solheim"], ["Amara", "Yusuf"], ["Erik", "Lindqvist"], ["Nadia", "Petrov"],
  ["Cecilia", "Thorn"], ["Julian", "Marsh"], ["Iris", "Kemp"], ["Oliver", "Brandt"],
  ["Saoirse", "Quinn"], ["Dmitri", "Volkov"], ["Lena", "Fischer"], ["Hugo", "Abernathy"]
];

const MOTIVES = [
  "The museum is bankrupt; the insurance payout would save their career.",
  "Was refused the artifact for years and is obsessed with owning it.",
  "Owes a dangerous gambling debt that must be paid this week.",
  "Was about to be exposed for a past professional error.",
  "Was recently told their position would be terminated.",
  "Holds a secret grudge from a deal gone wrong years ago.",
  "Stands to inherit the estate if the owner is incapacitated.",
  "Was being blackmailed by the victim over a personal incident."
];

const ALIBIS = [
  "Claims they were in the security office reviewing feeds.",
  "Says they were on the balcony taking a phone call.",
  "Insists they were at their post the whole time.",
  "Says they were in the library reading alone.",
  "Claims they were in the basement checking the fuse box.",
  "Says they were in their quarters on a video call.",
  "Was in the main hall talking to guests.",
  "Was in the dining room with another guest who fell asleep."
];

const SECRETS = [
  "Their access badge was used at a door they claim not to have visited.",
  "A lock-picking kit was found in their coat pocket.",
  "Their access log shows a 40-minute gap.",
  "A note in their room reads: 'If they take it, I take it back.'",
  "Their coat carries traces of a solvent that dissolves sensors.",
  "They personally wiped two hours of footage 'per protocol'.",
  "A threatening note was found in their locker.",
  "Their monogrammed flashlight was found in the wrong wing."
];

const EVIDENCE_POOL = [
  { base: "Broken Sensor", cat: "Physical", imp: "High", desc: "A small pressure sensor from the sealed door was found in an unexpected place." },
  { base: "Badge Access Log", cat: "Digital", imp: "High", desc: "An access badge was used at a door its owner claims never to have visited." },
  { base: "CCTV Gap", cat: "Timeline", imp: "Medium", desc: "Camera footage shows a 25-minute gap in a suspect's movement." },
  { base: "Financial Letter", cat: "Digital", imp: "Medium", desc: "A letter revealing financial pressure and a reason to act." },
  { base: "Heated Argument", cat: "Witness", imp: "Medium", desc: "A witness overheard a shouting match moments before the incident." },
  { base: "Lock-Pick Kit", cat: "Physical", imp: "High", desc: "A slim lock-picking set in a coat pocket - illegal to carry." },
  { base: "Itinerary Mismatch", cat: "Timeline", imp: "Low", desc: "A schedule that is inconsistent with what actually happened." },
  { base: "Threatening Note", cat: "Digital", imp: "Low", desc: "A threatening note demanding payment, found in a locker." },
  { base: "Wiped Footage", cat: "Digital", imp: "High", desc: "Two hours of security footage were manually deleted." },
  { base: "Handwritten Note", cat: "Physical", imp: "Medium", desc: "A cryptic handwritten line found in a suspect's quarters." },
  { base: "Missing Vial", cat: "Physical", imp: "High", desc: "A medical bag is missing a sedative vial." },
  { base: "Manually Tripped Fuse", cat: "Physical", imp: "High", desc: "The fuse box was switched off by hand, not by a storm." },
  { base: "Reconstructed Door Log", cat: "Digital", imp: "High", desc: "Recovered logs show a door opened with a wiped identity." },
  { base: "Video Call Record", cat: "Timeline", imp: "Low", desc: "A call record places a suspect well after the key time." },
  { base: "Solvent-Traced Coat", cat: "Physical", imp: "Medium", desc: "A lab coat carries traces of a solvent used to dissolve sensors." }
];

const HINTS_TEMPLATE = [
  "Pay attention to who had both physical access and the skill to bypass the security.",
  "Two pieces of evidence point at the same suspect. Look for the access gap and the timeline mismatch.",
  "The culprit had motive, means, and opportunity - the key evidence set points directly at them."
];

function pickUnique(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

const TITLE_WORDS = ["Silent", "Crimson", "Vanishing", "Last", "Hollow", "Midnight", "Broken", "Gilded"];
const TITLE_NOUNS = ["Affair", "Alibi", "Witness", "Ledger", "Hour", "Masquerade", "Confession", "Key"];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildLocalCase(opts) {
  const { themeKey, difficulty, tone } = opts;
  const theme = THEMES[themeKey] || THEMES.museum;
  const num = String(Math.floor(Math.random() * 900) + 100);

  const names = pickUnique(NAMES, 4).map(([f, l]) => ({ first: f, last: l }));
  const motives = shuffle(MOTIVES);
  const alibis = shuffle(ALIBIS);
  const secrets = shuffle(SECRETS);

  const suspects = names.map((n, i) => ({
    id: "s" + (i + 1),
    name: n.first + " " + n.last,
    role: theme.roles[i],
    avatar: (n.first[0] + n.last[0]).toUpperCase(),
    motive: motives[i],
    alibi: alibis[i],
    secret: secrets[i],
    suspicion: 1 + Math.floor(Math.random() * 4)
  }));

  const culprit = pick(suspects);
  const count = difficulty === "Hard" ? 8 : difficulty === "Medium" ? 7 : 6;
  const high = shuffle(EVIDENCE_POOL.filter((e) => e.imp === "High"));
  const keyPicks = high.slice(0, 2);
  const rest = shuffle(EVIDENCE_POOL.filter((e) => !keyPicks.includes(e)));
  const chosen = [...keyPicks, ...rest].slice(0, count);

  // First 3 items implicate the culprit; the rest are spread across the innocent.
  const innocents = suspects.filter((s) => s.id !== culprit.id);
  const scenes = shuffle(theme.scenes || [theme.location.split(",")[0]]);
  const evidence = shuffle(
    chosen.map((e, i) => ({
      title: e.base,
      description: e.desc,
      location: scenes[i % scenes.length],
      relatedSuspect: i < 3 ? culprit.id : innocents[(i - 3) % innocents.length].id,
      category: e.cat,
      importance: e.imp
    }))
  ).map((e, i) => ({ id: "e" + (i + 1), ...e }));

  const keyEvidence = evidence.filter((e) => e.relatedSuspect === culprit.id).map((e) => e.id);
  const firstKey = evidence.find((e) => e.id === keyEvidence[0]);

  const innocent = {};
  innocents.forEach((s) => {
    innocent[s.id] = s.name + " had motive or proximity, but the evidence trail does not connect them to the crime itself.";
  });

  const mood = String(tone || "").trim().replace(/[.!]+$/, "");

  return {
    id: "case-" + num,
    number: num,
    title: "The " + pick(TITLE_WORDS) + " " + pick(TITLE_NOUNS),
    location: theme.location,
    difficulty: difficulty,
    description:
      "Someone has tampered with " + theme.thing + " at " + theme.location + ". " +
      "Four people were present, each with something to hide." + (mood ? " " + mood + "." : ""),
    suspects: suspects,
    evidence: evidence,
    hints: [
      HINTS_TEMPLATE[0],
      HINTS_TEMPLATE[1],
      "The culprit is the " + culprit.role + ". Look closely at the " + (firstKey ? firstKey.title : "access evidence") + "."
    ],
    custom: true,
    _solution: {
      culprit: culprit.id,
      motive: culprit.motive,
      method: "The " + culprit.role + " used their role and access to carry out the crime during a window they could not account for.",
      timeline: "Before - a heated exchange was overheard. During - access was used and the scene was compromised. After - a cover-up was attempted.",
      keyEvidence: keyEvidence,
      innocent: innocent
    }
  };
}

async function generateCaseWithAI(opts) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return buildLocalCase(opts);

  const prompt =
    "You are generating a mystery case for a detective game. " +
    "Theme: " + opts.themeKey + ". Difficulty: " + opts.difficulty + ". Tone: " + opts.tone + ". " +
    "Return ONLY valid JSON matching this schema: {id, number, title, location, difficulty, description, suspects:[{id,name,role,avatar,motive,alibi,secret,suspicion}], evidence:[{id,title,description,location,relatedSuspect,category,importance}], hints:[3 strings], _solution:{culprit, motive, method, timeline, keyEvidence:[ids], innocent:{suspectId:text}}}. " +
    "Use exactly 4 suspects, 6-8 evidence items, 3 hints. The _solution.culprit must be one of the suspect ids.";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        response_format: { type: "json_object" }
      })
    });
    if (!res.ok) throw new Error("AI request failed: " + res.status);
    const data = await res.json();
    const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) throw new Error("Empty AI response");
    const parsed = JSON.parse(text);
    if (!parsed.suspects || !parsed.suspects.length || !parsed.evidence || !parsed.evidence.length || !parsed._solution || !parsed._solution.culprit) {
      throw new Error("AI output missing required fields");
    }
    parsed.custom = true;
    if (!parsed.id) parsed.id = "case-" + Math.floor(Math.random() * 900 + 100);
    if (!parsed.number) parsed.number = parsed.id.replace("case-", "");
    return parsed;
  } catch (err) {
    console.error("AI generation failed, falling back to local:", err.message);
    return buildLocalCase(opts);
  }
}

module.exports = { generateCaseWithAI: generateCaseWithAI, buildLocalCase: buildLocalCase, THEMES: THEMES };
