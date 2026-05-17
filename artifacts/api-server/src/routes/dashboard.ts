import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db, childrenTable, activitiesTable, memoriesTable } from "@workspace/db";
import { GetDashboardResponse } from "@workspace/api-zod";
import { calculateAge } from "../lib/guidance";

const router: IRouter = Router();

router.get("/dashboard", async (req, res): Promise<void> => {
  const children = await db
    .select()
    .from(childrenTable)
    .where(eq(childrenTable.userId, req.userId!))
    .orderBy(childrenTable.createdAt);

  const childIds = children.map((c) => c.id);

  if (childIds.length === 0) {
    res.json(
      GetDashboardResponse.parse({
        totalChildren: 0,
        totalMemories: 0,
        totalActivities: 0,
        completedActivities: 0,
        recentMemories: [],
        childrenSummary: [],
      })
    );
    return;
  }

  const [allActivities, recentMemories, totalMemoriesResult] = await Promise.all([
    db.select().from(activitiesTable).where(
      childIds.length === 1
        ? eq(activitiesTable.childId, childIds[0])
        : eq(activitiesTable.childId, childIds[0])
    ),
    db
      .select()
      .from(memoriesTable)
      .where(eq(memoriesTable.childId, childIds[0]))
      .orderBy(desc(memoriesTable.date))
      .limit(5),
    db.select({ value: count() }).from(memoriesTable).where(eq(memoriesTable.childId, childIds[0])),
  ]);

  const allActivitiesAll = await Promise.all(
    childIds.map((id) => db.select().from(activitiesTable).where(eq(activitiesTable.childId, id)))
  ).then((results) => results.flat());

  const recentMemoriesAll = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.childId, childIds[0]))
    .orderBy(desc(memoriesTable.date))
    .limit(5);

  const allRecentMemories = (
    await Promise.all(
      childIds.map((id) =>
        db
          .select()
          .from(memoriesTable)
          .where(eq(memoriesTable.childId, id))
          .orderBy(desc(memoriesTable.date))
          .limit(5)
      )
    )
  )
    .flat()
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 5);

  const totalMemoriesAll = await Promise.all(
    childIds.map((id) =>
      db.select({ value: count() }).from(memoriesTable).where(eq(memoriesTable.childId, id))
    )
  );
  const totalMemories = totalMemoriesAll.reduce((sum, r) => sum + Number(r[0]?.value ?? 0), 0);
  const completedActivities = allActivitiesAll.filter((a) => a.completed).length;

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

  const serializeMemory = (m: (typeof allRecentMemories)[number]) => ({
    ...m,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  });

  res.json(
    GetDashboardResponse.parse({
      totalChildren: children.length,
      totalMemories,
      totalActivities: allActivitiesAll.length,
      completedActivities,
      recentMemories: allRecentMemories.map(serializeMemory),
      childrenSummary,
    })
  );
});

export default router;
