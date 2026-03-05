import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import JobCard from "@/lib/models/JobCard";
import User from "@/lib/models/User";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { factoryId, userId } = session.user;
    const jobId = params.id;

    await dbConnect();
    const body = await req.json();
    const { action, taskName } = body; // Action: "Start", "Pause", "Finish"

    const jobCard = await JobCard.findOne({ _id: jobId, factoryId });
    if (!jobCard)
      return NextResponse.json({ error: "JobCard not found" }, { status: 404 });

    // Get actual User to fetch current Hourly Rate
    const user = await User.findById(userId);
    const hourlyRate = user.hourlyRate || 0;

    // Find or create Task
    let task = jobCard.tasks.find((t) => t.taskName === taskName);
    if (!task) {
      jobCard.tasks.push({ taskName, status: "Pending", sessions: [] });
      task = jobCard.tasks[jobCard.tasks.length - 1];
    }

    if (action === "Start") {
      task.status = "In_Progress";
      jobCard.status = "In_Progress";

      // Check for parallel activity factor across other active JobCards for this user
      const activeParallel = await JobCard.countDocuments({
        factoryId,
        "tasks.sessions": {
          $elemMatch: { operatorId: userId, endTime: null },
        },
      });
      const parallelFactor = 1 / (activeParallel + 1);

      task.sessions.push({
        operatorId: userId,
        operatorRate: hourlyRate,
        startTime: new Date(),
        parallelFactor,
      });
    } else if (action === "Pause" || action === "Finish") {
      // Find active session
      const activeSession = task.sessions.find(
        (s) => s.operatorId.toString() === userId && !s.endTime,
      );
      if (!activeSession)
        return NextResponse.json(
          { error: "No active session found" },
          { status: 400 },
        );

      activeSession.endTime = new Date();

      // Calculate duration in minutes
      const diffMs = activeSession.endTime - activeSession.startTime;
      activeSession.durationMinutes = Math.round(diffMs / 60000);

      // Calculate allocated cost
      // formula: (duration_hrs * hourlyRate) * parallelFactor
      const hours = activeSession.durationMinutes / 60;
      activeSession.allocatedCost =
        hours * activeSession.operatorRate * activeSession.parallelFactor;

      // Update Total Labour Cost on JobCard
      jobCard.totalLabourCost += activeSession.allocatedCost;

      if (action === "Finish") {
        task.status = "Completed";
        // Check if all tasks completed to finish job
        const allCompleted = jobCard.tasks.every(
          (t) => t.status === "Completed",
        );
        if (allCompleted) jobCard.status = "Completed";
      }
    }

    await jobCard.save();

    return NextResponse.json({ success: true, jobCard }, { status: 200 });
  } catch (error) {
    console.error("API Error in JobCard Session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
