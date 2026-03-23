import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { teamMembers, teams, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [membership] = await db
    .select({
      teamName: teams.name,
      joinCode: teams.joinCode,
      ageGroup: teams.ageGroup,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teams.id, teamMembers.teamId))
    .where(eq(teamMembers.userId, session.user.id))
    .limit(1);

  if (!membership || membership.role !== "coach") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Get player names for the roster
  const players = await db
    .select({ displayName: profiles.displayName })
    .from(teamMembers)
    .innerJoin(profiles, eq(profiles.id, teamMembers.userId))
    .where(
      and(
        eq(teamMembers.teamId, (await db.select({ teamId: teamMembers.teamId }).from(teamMembers).where(eq(teamMembers.userId, session.user.id)).limit(1))[0].teamId),
        eq(teamMembers.role, "player")
      )
    );

  const joinUrl = `https://softballiq.app/join?code=${membership.joinCode}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(joinUrl)}&format=png`;

  // Fetch QR code image
  const qrResponse = await fetch(qrUrl);
  const qrBuffer = await qrResponse.arrayBuffer();
  const qrBase64 = Buffer.from(qrBuffer).toString("base64");
  const qrDataUrl = `data:image/png;base64,${qrBase64}`;

  // Fetch logo
  let logoDataUrl = "";
  try {
    const logoResponse = await fetch("https://softballiq.app/logo.png");
    const logoBuffer = await logoResponse.arrayBuffer();
    const logoBase64 = Buffer.from(logoBuffer).toString("base64");
    logoDataUrl = `data:image/png;base64,${logoBase64}`;
  } catch {
    // Logo fetch failed, continue without it
  }

  // Generate PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Colors
  const gold: [number, number, number] = [201, 162, 39];
  const dark: [number, number, number] = [26, 26, 46];
  const gray: [number, number, number] = [120, 120, 140];
  const white: [number, number, number] = [255, 255, 255];

  // Background
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

  // Gold header bar
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Team name in header
  doc.setTextColor(...dark);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(membership.teamName, centerX, 20, { align: "center" });

  // Age group
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${membership.ageGroup} Softball`, centerX, 30, { align: "center" });

  // Logo
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", centerX - 30, 48, 60, 18);
    } catch {
      // Logo failed, skip
    }
  }

  // "Join Us" title
  doc.setTextColor(...white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Join Us on Softball IQ", centerX, 82, { align: "center" });

  doc.setTextColor(...gray);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Practice your game IQ with daily quizzes", centerX, 90, { align: "center" });

  // QR Code
  try {
    doc.addImage(qrDataUrl, "PNG", centerX - 30, 98, 60, 60);
  } catch {
    doc.setTextColor(...white);
    doc.text("QR Code", centerX, 128, { align: "center" });
  }

  // Scan instructions
  doc.setTextColor(...gray);
  doc.setFontSize(10);
  doc.text("Scan the QR code with your phone camera", centerX, 166, { align: "center" });

  // Divider with "or"
  doc.setDrawColor(80, 80, 100);
  doc.line(30, 175, centerX - 10, 175);
  doc.line(centerX + 10, 175, pageWidth - 30, 175);
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("or", centerX, 177, { align: "center" });

  // Manual join
  doc.setTextColor(...white);
  doc.setFontSize(11);
  doc.text("Go to softballiq.app/join", centerX, 187, { align: "center" });

  doc.setTextColor(...gray);
  doc.setFontSize(9);
  doc.text("and enter the team code:", centerX, 194, { align: "center" });

  // Join code box
  doc.setDrawColor(...gold);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.roundedRect(centerX - 30, 198, 60, 16, 3, 3, "S");
  doc.setLineDashPattern([], 0);

  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(membership.joinCode, centerX, 209, { align: "center" });

  // Instructions box
  const instructionsY = 222;
  doc.setFillColor(35, 35, 55);
  doc.roundedRect(25, instructionsY, pageWidth - 50, 42, 3, 3, "F");

  doc.setTextColor(...gold);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("HOW TO JOIN", 32, instructionsY + 8);

  doc.setTextColor(...white);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const steps = [
    "1.  Scan the QR code or go to softballiq.app/join",
    "2.  Find your name on the roster and tap it",
    "3.  Start your first Daily Rep \u2014 5 questions a day!",
  ];
  steps.forEach((step, i) => {
    doc.text(step, 32, instructionsY + 17 + i * 8);
  });

  // Roster section (if players exist)
  if (players.length > 0) {
    const rosterY = 272;
    doc.setFillColor(35, 35, 55);
    const rosterHeight = Math.min(12 + players.length * 6, 50);
    doc.roundedRect(25, rosterY, pageWidth - 50, rosterHeight, 3, 3, "F");

    doc.setTextColor(...gold);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TEAM ROSTER \u2014 FIND YOUR NAME", 32, rosterY + 8);

    doc.setTextColor(...white);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const names = players.map((p) => p.displayName).join("  \u2022  ");
    const splitNames = doc.splitTextToSize(names, pageWidth - 70);
    splitNames.slice(0, 4).forEach((line: string, i: number) => {
      doc.text(line, 32, rosterY + 16 + i * 5);
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(8);
  doc.text("Free softball game IQ training for 8U\u201314U  \u2022  softballiq.app", centerX, footerY, { align: "center" });

  // Output
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${membership.teamName.replace(/[^a-zA-Z0-9 ]/g, "")}-SoftballIQ.pdf"`,
    },
  });
}
