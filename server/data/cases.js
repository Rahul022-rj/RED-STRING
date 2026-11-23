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
  }
];

module.exports = cases;
