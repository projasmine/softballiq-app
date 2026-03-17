// Run with: npx tsx scripts/generate-pdfs.ts

import { writeFileSync } from "fs";

const TEAM_CODE = "HLX6WJTT";
const APP_URL = "softballiq.app";

function generateCoachPDF(): string {
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>
endobj

4 0 obj
<< /Length 3200 >>
stream
BT
/F1 24 Tf
72 730 Td
(SoftballIQ - Coach Quick Start) Tj

/F2 10 Tf
0 -22 Td
(Everything you need to get your team set up and learning.) Tj

/F1 14 Tf
0 -30 Td
(Your Team Code:  ${TEAM_CODE}) Tj

/F2 10 Tf
0 -18 Td
(Share this code with your players so they can join your team.) Tj

/F1 12 Tf
0 -28 Td
(Step 1: Sign In to Your Coach Account) Tj
/F2 10 Tf
0 -16 Td
(Go to ${APP_URL} and tap "Sign in" at the bottom of the page.) Tj
0 -14 Td
(If you don't have an account yet, tap "Sign up" and select "Coach" as your role.) Tj
0 -14 Td
(After signing in, you'll see your Coach Dashboard.) Tj

/F1 12 Tf
0 -26 Td
(Step 2: Add Your Players to the Roster) Tj
/F2 10 Tf
0 -16 Td
(Tap the Team tab at the bottom of the screen.) Tj
0 -14 Td
(Tap "Add Player" and type each girl's name, one at a time.) Tj
0 -14 Td
(Players do NOT need an email or password. You are just adding their names.) Tj
0 -14 Td
(They will pick their name from a list when they join.) Tj

/F1 12 Tf
0 -26 Td
(Step 3: Share the Link and Code) Tj
/F2 10 Tf
0 -16 Td
(Send your players these two things:) Tj
0 -14 Td
(   Link:  ${APP_URL}/join) Tj
0 -14 Td
(   Code:  ${TEAM_CODE}) Tj
0 -14 Td
(Text it, email it, write it on the whiteboard - however you communicate.) Tj
0 -14 Td
(They go to the link, type the code, tap their name, and they are in.) Tj

/F1 12 Tf
0 -26 Td
(Step 4: Create Assignments) Tj
/F2 10 Tf
0 -16 Td
(Go to the Assignments tab and tap "New Assignment".) Tj
0 -14 Td
(Pick a title, category \\(baserunning, fielding, hitting, general\\), difficulty,) Tj
0 -14 Td
(and number of questions. You can set an optional due date.) Tj
0 -14 Td
(Your players will see the assignment on their dashboard.) Tj

/F1 12 Tf
0 -26 Td
(Step 5: Track Progress) Tj
/F2 10 Tf
0 -16 Td
(Leaderboard tab: See player rankings, accuracy, and streaks.) Tj
0 -14 Td
(Team tab: Tap any player's name to view their detailed progress by category.) Tj

/F1 12 Tf
0 -26 Td
(Optional: Video Assignments) Tj
/F2 10 Tf
0 -16 Td
(From the Assignments tab, tap "New Video Assignment".) Tj
0 -14 Td
(Paste a video link \\(game film, drill video\\), add a title and description.) Tj
0 -14 Td
(Players can watch the video and leave comments.) Tj

/F1 12 Tf
0 -26 Td
(Optional: Customize Questions) Tj
/F2 10 Tf
0 -16 Td
(Go to the Questions tab to see the full question bank.) Tj
0 -14 Td
(Tap "Edit" on any question to change the wording, answers, or explanation) Tj
0 -14 Td
(for your team only. Other teams still see the original.) Tj
ET
endstream
endobj

xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000459 00000 n
0000000272 00000 n
0000000369 00000 n

trailer
<< /Size 7 /Root 1 0 R >>
startxref
3713
%%EOF`;
}

function generatePlayerPDF(): string {
  return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
   /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>
endobj

4 0 obj
<< /Length 2200 >>
stream
BT
/F1 28 Tf
72 720 Td
(SoftballIQ - Player Instructions) Tj

/F2 11 Tf
0 -30 Td
(How to join your team and start building your softball IQ.) Tj

/F1 16 Tf
0 -45 Td
(Your Team Code:  ${TEAM_CODE}) Tj

/F1 14 Tf
0 -50 Td
(Step 1: Go to the Join Page) Tj
/F2 11 Tf
0 -20 Td
(Open your phone's browser and go to:) Tj
/F1 13 Tf
0 -22 Td
(${APP_URL}/join) Tj

/F1 14 Tf
0 -40 Td
(Step 2: Enter the Team Code) Tj
/F2 11 Tf
0 -20 Td
(Type in the team code your coach gave you:) Tj
/F1 13 Tf
0 -22 Td
(${TEAM_CODE}) Tj
/F2 11 Tf
0 -20 Td
(Then tap "Find My Team".) Tj

/F1 14 Tf
0 -40 Td
(Step 3: Tap Your Name) Tj
/F2 11 Tf
0 -20 Td
(You will see your team name and a list of player names.) Tj
0 -16 Td
(Find your name and tap it. That's it - you're in!) Tj
0 -16 Td
(No email or password needed.) Tj
0 -20 Td
(Don't see your name? Ask your coach to add you to the roster.) Tj

/F1 14 Tf
0 -40 Td
(Step 4: Do Your Daily Reps) Tj
/F2 11 Tf
0 -20 Td
(Every day you'll get 5 softball situation questions.) Tj
0 -16 Td
(Tap "Daily Rep" on your dashboard to start.) Tj
0 -16 Td
(Try to build a streak by completing your reps every day!) Tj

/F1 14 Tf
0 -40 Td
(Step 5: Complete Assignments) Tj
/F2 11 Tf
0 -20 Td
(Your coach may assign quizzes or videos for the team.) Tj
0 -16 Td
(These will show up on your dashboard and in the Assignments tab.) Tj
0 -16 Td
(Check for new assignments regularly.) Tj

/F1 14 Tf
0 -40 Td
(Check Your Progress) Tj
/F2 11 Tf
0 -20 Td
(Tap the Progress tab to see how you're doing by category:) Tj
0 -16 Td
(baserunning, fielding, hitting, and general softball knowledge.) Tj
0 -16 Td
(Tap the Leaderboard tab to see where you rank on your team!) Tj
ET
endstream
endobj

xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000459 00000 n
0000000272 00000 n
0000000369 00000 n

trailer
<< /Size 7 /Root 1 0 R >>
startxref
2713
%%EOF`;
}

writeFileSync("SoftballIQ-Coach-Guide.pdf", generateCoachPDF());
writeFileSync("SoftballIQ-Player-Guide.pdf", generatePlayerPDF());

console.log("Generated:");
console.log("  SoftballIQ-Coach-Guide.pdf");
console.log("  SoftballIQ-Player-Guide.pdf");
