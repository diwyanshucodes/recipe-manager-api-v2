-- CreateIndex
CREATE INDEX "Ingredient_recipe_id_idx" ON "Ingredient"("recipe_id");

-- CreateIndex
CREATE INDEX "Recipe_user_id_idx" ON "Recipe"("user_id");
