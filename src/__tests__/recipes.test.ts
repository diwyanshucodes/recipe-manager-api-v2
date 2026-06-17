import request from "supertest";
import app from "../app";

describe("Recipe routes", () => {
  let token: string; // shared across all recipe tests

  let recipeId: number;
  beforeAll(async () => {
    // register + login → get token
    await request(app)
      .post("/api/auth/register")
      .send({ email: "recipe@test.com", password: "123456" });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: "recipe@test.com", password: "123456" });

    token = loginResponse.body.token;

    // create recipe — save id for later tests
    const recipeResponse = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Pasta Carbonara",
        description: "Classic Italian pasta",
        prep_time: 30,
        category: "dinner",
        ingredients: [
          { name: "pasta", amount: "200", unit: "grams" },
          { name: "eggs", amount: "3", unit: "whole" },
        ],
      });
    if (recipeResponse.status !== 201) {
      throw new Error(
        `Setup failed: ${recipeResponse.status} ${JSON.stringify(recipeResponse.body)}`,
      );
    }
    recipeId = recipeResponse.body.recipe.id;
  });

  // tests go here — use token in Authorization header
  test("returns 201 for create recipe with ingredients", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Pasta Carbonara",
        description: "Classic Italian pasta",
        prep_time: 30,
        category: "dinner",
        ingredients: [
          { name: "pasta", amount: "200", unit: "grams" },
          { name: "eggs", amount: "3", unit: "whole" },
          { name: "parmesan", amount: "50", unit: "grams" },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body.recipe).toBeDefined();
    expect(response.body.recipe.ingredients).toBeDefined();
  });

  test("returns 400 for create recipe with invalid body", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "", //blank title
        description: "Classic Italian pasta",
        prep_time: 30,
        category: "dinner",
        ingredients: [
          { name: "pasta", amount: "200", unit: "grams" },
          { name: "eggs", amount: "3", unit: "whole" },
          { name: "parmesan", amount: "50", unit: "grams" },
        ],
      });

    expect(response.status).toBe(400);
  });

  test("returns 401 for create recipe without token", async () => {
    const response = await request(app)
      .post("/api/recipes")
      .send({
        title: "Pasta Carbonara",
        description: "Classic Italian pasta",
        prep_time: 30,
        category: "dinner",
        ingredients: [
          { name: "pasta", amount: "200", unit: "grams" },
          { name: "eggs", amount: "3", unit: "whole" },
          { name: "parmesan", amount: "50", unit: "grams" },
        ],
      });

    expect(response.status).toBe(401);
  });

  test("returns recipe array for get recipes", async () => {
    const response = await request(app)
      .get("/api/recipes")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.recipes).toBeDefined();
    expect(Array.isArray(response.body.recipes)).toBe(true);
  });

  test("returns single recipe with id", async () => {
    const response = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.recipe).toBeDefined();
    expect(response.body.recipe.ingredients).toBeDefined();
  });

  test("returns 404 with invalid id", async () => {
    const response = await request(app)
      .get("/api/recipes/500")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Recipe not found");
  });

  test("returns 200 for delete recipe", async () => {
    const response = await request(app)
      .delete(`/api/recipes/${recipeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(`Recipe ${recipeId} deleted`);
  });
});
