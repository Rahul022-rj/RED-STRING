const cases = [
  {
    id: "case-01",
    number: "01",
    title: "The Missing Diamond",
    location: "Ashford Museum, London",
    difficulty: "Easy",
    description: "A priceless diamond vanished from a private gala at the Ashford Museum. The room was locked from the inside. Four guests remain under suspicion.",
    suspects: [
      { id: "s1", name: "Eleanor Voss", role: "Museum Curator", avatar: "EV", motive: "The museum is bankrupt; the diamond's insurance payout would save her career.", alibi: "Claims she was in the security office reviewing camera feeds.", secret: "She was seen arguing with the donor minutes before the theft.", suspicion: 3 },
      { id: "s2", name: "Marcus Hale", role: "Private Collector", avatar: "MH", motive: "Has been trying to acquire the diamond for years and was refused.", alibi: "Says he was on the balcony taking a phone call.", secret: "He carries a lock-picking kit in his coat.", suspicion: 4 },
      { id: "s3", name: "Priya Nair", role: "Security Guard", avatar: "PN", motive: "Owes a large gambling debt to dangerous people.", alibi: "Was at her post by the main entrance, logged at 9:12 PM.", secret: "Her access badge was used at the vault door at 9:40 PM.", suspicion: 2 },
      { id: "s4", name: "Thomas Reed", role: "Event Photographer", avatar: "TR", motive: "No clear motive - recently hired for the gala.", alibi: "Was photographing guests in the main hall.", secret: "His camera bag was found with a broken vault sensor inside.", suspicion: 1 }
    ],
    evidence: [
      { id: "e1", title: "Broken Vault Sensor", description: "A small pressure sensor from the vault door found inside a camera bag.", location: "Main Hall - near photographer's station", relatedSuspect: "s4", category: "Physical", importance: "High" },
      { id: "e2", title: "Badge Access Log", description: "Priya's badge was used at the vault door at 9:40 PM - but she claims she was at the entrance.", location: "Security Office", relatedSuspect: "s3", category: "Digital", importance: "High" },
      { id: "e3", title: "Balcony CCTV Gap", description: "The balcony camera shows Marcus leaving at 9:30 PM and returning at 9:55 PM - 25 minutes unaccounted.", location: "Security Footage", relatedSuspect: "s2", category: "Timeline", importance: "Medium" },
      { id: "e4", title: "Insurance Policy Letter", description: "A letter revealing the museum's financial crisis and the diamond's insured value.", location: "Curator's Office", relatedSuspect: "s1", category: "Digital", importance: "Medium" },
      { id: "e5", title: "Heated Argument", description: "A waiter overheard Eleanor shouting 'You'll never get it!' at Marcus at 9:15 PM.", location: "Main Hall", relatedSuspect: "s1", category: "Witness", importance: "Medium" },
      { id: "e6", title: "Lock-Pick Kit", description: "A slim lock-picking set in Marcus's coat pocket - illegal to carry.", location: "Cloakroom", relatedSuspect: "s2", category: "Physical", importance: "High" },
      { id: "e7", title: "Photographer's Itinerary", description: "Thomas's schedule shows he never entered the vault corridor. Purely a red herring.", location: "Main Hall", relatedSuspect: "s4", category: "Timeline", importance: "Low" },
      { id: "e8", title: "Gambling Debt Note", description: "A threatening note in Priya's locker demanding payment.", location: "Staff Locker Room", relatedSuspect: "s3", category: "Digital", importance: "Low" }
    ],
    hints: [
      "Start by looking at who had the technical ability and opportunity to bypass the vault.",
      "Two pieces of evidence point directly at the same suspect. Look for the badge log and the balcony timeline.",
      "Marcus Hale had a 25-minute gap in his timeline, a lock-pick kit, and motive. The broken sensor in Thomas's bag was planted to shift blame."
    ],
    _solution: {
      culprit: "s2",
      motive: "Marcus Hale's obsession with the diamond led him to plan the theft during the gala. The lock-pick kit and the balcony gap prove access.",
      method: "He planted a broken sensor in the photographer's bag to misdirect blame, used the balcony gap to slip into the vault corridor, and picked the vault lock.",
      timeline: "9:15 PM - argument with curator. 9:30 PM - leaves balcony. 9:40 PM - enters vault corridor. 9:55 PM - returns to balcony.",
      keyEvidence: ["e3", "e6", "e5"],
      innocent: {
        s1: "Eleanor argued with Marcus but had no access to the vault and was in the security office.",
        s3: "Priya's badge was stolen and used; she never left her post.",
        s4: "Thomas's itinerary proves he never approached the vault; the sensor was planted on him."
      }
    }
  },
  {
    id: "case-02",
    number: "02",
    title: "Midnight at Blackwood",
    location: "Blackwood Manor, Yorkshire",
    difficulty: "Medium",
    description: "During a violent storm, the lights went out at Blackwood Manor. When they came back on, the owner was found unconscious. Four guests were trapped inside.",
    suspects: [
      { id: "s1", name: "Lady Margot Blackwood", role: "Owner's Sister", avatar: "MB", motive: "Stands to inherit the estate if the owner is incapacitated.", alibi: "Claims she was in her room during the outage.", secret: "Her flashlight was found in the east wing - far from her room.", suspicion: 3 },
      { id: "s2", name: "Dr. Harold Finch", role: "Family Physician", avatar: "HF", motive: "The owner threatened to expose a past medical error.", alibi: "Says he was in the library the whole time.", secret: "His medical bag is missing a sedative vial.", suspicion: 4 },
      { id: "s3", name: "Clara Wren", role: "Estate Manager", avatar: "CW", motive: "Was recently informed her position would be terminated.", alibi: "Was checking the fuse box in the basement.", secret: "The fuse box had been manually switched off.", suspicion: 2 },
      { id: "s4", name: "James Oduya", role: "Business Partner", avatar: "JO", motive: "A failing contract with the owner would ruin him financially.", alibi: "Claims he was in the dining room with another guest.", secret: "The other guest fell asleep and cannot confirm his story.", suspicion: 2 }
    ],
    evidence: [
      { id: "e1", title: "Missing Sedative Vial", description: "Dr. Finch's bag is missing exactly one vial of sedative - matching what was likely used.", location: "Library", relatedSuspect: "s2", category: "Physical", importance: "High" },
      { id: "e2", title: "Manually Tripped Fuse", description: "The fuse box was switched off by hand, not by the storm.", location: "Basement", relatedSuspect: "s3", category: "Physical", importance: "High" },
      { id: "e3", title: "Flashlight in East Wing", description: "Lady Margot's monogrammed flashlight was found near the owner's study.", location: "East Wing", relatedSuspect: "s1", category: "Physical", importance: "Medium" },
      { id: "e4", title: "Threat Letter", description: "A note from the owner threatening to expose Dr. Finch's malpractice.", location: "Library Desk", relatedSuspect: "s2", category: "Digital", importance: "High" },
      { id: "e5", title: "Dining Room Witness", description: "A guest confirms James was in the dining room, but was asleep during the crucial window.", location: "Dining Room", relatedSuspect: "s4", category: "Witness", importance: "Medium" },
      { id: "e6", title: "Termination Letter", description: "Clara's termination notice, dated the day before.", location: "Office", relatedSuspect: "s3", category: "Digital", importance: "Low" },
      { id: "e7", title: "Storm Damage Report", description: "The power surge was documented as internal, not lightning - clears the storm theory.", location: "Basement", relatedSuspect: "s3", category: "Timeline", importance: "High" }
    ],
    hints: [
      "The storm is a convenient excuse - look at how the power actually went out.",
      "Combine the fuse evidence with the missing vial. Two different people may have acted the same night.",
      "Clara tripped the fuse; Dr. Finch used the darkness to administer the sedative. He is the culprit - Clara was covering her own dismissal."
    ],
    _solution: {
      culprit: "s2",
      motive: "Dr. Finch feared exposure of a past medical error that would end his career. He acted during the outage.",
      method: "He used the darkness caused by Clara's tripped fuse to sedate the owner, then returned to the library before lights were restored.",
      timeline: "11:55 PM - Clara trips fuse. 12:00 AM - lights out. 12:05 AM - Finch administers sedative. 12:15 AM - lights restored.",
      keyEvidence: ["e1", "e4", "e7"],
      innocent: {
        s1: "Margot's flashlight was moved by someone else to frame her; her room alibi holds.",
        s3: "Clara tripped the fuse to sabotage, not to harm - she did not sedate anyone.",
        s4: "James remained in the dining room; the witness confirms his location, even asleep."
      }
    }
  },
  {
    id: "case-03",
    number: "03",
    title: "The Missing Scientist",
    location: "Aurora Research Facility, Iceland",
    difficulty: "Hard",
    description: "Dr. Lin Wei vanished from a sealed research lab overnight. No windows, one door, and the only footage has been wiped. Four colleagues remain.",
    suspects: [
      { id: "s1", name: "Viktor Solheim", role: "Lead Engineer", avatar: "VS", motive: "Lin was about to report a safety violation in his reactor project.", alibi: "Says he was in the server room the whole night.", secret: "His server-room access log has a 40-minute gap.", suspicion: 4 },
      { id: "s2", name: "Dr. Amara Yusuf", role: "Research Partner", avatar: "AY", motive: "Lin was taking sole credit for their joint discovery.", alibi: "Was in her quarters on a video call - the call ended at 2 AM.", secret: "A note in her room reads: 'If she takes it, I take it back.'", suspicion: 3 },
      { id: "s3", name: "Erik Lindqvist", role: "Facility Guard", avatar: "EL", motive: "Was being blackmailed by Lin over a personal incident.", alibi: "At the security desk - but the footage is missing.", secret: "He personally wiped two hours of footage 'per protocol'.", suspicion: 3 },
      { id: "s4", name: "Nadia Petrov", role: "Lab Technician", avatar: "NP", motive: "Lin had reported her for a minor procedure violation.", alibi: "Was in the lab next door - alone.", secret: "Her lab coat has traces of solvent matching what would dissolve the door sensor.", suspicion: 2 }
    ],
    evidence: [
      { id: "e1", title: "Access Log Gap", description: "Viktor's server-room card shows a 40-minute absence at the time of disappearance.", location: "Server Room", relatedSuspect: "s1", category: "Digital", importance: "High" },
      { id: "e2", title: "Safety Report Draft", description: "Lin's draft email to the board reporting a reactor safety issue in Viktor's project.", location: "Lab Terminal", relatedSuspect: "s1", category: "Digital", importance: "High" },
      { id: "e3", title: "Handwritten Note", description: "In Amara's quarters: 'If she takes it, I take it back.' Ambiguous.", location: "Quarters", relatedSuspect: "s2", category: "Physical", importance: "Medium" },
      { id: "e4", title: "Wiped Footage", description: "Guard deleted two hours of footage citing protocol - but no such protocol exists.", location: "Security Office", relatedSuspect: "s3", category: "Digital", importance: "High" },
      { id: "e5", title: "Solvent-Traced Lab Coat", description: "Nadia's coat carries traces of a solvent used for dissolving door sensors.", location: "Lab Coat Rack", relatedSuspect: "s4", category: "Physical", importance: "Medium" },
      { id: "e6", title: "Reverse-Engineered Door Log", description: "Reconstructed door logs show the lab door opened at 1:47 AM - with a wiped user identity.", location: "Server Room", relatedSuspect: "s1", category: "Digital", importance: "High" },
      { id: "e7", title: "Video Call Record", description: "Amara's video call ended at 2:00 AM - 13 minutes AFTER the door opening. She's cleared.", location: "Quarters", relatedSuspect: "s2", category: "Timeline", importance: "Low" }
    ],
    hints: [
      "The story hinges on who could have both the access and the knowledge to delete logs.",
      "Notice that two pieces of access evidence - the log gap and the reconstructed door opening - align. Who benefits from both?",
      "Viktor had motive (safety report), means (server access), and opportunity (the 40-minute gap matching the door time). The guard's wiped footage was to hide his own blackmail payments."
    ],
    _solution: {
      culprit: "s1",
      motive: "Viktor's reactor project had a safety violation that Lin was about to report. His career and the project would collapse.",
      method: "Viktor used his server access during the gap, opened the lab with a wiped identity, and used the guard's own footage-wipe (unrelated) as convenient cover.",
      timeline: "1:40 AM - Viktor leaves server room. 1:47 AM - lab door opens. 2:10 AM - Viktor returns. 2:20 AM - Erik wipes footage to hide blackmail handoff.",
      keyEvidence: ["e1", "e2", "e6"],
      innocent: {
        s2: "Amara's video call timestamp places her well after the door opening; her note is emotional, not criminal.",
        s3: "Erik wiped footage to hide blackmail payments, not to hide the disappearance.",
        s4: "Nadia's solvent trace is from routine maintenance; no motive line links to that night."
      }
    }
  },
  {
    id: "case-04",
    number: "04",
    title: "Curtain Call at the Orpheum",
    location: "The Orpheum Theatre, Paris",
    difficulty: "Medium",
    description: "On opening night, star actress Céline Marchand collapsed mid-scene after drinking from her prop goblet. She was drugged, not poisoned, and will recover, but someone wanted her off that stage. Four people had access backstage.",
    suspects: [
      { id: "s1", name: "Henri Dufresne", role: "Director", avatar: "HD", motive: "Céline publicly threatened to quit and sink his comeback production.", alibi: "Says he watched the whole first act from the back of the stalls.", secret: "He had secretly insured the production against 'cast incapacity' a week ago.", suspicion: 3 },
      { id: "s2", name: "Odile Renard", role: "Understudy", avatar: "OR", motive: "Five years as an understudy. With Céline out, the lead role and the critics are hers.", alibi: "Claims she was warming up alone in the rehearsal room.", secret: "She bought a bottle of prescription sleeping drops under her mother's name.", suspicion: 2 },
      { id: "s3", name: "Bastien Morel", role: "Stage Manager", avatar: "BM", motive: "Céline had him reprimanded for a missed cue last week.", alibi: "Insists he never left the prompt desk in the wings.", secret: "He left the prompt desk for six minutes to take a private phone call.", suspicion: 3 },
      { id: "s4", name: "Margaux Leclerc", role: "Theatre Critic", avatar: "ML", motive: "Céline humiliated her in an interview, calling her reviews 'cheap gossip'.", alibi: "Was in her box seat with a press colleague.", secret: "She had already written a review of the 'disastrous premiere' the day before.", suspicion: 4 }
    ],
    evidence: [
      { id: "e1", title: "Swapped Prop Goblet", description: "The goblet on stage has a chipped rim. The original, unchipped one is found rinsed in the understudy's dressing-room sink.", location: "Dressing Rooms", relatedSuspect: "s2", category: "Physical", importance: "High" },
      { id: "e2", title: "Sleeping-Drop Receipt", description: "A pharmacy receipt for sleeping drops, bought two days ago, crumpled in a coat pocket on the understudy's rack.", location: "Dressing Rooms", relatedSuspect: "s2", category: "Physical", importance: "High" },
      { id: "e3", title: "Rehearsal Room Sign-In", description: "The rehearsal room log shows Odile signed in at 7:40 PM, but nobody signed her out, and the room was empty at 8:05 PM.", location: "Green Room", relatedSuspect: "s2", category: "Timeline", importance: "High" },
      { id: "e4", title: "Insurance Policy", description: "A 'cast incapacity' policy taken out by the director one week before opening night.", location: "Box Office", relatedSuspect: "s1", category: "Digital", importance: "Medium" },
      { id: "e5", title: "Prompt Desk Log", description: "The cue log has a six-minute gap in Bastien's handwriting during the first act.", location: "The Wings", relatedSuspect: "s3", category: "Timeline", importance: "Medium" },
      { id: "e6", title: "Pre-Written Review", description: "A draft review titled 'A Premiere to Forget', saved the afternoon before the show.", location: "Box Office", relatedSuspect: "s4", category: "Digital", importance: "Low" },
      { id: "e7", title: "Phone Record", description: "Bastien's six-minute gap matches a call from a hospital: his father had been admitted. He was on the loading dock the whole time.", location: "The Wings", relatedSuspect: "s3", category: "Witness", importance: "Low" }
    ],
    hints: [
      "The drug had to get into the goblet before Act One. Who could reach the props table unseen?",
      "Two items from the same dressing room tell one story. Check them against the rehearsal-room log.",
      "Odile Renard swapped the goblet. She bought the drops, left the rehearsal room unseen, and rinsed the original goblet in her own sink."
    ],
    _solution: {
      culprit: "s2",
      motive: "After five years waiting in the wings, Odile wanted the lead role on opening night, in front of every critic in Paris.",
      method: "She slipped out of the rehearsal room, swapped Céline's goblet for an identical one laced with sleeping drops, and rinsed the original in her dressing-room sink.",
      timeline: "7:40 PM - Odile signs into the rehearsal room. 7:55 PM - she slips out to the props table. 8:05 PM - rehearsal room found empty. 8:30 PM - Céline drinks and collapses in Act One.",
      keyEvidence: ["e1", "e2", "e3"],
      innocent: {
        s1: "Henri's insurance policy was a cynical precaution, but he never went backstage before the curtain rose.",
        s3: "Bastien's six-minute gap was a call about his father in hospital, confirmed by the phone record.",
        s4: "Margaux's pre-written review shows malice, not access. She never left her box seat."
      }
    }
  },
  {
    id: "case-05",
    number: "05",
    title: "The Dark Lighthouse",
    location: "Ravensholm Lighthouse, Scottish Coast",
    difficulty: "Hard",
    description: "For twenty minutes on a stormy night, the Ravensholm beam went dark. A cargo ship ran aground on the rocks. The crew was rescued unharmed, but by morning its insured cargo of rare whisky had vanished. Four people knew the lighthouse and the harbour.",
    suspects: [
      { id: "s1", name: "Angus Baird", role: "Head Keeper", avatar: "AB", motive: "The lighthouse is being automated; he loses his job and his home next month.", alibi: "Says he was asleep in the keeper's cottage after a double shift.", secret: "He has been quietly drinking on duty, and hid empty bottles in the boathouse.", suspicion: 4 },
      { id: "s2", name: "Isla McKenna", role: "Assistant Keeper", avatar: "IM", motive: "Angus has blocked her promotion for three years.", alibi: "Claims she was in the lamp room the entire night.", secret: "She disabled the backup alarm last week because it kept giving false alerts.", suspicion: 3 },
      { id: "s3", name: "Callum Fraser", role: "Harbour Master", avatar: "CF", motive: "His salvage company is deep in debt, and salvage rights on a wreck are worth a fortune.", alibi: "Was in the harbour office monitoring the storm on the radio.", secret: "He registered salvage rights on the ship's route three days before it sailed.", suspicion: 2 },
      { id: "s4", name: "Rhona Drummond", role: "Salvage Diver", avatar: "RD", motive: "Owes money to dangerous people and needs a big job fast.", alibi: "Says she was at home in the village all evening.", secret: "Her diving boat's engine log shows it ran for two hours that night.", suspicion: 3 }
    ],
    evidence: [
      { id: "e1", title: "Pre-Registered Salvage Claim", description: "Salvage rights on the exact stretch of coast were filed in Callum's company name three days before the ship sailed.", location: "Harbour Office", relatedSuspect: "s3", category: "Digital", importance: "High" },
      { id: "e2", title: "Lamp Timer Tampering", description: "The lamp's power timer was reprogrammed remotely through the harbour radio link. Only the harbour office has that access code.", location: "Radio Room", relatedSuspect: "s3", category: "Digital", importance: "High" },
      { id: "e3", title: "Edited Radio Log", description: "The harbour office's storm log skips from 11:02 to 11:31 PM, exactly the blackout window, and the gap has been tidied over in fresh ink.", location: "Harbour Office", relatedSuspect: "s3", category: "Timeline", importance: "High" },
      { id: "e4", title: "Disabled Backup Alarm", description: "The lamp failure alarm was switched off last week. A maintenance note in Isla's handwriting says 'false alarms, fix later'.", location: "Lamp Room", relatedSuspect: "s2", category: "Physical", importance: "Medium" },
      { id: "e5", title: "Hidden Bottles", description: "A crate of empty whisky bottles, a cheap local brand rather than the stolen cargo, behind the boathouse nets.", location: "Boathouse", relatedSuspect: "s1", category: "Physical", importance: "Low" },
      { id: "e6", title: "Boat Engine Log", description: "Rhona's diving boat ran from 11:40 PM to 1:45 AM. She says Callum hired her for an 'emergency survey' of the wreck.", location: "Boathouse", relatedSuspect: "s4", category: "Timeline", importance: "Medium" },
      { id: "e7", title: "Cottage Witness", description: "A fisherman saw Angus asleep in the cottage window all evening; the cottage light stayed on, and he never came out.", location: "Keeper's Cottage", relatedSuspect: "s1", category: "Witness", importance: "Low" },
      { id: "e8", title: "Unsigned Hire Contract", description: "A cash-only contract on harbour office paper, hiring a diver for 'recovery work' and dated the morning BEFORE the ship ran aground.", location: "Harbour Office", relatedSuspect: "s3", category: "Physical", importance: "Medium" }
    ],
    hints: [
      "The lamp didn't fail by itself. Ask who could switch it off without climbing the tower.",
      "Follow the radio link. Compare the blackout window with whose log has a gap in it.",
      "Callum Fraser darkened the lamp through the harbour radio link, edited his own log, and had already filed salvage rights. Rhona was hired, not the planner."
    ],
    _solution: {
      culprit: "s3",
      motive: "Callum's salvage company was drowning in debt. A wrecked ship on a route where he already held salvage rights meant a legal claim on the cargo.",
      method: "He reprogrammed the lamp timer over the harbour radio link, cut the beam for twenty minutes, then hired Rhona to 'survey' the wreck and quietly recover the whisky.",
      timeline: "Three days before - salvage rights filed. 11:02 PM - lamp timer triggered by radio. 11:20 PM - ship runs aground. 11:31 PM - beam restored. 11:40 PM - Rhona's boat heads out.",
      keyEvidence: ["e1", "e2", "e3"],
      innocent: {
        s1: "Angus was asleep in the cottage, as the fisherman confirms. His bottles are his own sad secret, not the cargo.",
        s2: "Isla's disabled alarm made the blackout easier, but it was careless maintenance, not a plan, and she had no radio access.",
        s4: "Rhona did recover the cargo, but she was hired by Callum after the fact and believed it was legitimate salvage work."
      }
    }
  }
];

module.exports = cases;
