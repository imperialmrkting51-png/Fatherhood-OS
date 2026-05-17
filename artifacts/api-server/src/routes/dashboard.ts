import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db, childrenTable, activitiesTable, memoriesTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";
import { calculateAge } from "../lib/guidance";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const [children, allActivities, recentMemories] = await Promise.all([
    db.select().from(childrenTable).orderBy(childrenTable.createdAt),
    db.select().from(activitiesTable),
    db.select().from(memoriesTable).orderBy(desc(memoriesTable.date)).limit(5),
  ]);

  const totalMemoriesResult = await db.select({ value: count() }).from(memoriesTable);
  const totalMemories = totalMemoriesResult[0]?.value ?? 0;

  const completedActivities = allActivities.filter((a) => a.completed).length;

  const childrenSummary = await Promise.all(
    children.map(async (child) => {
      const [memCount, actCount] = await Promise.all([
        db.select({ value: count() }).from(memoriesTable).where(eq(memoriesTable.childId, child.id)),
        db.select({ value: count() }).from(activitiesTable).where(eq(activitiesTable.childId, child.id)),
      ]);
      const { ageYears, ageMonths } = calculateAge(child.birthdate);
      return {
        id: child.id,
        name: child.name,
        ageYears,
        ageMonths,
        avatarColor: child.avatarColor,
        memoryCount: Number(memCount[0]?.value ?? 0),
        activityCount: Number(actCount[0]?.value ?? 0),
      };
    })
  );

  const serializeMemory = (m: typeof recentMemories[number]) => ({
    ...m,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  });

  res.json(
    GetDashboardResponse.parse({
      totalChildren: children.length,
      totalMemories: Number(totalMemories),
      totalActivities: allActivities.length,
      completedActivities,
      recentMemories: recentMemories.map(serializeMemory),
      childrenSummary,
    })
  );
});

export default router;
