import { db } from "./index";
import { questions } from "./schema";

const seedQuestions = [
  // ─── BASERUNNING ────────────────────────────────────
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're on first base with 1 out. The batter hits a ground ball to the shortstop. What do you do?",
    options: [
      { id: "a", text: "Run to second base immediately" },
      { id: "b", text: "Stay on first and wait to see if it's caught" },
      { id: "c", text: "Run hard to second — you're forced" },
      { id: "d", text: "Go back to first base" },
    ],
    correctOptionId: "c",
    explanation:
      "With a runner on first and a ground ball hit, you are FORCED to run to second. You don't have a choice — the batter is going to first and you must vacate. Run hard and get there quickly!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 3,
      score: { us: 1, them: 0 },
      ballHitTo: "shortstop",
      perspective: "baserunner_on_first",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're on second base with 0 outs. A fly ball is hit to deep center field. What should you do?",
    options: [
      { id: "a", text: "Run to third immediately" },
      { id: "b", text: "Tag up on second and advance to third after the catch" },
      { id: "c", text: "Go halfway between second and third" },
      { id: "d", text: "Stay on second base" },
    ],
    correctOptionId: "b",
    explanation:
      "With 0 outs and a deep fly ball, you should TAG UP. Wait on second until the ball is caught, then sprint to third. This puts you 60 feet from scoring with outs to spare.",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
      ballHitTo: "center_field",
      perspective: "baserunner_on_second",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're on third base with 1 out. A ground ball is hit to the first baseman. What's the smart play?",
    options: [
      { id: "a", text: "Sprint home immediately" },
      { id: "b", text: "Stay on third — it's too risky" },
      { id: "c", text: "Bluff toward home to draw a throw, then get back to third" },
      { id: "d", text: "Read the play — if she fields it and goes to first, sprint home" },
    ],
    correctOptionId: "d",
    explanation:
      "Read the play! If the first baseman fields the ball and has to take it to the bag herself or throw to the pitcher covering, she can't also throw home. That's your window to score. Always read, then react.",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 1, strikes: 1 },
      inning: 4,
      score: { us: 2, them: 2 },
      ballHitTo: "first_base",
      perspective: "baserunner_on_third",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runners on first and third, 1 out. You're on first. The batter hits a line drive right at the second baseman. What do you do?",
    options: [
      { id: "a", text: "Run to second immediately" },
      { id: "b", text: "Freeze and get back to first" },
      { id: "c", text: "Go halfway and read it" },
      { id: "d", text: "Run past the fielder" },
    ],
    correctOptionId: "b",
    explanation:
      "On a line drive hit RIGHT AT a fielder, freeze! If you run and it's caught, you're easily doubled off first for an inning-ending double play. Get back to the bag and live to run another play.",
    positions: ["all"],
    situation: {
      runners: ["first", "third"],
      outs: 1,
      count: { balls: 2, strikes: 1 },
      inning: 5,
      score: { us: 3, them: 2 },
      ballHitTo: "second_base_2b",
      perspective: "baserunner_on_first",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're on second with 2 outs and a 3-2 count on the batter. The pitch is delivered. What should you be doing?",
    options: [
      { id: "a", text: "Stay close to the bag in case it's a strikeout" },
      { id: "b", text: "Take your normal lead" },
      { id: "c", text: "Run on the pitch — with 2 outs and a full count, you go on contact or ball four" },
      { id: "d", text: "Steal third base" },
    ],
    correctOptionId: "c",
    explanation:
      "With 2 outs and a full count, you ALWAYS run on the pitch. If the batter walks, you need to be moving. If she makes contact, you have a huge head start. If she strikes out, the inning's over anyway — no risk!",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 2,
      count: { balls: 3, strikes: 2 },
      inning: 6,
      score: { us: 1, them: 2 },
      perspective: "baserunner_on_second",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You hit a single to right field. As you round first base, you see the right fielder bobble the ball. What should you do?",
    options: [
      { id: "a", text: "Stop at first base — it's a single" },
      { id: "b", text: "Keep running and take second base" },
      { id: "c", text: "Go back to the batter's box" },
      { id: "d", text: "Stop between first and second" },
    ],
    correctOptionId: "b",
    explanation:
      "Always be alert for fielding mistakes! If the outfielder bobbles the ball, you can take an extra base. Aggressive baserunning puts pressure on the defense and creates scoring opportunities.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
      ballHitTo: "right_field",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're on third with 1 out. A fly ball is hit to shallow left field. Should you tag up?",
    options: [
      { id: "a", text: "Yes, always tag up from third" },
      { id: "b", text: "No — shallow fly ball means the throw home will be short" },
      { id: "c", text: "It depends on the left fielder's arm strength and how deep the ball is" },
      { id: "d", text: "Only tag up with 2 outs" },
    ],
    correctOptionId: "c",
    explanation:
      "Tagging up from third on a fly ball is a judgment call. Consider the fielder's arm strength, the depth of the fly ball, and the game situation. A shallow fly means a short throw — it's usually NOT worth the risk unless you know the fielder has a weak arm.",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 1, them: 1 },
      ballHitTo: "left_field",
      perspective: "baserunner_on_third",
    },
  },
  // ─── FIELDING ───────────────────────────────────────
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're playing shortstop. Runner on first, 1 out. A ground ball is hit to you. What's the play?",
    options: [
      { id: "a", text: "Throw to first for the out" },
      { id: "b", text: "Step on second and throw to first for the double play" },
      { id: "c", text: "Throw home" },
      { id: "d", text: "Tag the runner" },
    ],
    correctOptionId: "b",
    explanation:
      "With a runner on first and less than 2 outs, always think DOUBLE PLAY. Step on second (or flip to your second baseman covering) to get the force out, then fire to first. Two outs are always better than one!",
    positions: ["Shortstop"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 1, strikes: 0 },
      inning: 3,
      score: { us: 2, them: 1 },
      ballHitTo: "shortstop",
      perspective: "fielder_shortstop",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're the catcher. Runner on third, less than 2 outs. A ball is hit back to the pitcher. Where should you be?",
    options: [
      { id: "a", text: "Stay at home plate to receive the throw" },
      { id: "b", text: "Back up first base" },
      { id: "c", text: "Go to third base" },
      { id: "d", text: "Run to the mound" },
    ],
    correctOptionId: "a",
    explanation:
      "With a runner on third, the catcher MUST stay home. If the pitcher throws to first and the runner breaks for home, you need to be there to receive the throw back and make the tag. Always protect the plate!",
    positions: ["Catcher"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 1, them: 1 },
      ballHitTo: "pitcher",
      perspective: "fielder_catcher",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're playing first base. Runners on first and second, 0 outs. A bunt is laid down toward you. What's your priority?",
    options: [
      { id: "a", text: "Get the out at first — it's the closest" },
      { id: "b", text: "Throw to third to get the lead runner" },
      { id: "c", text: "Throw to second for the force" },
      { id: "d", text: "Hold the ball" },
    ],
    correctOptionId: "b",
    explanation:
      "On a bunt with runners on first and second, get the LEAD runner at third if possible! This prevents the run from getting to scoring position. The saying is 'get the lead runner' — always try to get the out that hurts the offense most.",
    positions: ["First Base"],
    situation: {
      runners: ["first", "second"],
      outs: 0,
      count: { balls: 0, strikes: 1 },
      inning: 3,
      score: { us: 2, them: 1 },
      ballHitTo: "first_base",
      perspective: "fielder_first_base",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're the center fielder. There's a runner on second with 1 out. A single is hit to you. Where do you throw?",
    options: [
      { id: "a", text: "To second base to hold the batter" },
      { id: "b", text: "To the cutoff (shortstop) lined up with home" },
      { id: "c", text: "Directly to home plate" },
      { id: "d", text: "To third base" },
    ],
    correctOptionId: "b",
    explanation:
      "Hit your cutoff! On a single with a runner on second, throw to the cutoff person (usually the shortstop) lined up with home plate. They can relay to home if the runner goes, or cut it and throw elsewhere. Never skip the cutoff — the throw is faster and more accurate through the relay.",
    positions: ["Center Field"],
    situation: {
      runners: ["second"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 3, them: 3 },
      ballHitTo: "center_field",
      perspective: "fielder_center_field",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're the pitcher. After delivering a pitch, a ball is bunted right in front of you. Runner on first, 0 outs. What do you do?",
    options: [
      { id: "a", text: "Field the bunt and throw to first" },
      { id: "b", text: "Field the bunt and throw to second for the force" },
      { id: "c", text: "Let the catcher field it" },
      { id: "d", text: "Field it and look to second first, then throw to first if you can't get the lead runner" },
    ],
    correctOptionId: "d",
    explanation:
      "On a bunt with a runner on first, always LOOK to get the lead runner at second first. If you can get the force there, great! If not, take the sure out at first. Never hold the ball — always make a play.",
    positions: ["Pitcher"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
      ballHitTo: "pitcher",
      perspective: "fielder_pitcher",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Bases loaded, 1 out. Ground ball hit to you at third base. What's the ideal play?",
    options: [
      { id: "a", text: "Throw home for the force out" },
      { id: "b", text: "Step on third and throw home for a double play" },
      { id: "c", text: "Throw to second for the double play" },
      { id: "d", text: "Throw to first for the sure out" },
    ],
    correctOptionId: "b",
    explanation:
      "With bases loaded and a ground ball at third, step on the bag (force out on the runner from second) and fire home for the double play! This is the 5-2 double play and it keeps runs off the board. Two force outs, no tags needed.",
    positions: ["Third Base"],
    situation: {
      runners: ["first", "second", "third"],
      outs: 1,
      count: { balls: 2, strikes: 1 },
      inning: 6,
      score: { us: 4, them: 3 },
      ballHitTo: "third_base",
      perspective: "fielder_third_base",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're playing second base. Runner on first steals second. The catcher throws to you. The throw is slightly up the line toward first. How do you position for the tag?",
    options: [
      { id: "a", text: "Stand on top of the bag and wait" },
      { id: "b", text: "Straddle the bag, catch the ball, and swipe tag low on the incoming runner" },
      { id: "c", text: "Stand behind the bag toward center field" },
      { id: "d", text: "Move off the bag to catch the throw" },
    ],
    correctOptionId: "b",
    explanation:
      "On a steal attempt, straddle the bag to give the catcher a clear target. Catch the ball and bring your glove DOWN to the front corner of the bag for the swipe tag. Let the runner slide into your glove. Quick and low!",
    positions: ["Second Base", "Shortstop"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 1, strikes: 1 },
      inning: 3,
      score: { us: 1, them: 0 },
      perspective: "fielder_second_base",
    },
  },
  // ─── HITTING / AT-BAT IQ ───────────────────────────
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're batting with a 3-0 count. Your coach has NOT given you the green light. What should you do?",
    options: [
      { id: "a", text: "Swing at the next pitch — it'll be a fastball" },
      { id: "b", text: "Take the pitch — make the pitcher throw a strike" },
      { id: "c", text: "Bunt" },
      { id: "d", text: "Swing as hard as you can" },
    ],
    correctOptionId: "b",
    explanation:
      "Without the green light on 3-0, you TAKE the pitch. The pitcher is struggling with control — make her prove she can throw a strike. A walk is just as good as a hit in this situation. Discipline at the plate wins games!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 3, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "Runner on second, no outs. You're batting. What's your job as a hitter?",
    options: [
      { id: "a", text: "Hit a home run" },
      { id: "b", text: "Hit the ball to the right side to advance the runner to third" },
      { id: "c", text: "Bunt the runner over" },
      { id: "d", text: "Strike out looking" },
    ],
    correctOptionId: "b",
    explanation:
      "With a runner on second and no outs, your job is to move the runner to third. Hit the ball to the RIGHT SIDE — a ground ball to second base or first base advances the runner to third with 1 out, where she can score on a fly ball, wild pitch, or passed ball.",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 1, them: 1 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "It's a full count (3-2), 2 outs, runner on third. The pitch comes in and it looks borderline. What should you do?",
    options: [
      { id: "a", text: "Take the pitch and hope it's a ball" },
      { id: "b", text: "Protect the plate — foul it off or put it in play" },
      { id: "c", text: "Swing for the fences" },
      { id: "d", text: "Bunt" },
    ],
    correctOptionId: "b",
    explanation:
      "With 2 strikes and 2 outs, you MUST protect the plate. If the pitch is anywhere close, fight it off — foul it back, put it in play, do anything except stand there and take strike three. Being aggressive with 2 strikes keeps the at-bat alive!",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 2,
      count: { balls: 3, strikes: 2 },
      inning: 7,
      score: { us: 2, them: 3 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're asked to lay down a sacrifice bunt. Runner on second, 0 outs. Where should you try to bunt the ball?",
    options: [
      { id: "a", text: "Hard down the third base line" },
      { id: "b", text: "Softly toward first base side" },
      { id: "c", text: "Pop it up" },
      { id: "d", text: "Bunt it hard right back to the pitcher" },
    ],
    correctOptionId: "b",
    explanation:
      "On a sacrifice bunt, push it softly toward the first base side. This forces the first baseman or pitcher to field it, moving them away from first base. The third baseman stays back protecting the runner — the first base side is the soft spot!",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 0, them: 1 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "The pitcher has thrown you 3 changeups in a row. You're down 0-2 in the count. What pitch are you looking for?",
    options: [
      { id: "a", text: "Another changeup — she's going to keep throwing what's working" },
      { id: "b", text: "A fastball — she might try to blow one by you after 3 off-speed pitches" },
      { id: "c", text: "Just react to whatever comes" },
      { id: "d", text: "A riseball — she'll try to get you to chase" },
    ],
    correctOptionId: "a",
    explanation:
      "If a pitcher has gotten you with the same pitch 3 times, she's going to keep going to it until you prove you can hit it. Sit on the changeup! Adjust your timing and look for it. Make her beat you with something different.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 1,
      count: { balls: 0, strikes: 2 },
      inning: 3,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're the leadoff batter. First at-bat of the game. What's your main goal?",
    options: [
      { id: "a", text: "Hit a home run to get an early lead" },
      { id: "b", text: "Swing at the first pitch to be aggressive" },
      { id: "c", text: "See pitches, work the count, get on base any way you can" },
      { id: "d", text: "Bunt for a hit" },
    ],
    correctOptionId: "c",
    explanation:
      "As the leadoff batter, your #1 job is getting on base. See pitches so your team can learn what the pitcher throws. Work the count, find a pitch you like, and get on base — walk, single, HBP, anything! You're setting the table for your team.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  // ─── GENERAL GAME IQ ───────────────────────────────
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "The infield fly rule is called. What does this mean?",
    options: [
      { id: "a", text: "The batter is automatically safe" },
      { id: "b", text: "The batter is automatically out, runners do NOT have to advance" },
      { id: "c", text: "Everyone has to run" },
      { id: "d", text: "The ball is dead" },
    ],
    correctOptionId: "b",
    explanation:
      "The infield fly rule protects runners! When called (runners on 1st & 2nd or bases loaded, less than 2 outs), the batter is OUT regardless of whether the ball is caught. This prevents fielders from intentionally dropping the ball to get easy double/triple plays. Runners can advance at their own risk but are NOT forced.",
    positions: ["all"],
    situation: {
      runners: ["first", "second"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 2, them: 1 },
    },
  },
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "What's the difference between a force out and a tag out?",
    options: [
      { id: "a", text: "There is no difference" },
      { id: "b", text: "A force out requires touching the base; a tag out requires tagging the runner" },
      { id: "c", text: "A force out is only at home plate" },
      { id: "d", text: "A tag out is easier" },
    ],
    correctOptionId: "b",
    explanation:
      "A FORCE out happens when a runner must advance because the batter became a runner. You just need to touch the base while holding the ball. A TAG out requires physically tagging the runner with the ball or glove holding the ball. Know which situation you're in — it changes how you make the play!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runner on third, 1 out. A fly ball is caught in foul territory near the dugout. Can the runner tag up and score?",
    options: [
      { id: "a", text: "No — foul balls can't be tagged up on" },
      { id: "b", text: "Yes — any caught fly ball (fair or foul) can be tagged up on" },
      { id: "c", text: "Only if the coach says so" },
      { id: "d", text: "Only on fair balls" },
    ],
    correctOptionId: "b",
    explanation:
      "YES! Runners can tag up on ANY caught fly ball — fair OR foul. If a defender catches a foul ball near the dugout, the runner on third can tag up and try to score. Many teams forget this. Be ready!",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 2, them: 2 },
    },
  },
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "Your team is on defense. There are 2 outs. Where should every fielder know the ball is going before the pitch?",
    options: [
      { id: "a", text: "Just react when the ball is hit" },
      { id: "b", text: "Always throw to first — it's the easiest out" },
      { id: "c", text: "Know where the play is BEFORE the pitch based on runners and outs" },
      { id: "d", text: "Throw home every time" },
    ],
    correctOptionId: "c",
    explanation:
      "EVERY fielder should know where they're throwing BEFORE the ball is hit. With 2 outs, you usually go to first for the sure out. But with runners on base, the play might change. Pre-pitch awareness is the foundation of great defense — think before the pitch, react after it.",
    positions: ["all"],
    situation: {
      runners: ["first", "third"],
      outs: 2,
      count: { balls: 1, strikes: 0 },
      inning: 6,
      score: { us: 5, them: 4 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Your team is losing by 1 run in the last inning. Runner on second, 1 out. You're coaching third base. The batter singles to left. Do you send the runner home?",
    options: [
      { id: "a", text: "Always send — you need the run" },
      { id: "b", text: "Hold the runner at third — don't risk the out" },
      { id: "c", text: "Read the outfielder — if it's a clean single and the fielder doesn't have a strong arm, send the runner" },
      { id: "d", text: "It doesn't matter" },
    ],
    correctOptionId: "c",
    explanation:
      "It's a read play! Consider: How fast is the runner? How deep was the hit? Does the left fielder have a strong arm? Is the ball hit cleanly or bobbled? Down 1 with 1 out, you still have chances — don't give away an out at home on a bad send. But if it's clean and the runner is fast, GO!",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 7,
      score: { us: 3, them: 4 },
      ballHitTo: "left_field",
    },
  },
  {
    category: "general" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Top of the 7th, tie game. You're the pitcher. Leadoff batter is up. What's your approach?",
    options: [
      { id: "a", text: "Throw your hardest — overpower her" },
      { id: "b", text: "Walk her to be safe" },
      { id: "c", text: "Throw strikes, work ahead in the count, don't give up free bases" },
      { id: "d", text: "Only throw off-speed pitches" },
    ],
    correctOptionId: "c",
    explanation:
      "In a tie game late, the worst thing you can do is walk the leadoff batter. Throw strikes and attack the zone. Get ahead in the count so you can expand. A walk here puts the go-ahead run on base with nobody out — that's pressure you don't need!",
    positions: ["Pitcher"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 7,
      score: { us: 3, them: 3 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "What does 'backing up' mean in softball, and who should be doing it?",
    options: [
      { id: "a", text: "Only the catcher backs up plays" },
      { id: "b", text: "Every fielder should be moving to back up a throw or play, even if the ball isn't hit to them" },
      { id: "c", text: "Backing up means running backward" },
      { id: "d", text: "Only outfielders need to back up" },
    ],
    correctOptionId: "b",
    explanation:
      "EVERYONE backs up! On every play, if you're not fielding the ball or covering a base, you should be backing someone up. Pitcher backs up home or third. Outfielders back up each other and throws to bases. A team that backs up never gives up extra bases on overthrows!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "How many outs are in a full inning of softball?",
    options: [
      { id: "a", text: "3 outs" },
      { id: "b", text: "6 outs (3 per half-inning)" },
      { id: "c", text: "9 outs" },
      { id: "d", text: "4 outs" },
    ],
    correctOptionId: "b",
    explanation:
      "A full inning has TWO half-innings — the visiting team bats (top) and the home team bats (bottom). Each half-inning has 3 outs, so a full inning has 6 total outs. Knowing this helps you understand pace of play and urgency!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "fielding" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Runner on third, 1 out. Slow roller hit toward you at third base. You know you can't throw home in time. What do you do?",
    options: [
      { id: "a", text: "Throw home anyway and hope" },
      { id: "b", text: "Eat the ball and don't make a throw" },
      { id: "c", text: "Take the sure out at first — concede the run, prevent a big inning" },
      { id: "d", text: "Throw to second base" },
    ],
    correctOptionId: "c",
    explanation:
      "Sometimes you have to concede a run to prevent a big inning. If you can't get the runner at home, take the sure out at first. Now there are 2 outs with nobody on base instead of 1 out with runners everywhere from a bad throw. Smart defense means knowing which out to take!",
    positions: ["Third Base"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 3, them: 1 },
      ballHitTo: "third_base",
      perspective: "fielder_third_base",
    },
  },
  {
    category: "hitting" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're in the on-deck circle. What should you be doing?",
    options: [
      { id: "a", text: "Just stretching and swinging the bat" },
      { id: "b", text: "Timing the pitcher, noting her pitch patterns, and knowing the game situation" },
      { id: "c", text: "Watching the scoreboard" },
      { id: "d", text: "Talking to teammates" },
    ],
    correctOptionId: "b",
    explanation:
      "The on-deck circle is your SCOUTING time. Time the pitcher's fastball. Watch what pitches she throws on different counts. Note where the catcher sets up. Know the count of outs, runners, and score. Step into the box PREPARED, not surprised!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 3,
      score: { us: 1, them: 2 },
    },
  },
  // ─── BASERUNNING (additional) ─────────────────────
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're on first base with 2 outs. The batter hits a fly ball to center field. What do you do?",
    options: [
      { id: "a", text: "Tag up and wait for the catch" },
      { id: "b", text: "Run hard on contact — with 2 outs you go on anything" },
      { id: "c", text: "Stay on first no matter what" },
      { id: "d", text: "Go halfway and watch" },
    ],
    correctOptionId: "b",
    explanation:
      "With 2 outs, you RUN on contact. If the ball drops, you need to be as far around the bases as possible. If it's caught, the inning is over anyway — there's no risk of being doubled off. Always run hard with 2 outs!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 2,
      count: { balls: 1, strikes: 2 },
      inning: 3,
      score: { us: 0, them: 1 },
      ballHitTo: "center_field",
      perspective: "baserunner_on_first",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're on second base. The catcher drops a third strike and throws to first to get the batter. What should you do?",
    options: [
      { id: "a", text: "Stay at second — the play is at first" },
      { id: "b", text: "Advance to third while the catcher throws to first" },
      { id: "c", text: "Run home" },
      { id: "d", text: "Go back to first" },
    ],
    correctOptionId: "b",
    explanation:
      "Be alert! When the catcher throws to first on a dropped third strike, the ball is going AWAY from third base. That's your chance to advance. Read the play and take the extra base while the defense is occupied at first.",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 1, them: 2 },
      perspective: "baserunner_on_second",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're on first base. The pitcher picks you off — you're caught in a rundown between first and second. What's your strategy?",
    options: [
      { id: "a", text: "Run as fast as you can to second" },
      { id: "b", text: "Give up and accept the out" },
      { id: "c", text: "Stay in the rundown as long as possible to let other runners advance, then try to get back to first" },
      { id: "d", text: "Run directly at the fielder" },
    ],
    correctOptionId: "c",
    explanation:
      "In a rundown, your goal is to stay alive as LONG as possible. Make them throw the ball 4-5 times. Force mistakes, buy time for other runners to advance, and try to end up safe at a base. The longer the rundown, the more chances for a defensive error!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 2, them: 1 },
      perspective: "baserunner_on_first",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runners on first and third, 1 out. You're on first. Your coach calls a delayed steal. What does this mean?",
    options: [
      { id: "a", text: "Steal second immediately on the pitch" },
      { id: "b", text: "Wait until the catcher throws the ball back to the pitcher, then break for second" },
      { id: "c", text: "Don't steal at all" },
      { id: "d", text: "Steal home" },
    ],
    correctOptionId: "b",
    explanation:
      "A delayed steal means you break for second AFTER the catcher throws the ball back to the pitcher. The defense relaxes after the pitch, and when you take off, the throw to second either lets the runner on third score or they let you have second. It's a heads-up play!",
    positions: ["all"],
    situation: {
      runners: ["first", "third"],
      outs: 1,
      count: { balls: 1, strikes: 0 },
      inning: 4,
      score: { us: 1, them: 1 },
      perspective: "baserunner_on_first",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You hit a ball to the outfield and you're running to first. Should you run through first base or round it?",
    options: [
      { id: "a", text: "Always round first base" },
      { id: "b", text: "Run through first on a single, round it if you think you can get a double" },
      { id: "c", text: "Always slide into first" },
      { id: "d", text: "Stop on first every time" },
    ],
    correctOptionId: "b",
    explanation:
      "On a clean single to the outfield, run hard through first base (staying in the runner's lane on the foul side). But if the ball gets past the outfielder or is hit to a gap, round first aggressively and look to take second. Read the situation!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
      ballHitTo: "left_field",
    },
  },
  // ─── FIELDING (additional) ────────────────────────
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're playing left field. A ball is hit to center field. The center fielder is going to catch it. What should you be doing?",
    options: [
      { id: "a", text: "Stand and watch" },
      { id: "b", text: "Run to back up the center fielder in case she drops it" },
      { id: "c", text: "Run to second base" },
      { id: "d", text: "Run to the infield" },
    ],
    correctOptionId: "b",
    explanation:
      "ALWAYS back up your fellow outfielders! Sprint toward center field behind the play. If the ball gets past the center fielder — a drop, a bad read, a ball over her head — you're there to keep the damage to a minimum. Hustle to back up every ball!",
    positions: ["Left Field", "Right Field"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 1, them: 0 },
      ballHitTo: "center_field",
      perspective: "fielder_left_field",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're the shortstop. Pop fly hit into shallow left field. You, the third baseman, and the left fielder are all calling for it. Who has priority?",
    options: [
      { id: "a", text: "The third baseman — she's closest" },
      { id: "b", text: "You — shortstop has priority over third baseman" },
      { id: "c", text: "The left fielder — outfielders have priority over infielders on these plays" },
      { id: "d", text: "Whoever gets there first" },
    ],
    correctOptionId: "c",
    explanation:
      "Outfielders have PRIORITY over infielders on pop flies because they're running forward (easier catch) while infielders are running backward. When the left fielder calls you off, get out of the way! The priority chain: outfielder > shortstop/second base > corner infielders > pitcher/catcher.",
    positions: ["Shortstop", "Left Field", "Third Base"],
    situation: {
      runners: [],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 3,
      score: { us: 0, them: 0 },
      ballHitTo: "left_field",
      perspective: "fielder_shortstop",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're playing right field. With nobody on base and 2 outs, a ground ball single is hit to you. Where do you throw?",
    options: [
      { id: "a", text: "Throw to second base" },
      { id: "b", text: "Throw to first base" },
      { id: "c", text: "Throw to the cutoff and keep the batter at first" },
      { id: "d", text: "Hold the ball" },
    ],
    correctOptionId: "c",
    explanation:
      "With nobody on base and 2 outs, hit your cutoff! Keep the batter-runner at first base. There's no reason to try a hero throw — get the ball back to the infield quickly through your cutoff. Prevent the runner from advancing to scoring position.",
    positions: ["Right Field", "Left Field", "Center Field"],
    situation: {
      runners: [],
      outs: 2,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 2, them: 0 },
      ballHitTo: "right_field",
      perspective: "fielder_right_field",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're the catcher. Runner on first, 0 outs. The batter squares to bunt. The ball is bunted toward the third base line. Who covers third?",
    options: [
      { id: "a", text: "The third baseman always stays at third" },
      { id: "b", text: "Nobody — third base doesn't matter" },
      { id: "c", text: "The shortstop rotates over to cover third" },
      { id: "d", text: "The pitcher covers third" },
    ],
    correctOptionId: "c",
    explanation:
      "On a bunt play, the third baseman charges the ball, so the SHORTSTOP must rotate to cover third base. This is part of the standard bunt defense rotation. As catcher, you direct the play — call out 'THREE! THREE!' if you want the throw to go to third for the lead runner.",
    positions: ["Catcher", "Shortstop", "Third Base"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 3,
      score: { us: 1, them: 1 },
      ballHitTo: "third_base",
      perspective: "fielder_catcher",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're the first baseman. A ground ball is hit to the second baseman with a runner on first. What's your responsibility?",
    options: [
      { id: "a", text: "Cover first base for the throw" },
      { id: "b", text: "Back up the second baseman" },
      { id: "c", text: "Cover second base" },
      { id: "d", text: "Stay where you are" },
    ],
    correctOptionId: "a",
    explanation:
      "When the ball is hit to the second baseman, she'll flip to shortstop at second or throw to first. You MUST get to first base and give a good target! Stretch toward the throw with your foot on the bag. If the second baseman goes to second first, be ready for the relay to complete the double play.",
    positions: ["First Base"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 0, strikes: 1 },
      inning: 4,
      score: { us: 2, them: 2 },
      ballHitTo: "second_base_2b",
      perspective: "fielder_first_base",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Tie game, bottom of the last inning. Runner on third, 1 out. Ground ball hit to you at shortstop. The ball is hit slowly. What do you do?",
    options: [
      { id: "a", text: "Throw home to try to get the runner" },
      { id: "b", text: "Throw to first — you can't let the tying run score" },
      { id: "c", text: "Check the runner — if she's going, throw home. If she holds, throw to first" },
      { id: "d", text: "Hold the ball" },
    ],
    correctOptionId: "c",
    explanation:
      "This is a HUGE read play. Look the runner back at third first! If she commits to going home, throw home. If she stays, take the sure out at first. With 1 out, you still have another chance to keep the run from scoring. Never panic — read and react!",
    positions: ["Shortstop", "Third Base"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 7,
      score: { us: 3, them: 3 },
      ballHitTo: "shortstop",
      perspective: "fielder_shortstop",
    },
  },
  // ─── HITTING (additional) ─────────────────────────
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're batting with 2 strikes. The next pitch is in the dirt. What do you do?",
    options: [
      { id: "a", text: "Swing at it — you have to protect the plate" },
      { id: "b", text: "Don't swing — a ball in the dirt is a ball, and you can't be called out on a ball" },
      { id: "c", text: "Bunt at it" },
      { id: "d", text: "Close your eyes and swing" },
    ],
    correctOptionId: "b",
    explanation:
      "Protect the plate, but DON'T chase! A pitch in the dirt is a ball — the umpire won't call that a strike. Protecting the plate means swinging at borderline pitches, not chasing balls way out of the zone. Discipline and pitch recognition are key with 2 strikes!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 1,
      count: { balls: 1, strikes: 2 },
      inning: 3,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runner on third, less than 2 outs. The infield is playing in (closer to home plate). How does this change your approach at the plate?",
    options: [
      { id: "a", text: "No change — swing normally" },
      { id: "b", text: "A hard ground ball through the infield is more likely to get through since fielders have less reaction time" },
      { id: "c", text: "Bunt every time" },
      { id: "d", text: "Try to hit a home run over them" },
    ],
    correctOptionId: "b",
    explanation:
      "When the infield plays in, gaps get BIGGER. A hard ground ball that might normally be fielded can scoot through because infielders have less time to react. Hit the ball hard on the ground — a line drive or hard grounder through the drawn-in infield scores the run AND gets you on base!",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 1, strikes: 0 },
      inning: 5,
      score: { us: 2, them: 3 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "The pitcher keeps throwing you rise balls up in the zone and you keep swinging through them. What adjustment should you make?",
    options: [
      { id: "a", text: "Swing harder — you'll catch up eventually" },
      { id: "b", text: "Shorten your swing, keep your hands high, and look to drive the top of the ball" },
      { id: "c", text: "Close your eyes and hope" },
      { id: "d", text: "Back out of the box" },
    ],
    correctOptionId: "b",
    explanation:
      "Against a rise ball, shorten your swing and keep your hands at the top of the zone. A rise ball appears to be in the strike zone then jumps up — the key is to swing THROUGH it, not under it. Aim to hit the top half of the ball, which produces a hard line drive instead of a pop-up.",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 0,
      count: { balls: 1, strikes: 2 },
      inning: 6,
      score: { us: 1, them: 2 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You step into the batter's box. Where should your feet be positioned?",
    options: [
      { id: "a", text: "As far from the plate as possible" },
      { id: "b", text: "Shoulder-width apart, balanced, with your feet covering the plate so you can reach the outside corner" },
      { id: "c", text: "Feet together" },
      { id: "d", text: "One foot in the box, one foot out" },
    ],
    correctOptionId: "b",
    explanation:
      "Start with a balanced, shoulder-width stance. Your feet should be positioned so you can cover the entire plate with your bat. If you stand too far away, the outside corner is unreachable. Too close, and inside pitches jam you. Balance and plate coverage are the foundation of a good swing!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're a right-handed batter and you notice the defense has shifted toward the left side. What should you try to do?",
    options: [
      { id: "a", text: "Pull the ball even harder to the left side" },
      { id: "b", text: "Hit the ball the opposite way (to the right side) where the defense has left open space" },
      { id: "c", text: "Bunt every time" },
      { id: "d", text: "It doesn't matter — just swing" },
    ],
    correctOptionId: "b",
    explanation:
      "When the defense shifts, they're GIVING you the opposite field! As a righty, push the ball to the right side where the fielders aren't. This is called 'going the other way' and it's one of the smartest things a hitter can do against a shift. Take what the defense gives you!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 1, strikes: 0 },
      inning: 4,
      score: { us: 0, them: 1 },
    },
  },
  // ─── GENERAL (additional) ─────────────────────────
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "A batted ball hits the ground in fair territory and then rolls into foul territory before reaching first base. Is this a fair or foul ball?",
    options: [
      { id: "a", text: "Fair — it landed in fair territory" },
      { id: "b", text: "Foul — where the ball ends up is what matters (before passing 1st or 3rd)" },
      { id: "c", text: "The umpire decides" },
      { id: "d", text: "It's a dead ball" },
    ],
    correctOptionId: "b",
    explanation:
      "Before the ball passes first or third base, fair/foul is determined by where the ball IS when touched by a fielder or when it stops — NOT where it first lands. A ball can land fair and spin foul, and it's FOUL. Conversely, a ball that lands foul and spins fair before the bases is FAIR!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "The batter hits a ball that bounces off the pitcher's glove and rolls toward first base. The first baseman picks it up and tags first. Is the batter out?",
    options: [
      { id: "a", text: "No — the ball hit the pitcher, so it's dead" },
      { id: "b", text: "Yes — the ball is live and the first baseman got the out" },
      { id: "c", text: "Only if the umpire calls it" },
      { id: "d", text: "The batter gets to go back and hit again" },
    ],
    correctOptionId: "b",
    explanation:
      "A ball that deflects off any fielder (including the pitcher) is still LIVE. It's not a dead ball. The defense can make a play on it. The batter must run, and any fielder can pick it up and make a throw or tag the base. Always stay alert — the ball is live until an umpire calls time!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 3,
      score: { us: 1, them: 0 },
      ballHitTo: "pitcher",
    },
  },
  {
    category: "general" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Runner on first, 1 out. The batter hits a ground ball to the shortstop who throws to second for the force. The runner from first slides hard into the second baseman to break up the double play. Is this legal in softball?",
    options: [
      { id: "a", text: "Yes — hard slides are part of the game" },
      { id: "b", text: "No — in softball, runners must slide directly into the base and cannot target the fielder" },
      { id: "c", text: "Only if the runner stays on the ground" },
      { id: "d", text: "It depends on the league" },
    ],
    correctOptionId: "b",
    explanation:
      "In softball, the runner MUST slide directly into the base. You cannot deviate from your path to interfere with the fielder making a throw. If the umpire rules interference, both the runner AND the batter-runner are called out. Play hard but play clean!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 3, them: 2 },
      ballHitTo: "shortstop",
    },
  },
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "What is a 'count' in softball?",
    options: [
      { id: "a", text: "The number of runs scored" },
      { id: "b", text: "The number of balls and strikes on the current batter" },
      { id: "c", text: "The number of innings played" },
      { id: "d", text: "The number of outs" },
    ],
    correctOptionId: "b",
    explanation:
      "The 'count' is the number of balls and strikes on the current batter. It's always stated balls first, then strikes (for example, '2-1' means 2 balls and 1 strike). A full count is '3-2'. Knowing the count helps you make better decisions as a batter, runner, and fielder!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 2, strikes: 1 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Your team is on offense. The batter reaches first on an error by the shortstop. Does the batter get credit for a hit?",
    options: [
      { id: "a", text: "Yes — she reached base" },
      { id: "b", text: "No — reaching on an error is not a hit; the batter is safe but it doesn't count as a hit in the stats" },
      { id: "c", text: "Only if the ball was hit hard" },
      { id: "d", text: "Only in tournament play" },
    ],
    correctOptionId: "b",
    explanation:
      "Reaching base on an error does NOT count as a hit. The official scorer decides whether the batter would have been safe without the error. If the fielder should have made the play, it's an error on the fielder. The batter is safe, but her batting average doesn't benefit. Errors and hits are scored differently!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
      ballHitTo: "shortstop",
    },
  },
  {
    category: "general" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Bases loaded, 0 outs, tie game in the 6th inning. You're the coach. Do you bring the infield in?",
    options: [
      { id: "a", text: "Yes — prevent the go-ahead run at all costs" },
      { id: "b", text: "No — play back at normal depth and go for the double play" },
      { id: "c", text: "It depends on the score and the batter" },
      { id: "d", text: "Put the outfield in too" },
    ],
    correctOptionId: "b",
    explanation:
      "With bases loaded and 0 outs in a tie game, playing the infield back at double play depth is usually the smarter call. A double play gets you 2 outs and limits the damage. Playing in gives away hits and could open the floodgates. One run isn't as dangerous as giving up a big inning. Save the infield-in for later in the game when one run is the difference!",
    positions: ["all"],
    situation: {
      runners: ["first", "second", "third"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 6,
      score: { us: 3, them: 3 },
    },
  },
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "What is a 'walk' (base on balls) in softball?",
    options: [
      { id: "a", text: "When the batter gets hit by the pitch" },
      { id: "b", text: "When the batter walks away from the plate" },
      { id: "c", text: "When the pitcher throws 4 balls (out of the strike zone) and the batter goes to first base" },
      { id: "d", text: "When the batter strikes out" },
    ],
    correctOptionId: "c",
    explanation:
      "A walk (base on balls) happens when the pitcher throws 4 pitches outside the strike zone that the batter doesn't swing at. The batter is awarded first base. Walks are free bases — pitchers want to avoid them, and patient batters earn them by not chasing bad pitches!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 3, strikes: 1 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  // ─── FIELDING (more) ──────────────────────────────
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're an outfielder. A ball is hit over your head. What's the correct way to go back on the ball?",
    options: [
      { id: "a", text: "Turn and run backward while watching the ball" },
      { id: "b", text: "Turn your body, sprint to where the ball will land, then look up to find it" },
      { id: "c", text: "Stand still and reach up" },
      { id: "d", text: "Wait for it to bounce" },
    ],
    correctOptionId: "b",
    explanation:
      "Never backpedal! Turn your body (drop step) in the direction the ball is going, SPRINT to the spot, and then look up to find the ball. Running backward is slow and you'll trip. Trust your instincts on where the ball is going, get there fast, then make the catch!",
    positions: ["Left Field", "Center Field", "Right Field"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 0, strikes: 0 },
      inning: 5,
      score: { us: 2, them: 1 },
      ballHitTo: "center_field",
      perspective: "fielder_center_field",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're the pitcher. After you deliver the pitch, where should you be defensively?",
    options: [
      { id: "a", text: "Stay on the mound" },
      { id: "b", text: "In a ready fielding position — you're the 5th infielder" },
      { id: "c", text: "Walk toward the dugout" },
      { id: "d", text: "Cover home plate" },
    ],
    correctOptionId: "b",
    explanation:
      "After releasing the pitch, immediately get into a fielding-ready position. You're the 5th infielder! Square up, be balanced, and be ready for a comebacker, bunt, or ball hit up the middle. Many pitchers get hurt because they aren't ready to field after the pitch. Finish your motion and get ready!",
    positions: ["Pitcher"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
      perspective: "fielder_pitcher",
    },
  },
  // ─── HITTING (more) ───────────────────────────────
  {
    category: "hitting" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're in a tournament and facing a new pitcher for the first time. In your first at-bat, what's your approach?",
    options: [
      { id: "a", text: "Swing at the first pitch to catch her off guard" },
      { id: "b", text: "Take pitches early to see her speed, movement, and what she likes to throw" },
      { id: "c", text: "Bunt for a hit" },
      { id: "d", text: "Swing as hard as possible at everything" },
    ],
    correctOptionId: "b",
    explanation:
      "Against a new pitcher, take pitches early in your first at-bat (unless you get a perfect pitch to hit). Watch her speed, see her breaking ball, note what she throws on different counts. Share what you learn with your teammates. By your second at-bat, you'll know what to expect!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "hitting" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "Where should your eyes be focused when hitting?",
    options: [
      { id: "a", text: "On the pitcher's hand as she releases the ball, then track the ball to the bat" },
      { id: "b", text: "On the catcher's glove" },
      { id: "c", text: "On the outfield fence" },
      { id: "d", text: "On your bat" },
    ],
    correctOptionId: "a",
    explanation:
      "Watch the release point! Focus on the pitcher's hand where she releases the ball, then track the ball all the way to the bat. The earlier you pick up the ball, the more time you have to decide whether to swing. 'See the ball, hit the ball' starts with watching the release!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  // ─── BASERUNNING (more) ───────────────────────────
  {
    category: "baserunning" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "You're on second base. The batter hits a ground ball to the shortstop. The shortstop fields it and looks at you. What do you do?",
    options: [
      { id: "a", text: "Run to third — you're not forced" },
      { id: "b", text: "Stay at second — you're not forced and running into a tag is a bad idea" },
      { id: "c", text: "Run back to first" },
      { id: "d", text: "Run home" },
    ],
    correctOptionId: "b",
    explanation:
      "You are NOT forced to run from second on a ground ball to the shortstop (unless there's also a runner on first). Stay put! If you leave the base, the shortstop can tag you easily. Let her throw to first for the out — you stay safe at second. Only run when you're FORCED!",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 4,
      score: { us: 1, them: 0 },
      ballHitTo: "shortstop",
      perspective: "baserunner_on_second",
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're running from home to first base. A ground ball is hit to the right side of the infield. Which side of the foul line should you run on?",
    options: [
      { id: "a", text: "Directly on the foul line" },
      { id: "b", text: "In the runner's lane — the last half of the distance, run in the lane on the foul (right) side" },
      { id: "c", text: "On the fair (left) side of the line" },
      { id: "d", text: "It doesn't matter which side" },
    ],
    correctOptionId: "b",
    explanation:
      "Run in the runner's lane! The last half of the distance from home to first (the last 30 feet), stay in the lane on the foul side of the line. If you're in fair territory and the throw hits you, you can be called out for interference. The runner's lane keeps you safe and legal!",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
      ballHitTo: "second_base_2b",
    },
  },

  // ─── 12U RULES — DROPPED THIRD STRIKE ─────────────────
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Two outs, nobody on base. The catcher drops strike three. What happens?",
    options: [
      { id: "a", text: "The batter is out — strike three ends the at-bat" },
      { id: "b", text: "The batter can run to first base" },
      { id: "c", text: "The umpire calls a dead ball" },
      { id: "d", text: "The pitch doesn't count" },
    ],
    correctOptionId: "b",
    explanation:
      "On a dropped third strike, the batter becomes a runner and can try to reach first base. With two outs this applies regardless of whether first base is occupied. The catcher must throw to first or tag the batter to complete the out.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 2,
      count: { balls: 0, strikes: 2 },
      inning: 4,
      score: { us: 1, them: 2 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "One out, runner on first base. The catcher drops strike three. Can the batter run to first?",
    options: [
      { id: "a", text: "Yes — the batter always runs on a dropped third strike" },
      { id: "b", text: "No — the batter is out because first base is occupied with less than 2 outs" },
      { id: "c", text: "Only if the runner on first steals second first" },
      { id: "d", text: "The umpire decides" },
    ],
    correctOptionId: "b",
    explanation:
      "The dropped third strike rule does NOT apply when first base is occupied with fewer than two outs. This prevents the defense from being put in an unfair double-play situation. The batter is simply out on strike three.",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 1,
      count: { balls: 1, strikes: 2 },
      inning: 3,
      score: { us: 0, them: 1 },
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're the catcher. Two outs, runner on second. You drop strike three. What should you do?",
    options: [
      { id: "a", text: "Pick up the ball and throw to first" },
      { id: "b", text: "Tag the batter before she leaves the box" },
      { id: "c", text: "Either tag the batter or throw to first" },
      { id: "d", text: "Nothing — the batter is automatically out" },
    ],
    correctOptionId: "c",
    explanation:
      "With two outs, the dropped third strike rule is in effect regardless of runners on base. You must either tag the batter or throw to first for the out. Do whichever is faster — if she's still in the box, tag her. If she's already running, fire it to first.",
    positions: ["catcher"],
    situation: {
      runners: ["second"],
      outs: 2,
      count: { balls: 2, strikes: 2 },
      inning: 5,
      score: { us: 3, them: 3 },
    },
  },

  // ─── 12U RULES — INFIELD FLY ──────────────────────────
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runners on first and second, one out. The batter pops up to the shortstop. The umpire calls 'Infield fly, batter is out!' The shortstop drops the ball. What happens?",
    options: [
      { id: "a", text: "The batter is safe because the ball was dropped" },
      { id: "b", text: "The batter is out — the infield fly rule means she's out regardless" },
      { id: "c", text: "The runners must advance" },
      { id: "d", text: "The play is dead and everyone goes back" },
    ],
    correctOptionId: "b",
    explanation:
      "When the umpire calls 'infield fly,' the batter is OUT whether the ball is caught or not. The rule exists to protect the runners — without it, an infielder could intentionally drop the ball to get a cheap double play. Runners can advance at their own risk but are not forced.",
    positions: ["all"],
    situation: {
      runners: ["first", "second"],
      outs: 1,
      count: { balls: 1, strikes: 0 },
      inning: 2,
      score: { us: 2, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Runners on first and second, no outs. A pop fly goes up near the pitcher. When does the infield fly rule apply?",
    options: [
      { id: "a", text: "Only with bases loaded" },
      { id: "b", text: "Runners on first and second, OR bases loaded, with less than 2 outs" },
      { id: "c", text: "Any time there's a pop fly with runners on base" },
      { id: "d", text: "Only with 2 outs" },
    ],
    correctOptionId: "b",
    explanation:
      "The infield fly rule applies when there are runners on first and second (or bases loaded) with fewer than 2 outs, and a fair fly ball can be caught by an infielder with ordinary effort. It does NOT apply with only a runner on first, or with 2 outs.",
    positions: ["all"],
    situation: {
      runners: ["first", "second"],
      outs: 0,
      count: { balls: 0, strikes: 1 },
      inning: 4,
      score: { us: 1, them: 1 },
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Runners on first and second, one out. The umpire calls 'infield fly.' You're the runner on second. The ball drops in fair territory. Should you run?",
    options: [
      { id: "a", text: "Yes — always advance when the ball is dropped" },
      { id: "b", text: "No — you must stay on your base" },
      { id: "c", text: "You CAN advance at your own risk, but you're not forced" },
      { id: "d", text: "Only if the coach tells you to" },
    ],
    correctOptionId: "c",
    explanation:
      "On an infield fly, the batter is out and the force is removed. Runners CAN advance at their own risk but are not forced to. If the ball drops and the defenders aren't paying attention, a heads-up runner can advance — but if you're tagged, you're out. Be smart about it.",
    positions: ["all"],
    situation: {
      runners: ["first", "second"],
      outs: 1,
      count: { balls: 2, strikes: 1 },
      inning: 6,
      score: { us: 2, them: 3 },
    },
  },

  // ─── 12U RULES — STEALING ─────────────────────────────
  {
    category: "baserunning" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "You're on first base and want to steal second. In 12U fastpitch, when can you leave the base?",
    options: [
      { id: "a", text: "Anytime after the pitcher gets the ball" },
      { id: "b", text: "When the pitch leaves the pitcher's hand" },
      { id: "c", text: "When the ball crosses home plate" },
      { id: "d", text: "You can't steal in 12U" },
    ],
    correctOptionId: "b",
    explanation:
      "In 12U fastpitch, runners cannot leave the base until the pitch is released from the pitcher's hand. Leaving early is called 'leaving the base too soon' and can result in the runner being called out. Time your jump off the release!",
    positions: ["all"],
    situation: {
      runners: ["first"],
      outs: 0,
      count: { balls: 1, strikes: 0 },
      inning: 2,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're on second base, one out. You want to steal third. What should you watch for before going?",
    options: [
      { id: "a", text: "Wait for the pitcher to look away, then run" },
      { id: "b", text: "Watch the catcher's arm strength and the pitcher's release, then go on the pitch" },
      { id: "c", text: "Only steal on a passed ball" },
      { id: "d", text: "You should never steal third" },
    ],
    correctOptionId: "b",
    explanation:
      "Stealing third is about timing. Watch the catcher — if she has a weak arm or is slow receiving, third is stealable. Leave on the pitcher's release (not before!). Stealing third puts you 60 feet from home with a chance to score on a passed ball, wild pitch, or ground ball.",
    positions: ["all"],
    situation: {
      runners: ["second"],
      outs: 1,
      count: { balls: 0, strikes: 1 },
      inning: 5,
      score: { us: 1, them: 2 },
    },
  },

  // ─── 12U RULES — PITCHING ─────────────────────────────
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "What is a 'crow hop' and why is it illegal in fastpitch softball?",
    options: [
      { id: "a", text: "Jumping off the mound — it gives the pitcher an unfair advantage" },
      { id: "b", text: "Replanting the pivot foot and pushing off again during the pitch — it adds illegal momentum" },
      { id: "c", text: "Hopping sideways on the mound — it's a balk" },
      { id: "d", text: "Pitching from behind the rubber — it's too far from the batter" },
    ],
    correctOptionId: "b",
    explanation:
      "A crow hop is when the pitcher replants (re-grounds) her pivot foot and pushes off a second time during the delivery. This is illegal because it creates extra forward momentum and effectively shortens the 40-foot pitching distance. The umpire will call an illegal pitch.",
    positions: ["pitcher"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },
  {
    category: "general" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "In 12U fastpitch, what is the pitching distance from the rubber to home plate?",
    options: [
      { id: "a", text: "35 feet" },
      { id: "b", text: "40 feet" },
      { id: "c", text: "43 feet" },
      { id: "d", text: "46 feet" },
    ],
    correctOptionId: "b",
    explanation:
      "The 12U pitching distance is 40 feet. This is shorter than 14U (43 feet) and high school/college (43 feet). The bases are 60 feet apart. Knowing your field dimensions helps you understand throwing distances and how much time you have on plays.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },

  // ─── 12U RULES — FIELD DIMENSIONS & AWARENESS ─────────
  {
    category: "fielding" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "In 12U softball, how far apart are the bases?",
    options: [
      { id: "a", text: "50 feet" },
      { id: "b", text: "55 feet" },
      { id: "c", text: "60 feet" },
      { id: "d", text: "65 feet" },
    ],
    correctOptionId: "c",
    explanation:
      "In 12U fastpitch, the bases are 60 feet apart. That means a throw from third to first is about 85 feet (diagonal). Knowing this helps you judge whether you have time to make a play — a ground ball to shortstop requires roughly a 60-70 foot throw to first.",
    positions: ["all"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },

  // ─── 12U RULES — COMMUNICATION DEVICE ─────────────────
  {
    category: "general" as const,
    difficulty: "beginner" as const,
    scenarioText:
      "Starting in 2026, coaches can use one-way communication devices to call pitches. Who wears the receiving device?",
    options: [
      { id: "a", text: "The pitcher" },
      { id: "b", text: "The catcher — inside the helmet" },
      { id: "c", text: "Any player on the field" },
      { id: "d", text: "The shortstop" },
    ],
    correctOptionId: "b",
    explanation:
      "The receiving device goes to the catcher only, and it must be inside the catcher's helmet. The coach calling pitches must be inside the dugout. This is one-way communication only — the catcher cannot talk back through the device. It helps speed up the game and keeps pitch-calling private.",
    positions: ["catcher"],
    situation: {
      runners: [],
      outs: 0,
      count: { balls: 0, strikes: 0 },
      inning: 1,
      score: { us: 0, them: 0 },
    },
  },

  // ─── 12U SITUATIONS — GAME AWARENESS ──────────────────
  {
    category: "baserunning" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "You're on third base with one out. The batter hits a ground ball to the second baseman. The infield is playing back. What do you do?",
    options: [
      { id: "a", text: "Run home immediately on contact" },
      { id: "b", text: "Wait to see if the ball gets through" },
      { id: "c", text: "Read the ground ball — if it's hit to the right side with the infield back, go home" },
      { id: "d", text: "Stay on third no matter what" },
    ],
    correctOptionId: "c",
    explanation:
      "With the infield playing back and a ground ball to the right side (first or second baseman), the throw to home is long and difficult. The fielder's first instinct is usually to get the out at first. Read the ball off the bat — if it's on the ground to the right side, you can score. At 12U with 60-foot bases, you're only 60 feet from home!",
    positions: ["all"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 1, strikes: 1 },
      inning: 5,
      score: { us: 2, them: 2 },
      ballHitTo: "second_base_2b",
      perspective: "baserunner_on_third",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "advanced" as const,
    scenarioText:
      "Runner on third, one out. You're playing first base. A ground ball is hit right to you. What's your priority?",
    options: [
      { id: "a", text: "Always throw home to stop the run" },
      { id: "b", text: "Check the runner — if she's going, throw home; if not, take the out at first" },
      { id: "c", text: "Step on first base every time" },
      { id: "d", text: "Throw to second for the force" },
    ],
    correctOptionId: "b",
    explanation:
      "With a runner on third and one out, you have to read the situation. Look the runner back at third first. If she breaks for home, throw there. If she stays, take the easy out at first. Getting the sure out at first is usually the smart play — don't throw home unless you have a real chance to get her.",
    positions: ["first base"],
    situation: {
      runners: ["third"],
      outs: 1,
      count: { balls: 0, strikes: 2 },
      inning: 6,
      score: { us: 3, them: 4 },
      ballHitTo: "first_base_1b",
      perspective: "fielder_1b",
    },
  },
  {
    category: "fielding" as const,
    difficulty: "intermediate" as const,
    scenarioText:
      "Runners on first and third, no outs. The runner on first attempts to steal second. You're the catcher. What's the smart play?",
    options: [
      { id: "a", text: "Always throw to second to get the steal" },
      { id: "b", text: "Hold the ball — don't let the runner on third score" },
      { id: "c", text: "Fake a throw to second and check the runner at third" },
      { id: "d", text: "Look the runner at third back, then decide whether to throw to second" },
    ],
    correctOptionId: "d",
    explanation:
      "This is the classic 'first and third steal' situation. The offense WANTS you to throw to second so the runner on third can score. Step toward third and look the runner back. If she's staying, you can throw to second. If she breaks, throw to third or run at her. Never blindly throw to second — that's how runs score at 12U.",
    positions: ["catcher"],
    situation: {
      runners: ["first", "third"],
      outs: 0,
      count: { balls: 1, strikes: 1 },
      inning: 4,
      score: { us: 1, them: 1 },
      perspective: "catcher",
    },
  },
];

async function seed() {
  console.log("Seeding questions...");

  for (const q of seedQuestions) {
    await db
      .insert(questions)
      .values(q)
      .onConflictDoNothing();
  }

  console.log(`Seeded ${seedQuestions.length} questions.`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
