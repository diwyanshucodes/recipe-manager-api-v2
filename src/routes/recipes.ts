import express from "express";
import { AppError } from "../middleware/errorHandler";
import prisma from "../db/prisma";
import requireAuth from "../middleware/requireAuth";
import { RecipeSchema } from "../schemas/recipe.schema";
import upload from "../middleware/upload";
import { uploadToCloudinary } from "../lib/uploadToCloudinary";
const router = express.Router();

router.use(requireAuth);

//get all recipes without ingredients
router.get("/", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const categoryFilter = typeof category === "string" ? category : undefined;
    const searchFilter = typeof search === "string" ? search : undefined;
    const result = await prisma.recipe.findMany({
      where: {
        user_id: req.user!.userId,
        category: categoryFilter ?? undefined,
        title: searchFilter
          ? { contains: searchFilter, mode: "insensitive" }
          : undefined,
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ recipes: result });
  } catch (err) {
    next(err);
  }
});
//get one recipe
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe_id = parseInt(id);
    if (isNaN(recipe_id)) throw new AppError("Invalid id", 400);
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipe_id,
        user_id: req.user!.userId,
      },
      include: { ingredients: true },
    });
    if (!recipe) {
      throw new AppError("Recipe not found", 404);
    }
    res.json({ recipe });
  } catch (err) {
    next(err);
  }
});

//add a recipe
router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    // parse ingredients if it comes as a string (form-data)
    if (typeof req.body.ingredients === "string") {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }

    const result = RecipeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
      // keep this as a direct response — Zod errors aren't AppErrors
    }
    const { title, description, prep_time, category, ingredients } =
      result.data;

    let image_url: string | undefined;
    if (req.file) {
      image_url = await uploadToCloudinary(req.file.buffer, "recipes");
    }
    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        prep_time,
        category,
        user_id: req.user!.userId,
        image_url,
        ingredients: {
          create: ingredients.map((i) => ({
            name: i.name,
            amount: i.amount,
            unit: i.unit,
          })),
        },
      },
      include: {
        ingredients: true,
      },
    });

    res.status(201).json({ recipe });
  } catch (err) {
    next(err);
  }
});

//update a recipe
router.put("/:id", upload.single("image"), async (req, res, next) => {
  try {
    const id = req.params.id as string;
    const recipe_id = parseInt(id);
    if (isNaN(recipe_id)) throw new AppError("Invalid id", 400);
    // parse ingredients if it comes as a string (form-data)
    if (typeof req.body.ingredients === "string") {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    }

    const result = RecipeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
      // keep this as a direct response — Zod errors aren't AppErrors
    }
    const { title, description, prep_time, category, ingredients } =
      result.data;

    let image_url: string | undefined;
    if (req.file) {
      image_url = await uploadToCloudinary(req.file.buffer, "recipes");
    }
    await prisma.$transaction(async (tx) => {
      // step 1 — delete old ingredients
      await tx.ingredient.deleteMany({ where: { recipe_id } });
      // step 2 — update recipe fields only
      await tx.recipe.update({
        data: {
          title,
          description,
          prep_time,
          category,
          ...(image_url && { image_url }),
        },
        where: {
          id: recipe_id,
          user_id: req.user!.userId,
        },
      });

      // step 3 — insert new ingredients
      await tx.ingredient.createMany({
        data: ingredients.map((i) => ({
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          recipe_id,
        })),
      });
    });

    const final = await prisma.recipe.findUnique({
      where: { id: recipe_id },
      include: { ingredients: true },
    });

    res.json({ recipe: final });
  } catch (err) {
    next(err);
  }
});

//delete a recipe
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe_id = parseInt(id);
    if (isNaN(recipe_id)) throw new AppError("Invalid id", 400);
    await prisma.recipe.delete({
      where: {
        id: recipe_id,
        user_id: req.user!.userId,
      },
    });

    res.json({ message: `Recipe ${id} deleted` });
  } catch (err) {
    next(err);
  }
});

export default router;
