import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, memoriesTable, childrenTable } from "@workspace/db";
import {
  ListChildMemoriesParams,
  ListChildMemoriesResponse,
  CreateChildMemoryParams,
  CreateChildMemoryBody,
  GetMemoryParams,
  GetMemoryResponse,
  UpdateMemoryParams,
  UpdateMemoryBody,
  UpdateMemoryResponse,
  DeleteMemoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

type DbMemory = typeof memoriesTable.$inferSelect;

const serialize = (m: DbMemory) => ({
  ...m,
  createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
});

router.get("/children/:id/memories", async (req, res): Promise<void> => {
  const params = ListChildMemoriesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, params.data.id));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  const memories = await db
    .select()
    .from(memoriesTable)
    .where(eq(memoriesTable.childId, params.data.id))
    .orderBy(desc(memoriesTable.date));
  res.json(ListChildMemoriesResponse.parse(memories.map(serialize)));
});

router.post("/children/:id/memories", async (req, res): Promise<void> => {
  const params = CreateChildMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateChildMemoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, params.data.id));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  const [memory] = await db
    .insert(memoriesTable)
    .values({ ...parsed.data, childId: params.data.id })
    .returning();
  res.status(201).json(serialize(memory));
});

router.get("/memories/:id", async (req, res): Promise<void> => {
  const params = GetMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [memory] = await db.select().from(memoriesTable).where(eq(memoriesTable.id, params.data.id));
  if (!memory) {
    res.status(404).json({ error: "Memory not found" });
    return;
  }
  res.json(GetMemoryResponse.parse(serialize(memory)));
});

router.patch("/memories/:id", async (req, res): Promise<void> => {
  const params = UpdateMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMemoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [memory] = await db
    .update(memoriesTable)
    .set(parsed.data)
    .where(eq(memoriesTable.id, params.data.id))
    .returning();
  if (!memory) {
    res.status(404).json({ error: "Memory not found" });
    return;
  }
  res.json(UpdateMemoryResponse.parse(serialize(memory)));
});

router.delete("/memories/:id", async (req, res): Promise<void> => {
  const params = DeleteMemoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [memory] = await db
    .delete(memoriesTable)
    .where(eq(memoriesTable.id, params.data.id))
    .returning();
  if (!memory) {
    res.status(404).json({ error: "Memory not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
