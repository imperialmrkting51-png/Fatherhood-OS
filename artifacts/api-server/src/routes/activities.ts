import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, activitiesTable, childrenTable } from "@workspace/db";
import {
  ListChildActivitiesParams,
  ListChildActivitiesResponse,
  CreateChildActivityParams,
  CreateChildActivityBody,
  UpdateActivityParams,
  UpdateActivityBody,
  UpdateActivityResponse,
  DeleteActivityParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbActivity = typeof activitiesTable.$inferSelect;

const serialize = (a: DbActivity) => ({
  ...a,
  createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
});

router.get("/children/:id/activities", async (req, res): Promise<void> => {
  const params = ListChildActivitiesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [child] = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, params.data.id), eq(childrenTable.userId, req.userId!)));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  const activities = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.childId, params.data.id))
    .orderBy(activitiesTable.createdAt);
  res.json(ListChildActivitiesResponse.parse(activities.map(serialize)));
});

router.post("/children/:id/activities", async (req, res): Promise<void> => {
  const params = CreateChildActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateChildActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [child] = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, params.data.id), eq(childrenTable.userId, req.userId!)));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  const [activity] = await db
    .insert(activitiesTable)
    .values({ ...parsed.data, childId: params.data.id })
    .returning();
  res.status(201).json(serialize(activity));
});

router.patch("/activities/:id", async (req, res): Promise<void> => {
  const params = UpdateActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateActivityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  const [childOwner] = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, existing.childId), eq(childrenTable.userId, req.userId!)));
  if (!childOwner) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  const [activity] = await db
    .update(activitiesTable)
    .set(parsed.data)
    .where(eq(activitiesTable.id, params.data.id))
    .returning();
  res.json(UpdateActivityResponse.parse(serialize(activity)));
});

router.delete("/activities/:id", async (req, res): Promise<void> => {
  const params = DeleteActivityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  const [childOwner] = await db
    .select()
    .from(childrenTable)
    .where(and(eq(childrenTable.id, existing.childId), eq(childrenTable.userId, req.userId!)));
  if (!childOwner) {
    res.status(404).json({ error: "Activity not found" });
    return;
  }
  await db.delete(activitiesTable).where(eq(activitiesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
