interface AgeGuidanceData {
  stage: string;
  stageName: string;
  description: string;
  tips: string[];
  suggestedActivities: string[];
}

function getAgeInMonths(birthdate: string): number {
  const birth = new Date(birthdate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

export function calculateAge(birthdate: string): { ageYears: number; ageMonths: number } {
  const totalMonths = getAgeInMonths(birthdate);
  const ageYears = Math.floor(totalMonths / 12);
  const ageMonths = totalMonths % 12;
  return { ageYears, ageMonths };
}

export function getGuidanceForAge(ageYears: number, ageMonths: number): AgeGuidanceData {
  const totalMonths = ageYears * 12 + ageMonths;

  if (totalMonths < 12) {
    return {
      stage: "infant",
      stageName: "Infant (0–12 months)",
      description:
        "Your baby is rapidly developing their senses and forming deep emotional bonds. Every interaction builds trust, security, and the foundation for all future relationships.",
      tips: [
        "Respond consistently to cries — this builds secure attachment",
        "Talk, sing, and narrate your day out loud to stimulate language development",
        "Maintain eye contact during feeding and play",
        "Skin-to-skin contact promotes bonding and soothes your baby",
        "Read simple picture books aloud daily, even if they can't understand yet",
      ],
      suggestedActivities: [
        "Tummy time on your chest",
        "Singing lullabies and nursery rhymes",
        "Gentle baby massage",
        "Reading board books together",
        "Bath time play with narration",
      ],
    };
  }

  if (totalMonths < 36) {
    return {
      stage: "toddler",
      stageName: "Toddler (1–3 years)",
      description:
        "Toddlers are exploring their independence and the world around them with explosive curiosity. They need patient guidance, consistent routines, and lots of hands-on exploration.",
      tips: [
        "Give simple choices to build autonomy (water or juice, red shirt or blue)",
        "Narrate what you're doing together to build vocabulary fast",
        "Set clear, consistent boundaries with warmth — toddlers need structure",
        "Get on their level physically when you talk and play",
        "Celebrate effort, not just outcomes",
      ],
      suggestedActivities: [
        "Sandbox or water table play",
        "Building blocks and knocking them down",
        "Finger painting together",
        "Simple puzzles side by side",
        "Short walks exploring the neighborhood",
        "Playing with simple musical instruments",
      ],
    };
  }

  if (totalMonths < 72) {
    return {
      stage: "preschool",
      stageName: "Preschool (3–6 years)",
      description:
        "Preschoolers have rich imaginations and are learning to play cooperatively. This is the golden age of pretend play, story making, and asking 'why' about everything.",
      tips: [
        "Engage in pretend play — let them lead the story",
        "Ask open-ended questions to spark thinking",
        "Read together every day and discuss the story",
        "Teach simple chores — kids this age love to feel helpful",
        "Validate big emotions and name feelings together",
      ],
      suggestedActivities: [
        "Backyard scavenger hunts",
        "Building forts and obstacle courses",
        "Cooking simple recipes together",
        "Drawing and storytelling",
        "Playground adventures",
        "Library trips and story time",
      ],
    };
  }

  if (totalMonths < 144) {
    return {
      stage: "school-age",
      stageName: "School Age (6–12 years)",
      description:
        "School-age children are developing competence, friendships, and a sense of who they are. They crave your interest in their world and thrive when you take their interests seriously.",
      tips: [
        "Show genuine curiosity about their interests, even if they're not yours",
        "Create reliable one-on-one time without screens",
        "Involve them in real projects like cooking, repairs, or planning trips",
        "Ask 'what was the best/worst part of your day?' at dinner",
        "Play their games on their terms — let them teach you",
      ],
      suggestedActivities: [
        "Board games and card games",
        "Cooking a meal together",
        "Camping or backyard camping",
        "Sports and outdoor adventures",
        "Working on a project or hobby together",
        "Going to local events or museums",
      ],
    };
  }

  return {
    stage: "teenager",
    stageName: "Teenager (12+ years)",
    description:
      "Teenagers are forming their identity and value their independence deeply. The key is staying connected without hovering — be available, interested, and non-judgmental.",
    tips: [
      "Listen twice as much as you talk — resist the urge to fix everything",
      "Share meals together as often as possible",
      "Respect their need for privacy and autonomy",
      "Find shared activities that don't require deep conversation",
      "Stay curious about their world without interrogating",
    ],
    suggestedActivities: [
      "Road trips or day adventures",
      "Working on a shared project or build",
      "Watching a series or movie together",
      "Cooking a challenging recipe together",
      "Their hobby, on their terms",
      "Sports, hiking, or outdoor challenges",
    ],
  };
}
