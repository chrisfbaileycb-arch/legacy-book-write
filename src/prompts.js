// Book "directions" — the presets a user can pick when starting a new book project.
// A project can be a memoir, a journal, letters to loved ones, a genre novel, a faith
// story, a trade/career history, or anything custom the writer describes themselves.
// Each direction has a short static fallback list (used if AI generation fails or is
// still loading) and a system hint used to steer the AI-generated daily prompt.

export const DIRECTIONS = [
  {
    id: 'memoir',
    label: 'Memoir / Autobiography',
    tagline: 'The story of your life, in your own words.',
    hint: "a warm, reflective memoir covering the writer's own life — childhood, family, career, turning points, and relationships",
    fallback: [
      'What is your earliest clear memory, and why do you think it stayed with you?',
      'Describe the house or place you grew up in. What did it feel like to walk through the door?',
      'What was your first job, and what did it teach you about work?',
      'What is a moment that changed the direction of your life completely?',
      'Who was the adult you admired most as a child, and what did you learn from them?',
      'What is the biggest mistake you made, and what did it teach you?',
      'What was the happiest single day of your life?',
      'What do you know now that took too long to learn?',
    ],
  },
  {
    id: 'journal',
    label: 'Personal Journal',
    tagline: 'A running journal of your days, thoughts, and growth.',
    hint: "an ongoing personal journal capturing the writer's current thoughts, feelings, and everyday life as it happens",
    fallback: [
      'What is on your mind most today, and why?',
      'What is something small that went well recently?',
      'What is something you are worried about right now?',
      'What did you learn about yourself this week?',
      'Describe a conversation that stuck with you lately.',
      'What are you grateful for today?',
      'What would you tell yourself a year from now to remember about right now?',
      'What is a habit you are trying to build or break?',
    ],
  },
  {
    id: 'letters',
    label: 'Letters to Loved Ones',
    tagline: 'Messages for a spouse, children, or family — now or for later.',
    hint: 'a collection of heartfelt letters addressed to specific loved ones — a spouse, children, parents, or friends — meant to be read now or after the writer is gone',
    fallback: [
      'Who do you want to write to today, and what do you want them to know?',
      'What do you love most about them, in detail?',
      'What is a memory with them you never want lost?',
      'What do you hope for their future?',
      'What is the advice you most want them to carry?',
      'What made you proudest of them?',
      'What do you want them to remember about you?',
      'What do you want to apologize for, or forgive?',
    ],
  },
  {
    id: 'business',
    label: 'Career / Trade History',
    tagline: 'The story of a career, trade, or business you built or lived.',
    hint: "a detailed, first-person history of a specific career, trade, or business the writer has spent years in — how it started, how it changed, the people and lessons in it",
    fallback: [
      'How did you first get into this line of work?',
      'What has changed the most about your trade since you started?',
      'Describe a customer or job you will never forget.',
      'What is a mistake early on that taught you the most?',
      'Who taught you the most about this work, and what did they show you?',
      'What is something people outside the trade never understand about it?',
      'What is the proudest thing you ever built, made, or delivered?',
      'What do you want the next generation in this line of work to know?',
    ],
  },
  {
    id: 'faith',
    label: 'Faith-Based Story',
    tagline: 'A story or testimony rooted in faith.',
    hint: "a faith-based story or personal testimony — moments of belief, doubt, prayer, and grace in the writer's life",
    fallback: [
      'Describe a moment your faith was tested.',
      'What is a prayer that was answered in a way you did not expect?',
      'Who showed you what faith looks like in practice?',
      'What is a Scripture or teaching that changed how you live?',
      'Describe a time you felt closest to God.',
      'What do you want your family to understand about your faith?',
      'What is a moment of doubt you moved through, and how?',
      'What does grace mean to you, from something you actually lived?',
    ],
  },
  {
    id: 'scifi',
    label: 'Sci-Fi Novel',
    tagline: 'Build an original science-fiction story, scene by scene.',
    hint: 'an original science-fiction novel — its world, technology, characters, conflict, and plot, built one scene or chapter idea at a time',
    fallback: [
      'What world or setting is this story set in — describe it in detail.',
      'Who is your main character, and what do they want more than anything?',
      'What technology or force in this world could destroy everything?',
      'Write the opening scene of your story.',
      'What is the biggest secret a character in this story is keeping?',
      'Describe the moment your protagonist realizes the truth.',
      'What does this world look like, sound like, smell like?',
      'How does your story end — write the final scene, or the idea of it.',
    ],
  },
  {
    id: 'western',
    label: 'Old Western Novel',
    tagline: 'An old country-western tale of the frontier.',
    hint: 'an old-fashioned country/Western novel set on the American frontier — outlaws, ranchers, small towns, honor, and hard land',
    fallback: [
      'Describe the town or ranch where your story begins.',
      'Who is your protagonist, and what brought them to this land?',
      'What wrong does your protagonist need to right?',
      'Write the scene where trouble first rides into town.',
      'Who is the antagonist, and what do they believe justifies them?',
      'Describe a showdown, chase, or standoff scene.',
      'What does honor mean to the people in this story?',
      'How does the story end for your protagonist?',
    ],
  },
  {
    id: 'guide',
    label: 'Guide / Training Material',
    tagline: 'Teach a skill — a how-to book, course, or coding guide.',
    hint: "a practical how-to guide, course, or training manual that teaches a specific skill or subject step by step — with clear explanations, examples, and exercises for the reader",
    fallback: [
      'What skill or subject will this guide teach, and who is it for?',
      'What should a reader be able to do by the time they finish?',
      'What is the very first concept a beginner needs to understand? Explain it simply.',
      'Walk through one core technique step by step, as if teaching it out loud.',
      'What is a common mistake beginners make here, and how do you avoid it?',
      'Give a concrete worked example a reader can follow along with.',
      'What exercise or project would help the reader practice what they just learned?',
      'What advice do you wish someone had given you when you started?',
    ],
  },
  {
    id: 'custom',
    label: 'Something else',
    tagline: 'Tell us your own direction — any book you want to write.',
    hint: null,
    fallback: [
      'What is the very first thing you want readers to know?',
      'Describe the main idea, story, or subject of this book in your own words.',
      'Who is this book for, and what do you want them to feel reading it?',
      'Write the opening lines of this book.',
      'What is the most important thing this book needs to say?',
      'Describe a specific scene, moment, or detail at the heart of this book.',
      'What do you want the reader to understand by the last page?',
      'What would make you proud, looking back at this finished book?',
    ],
  },
]

export function directionInfo(id) {
  return DIRECTIONS.find(d => d.id === id) || DIRECTIONS[DIRECTIONS.length - 1]
}

// Deterministic fallback prompt-of-the-day — used only if AI generation is
// unavailable, so the app never leaves the writer with a blank screen.
export function fallbackPromptForDate(project, dateStr, answeredTexts) {
  const dir = directionInfo(project.direction)
  const remaining = dir.fallback.filter(p => !answeredTexts.includes(p))
  const pool = remaining.length ? remaining : dir.fallback
  let seed = 0
  const key = dateStr + (project.id || '')
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) >>> 0
  return pool[seed % pool.length]
}

// Builds the instruction sent to the AI to generate today's tailored prompt.
export function buildPromptRequest(project, pastPromptTexts) {
  const dir = directionInfo(project.direction)
  const direction = dir.id === 'custom' || !dir.hint
    ? (project.details || project.title)
    : dir.hint
  const extra = project.details && dir.id !== 'custom' ? ` The author also shared this about their book: "${project.details}".` : ''
  const avoid = pastPromptTexts.length
    ? ` Do not repeat or closely resemble any of these previous prompts: ${pastPromptTexts.slice(-15).map(p => `"${p}"`).join(', ')}.`
    : ''
  return `You are helping someone write a book. The book is: ${direction}.${extra} Write exactly ONE short, specific writing prompt or question for today's session that will move this particular book forward and invite a substantial written response (a paragraph or more).${avoid} Reply with ONLY the prompt text itself — no preamble, no quotation marks, no numbering.`
}
