import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, childrenTable } from "@workspace/db";
import {
  GetChildParams,
  GetChildResponse,
  CreateChildBody,
  UpdateChildParams,
  UpdateChildBody,
  UpdateChildResponse,
  DeleteChildParams,
  ListChildrenResponse,
  GetChildGuidanceParams,
  GetChildGuidanceResponse,
} from "@workspace/api-zod";
import { calculateAge, getGuidanceForAge } from "../lib/guidance";

const router: IRouter = Router();

type DbChild = typeof childrenTable.$inferSelect;

const serialize = (c: DbChild) => ({
  ...c,
  createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
});

router.get("/children", async (req, res): Promise<void> => {
  const children = await db.select().from(childrenTable).orderBy(childrenTable.createdAt);
  res.json(ListChildrenResponse.parse(children.map(serialize)));
});

router.post("/children", async (req, res): Promise<void> => {
  const parsed = CreateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [child] = await db.insert(childrenTable).values(parsed.data).returning();
  res.status(201).json(GetChildResponse.parse(serialize(child)));
});

router.get("/children/:id", async (req, res): Promise<void> => {
  const params = GetChildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, params.data.id));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  res.json(GetChildResponse.parse(serialize(child)));
});

router.patch("/children/:id", async (req, res): Promise<void> => {
  const params = UpdateChildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [child] = await db
    .update(childrenTable)
    .set(parsed.data)
    .where(eq(childrenTable.id, params.data.id))
    .returning();
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  res.json(UpdateChildResponse.parse(serialize(child)));
});

router.delete("/children/:id", async (req, res): Promise<void> => {
  const params = DeleteChildParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [child] = await db.delete(childrenTable).where(eq(childrenTable.id, params.data.id)).returning();
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/children/:id/guidance", async (req, res): Promise<void> => {
  const params = GetChildGuidanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [child] = await db.select().from(childrenTable).where(eq(childrenTable.id, params.data.id));
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }
  const { ageYears, ageMonths } = calculateAge(child.birthdate);
  const guidance = getGuidanceForAge(ageYears, ageMonths);
  res.json(
    GetChildGuidanceResponse.parse({
      childId: child.id,
      ageYears,
      ageMonths,
      ...guidance,
    })
  );
});

export default router;
