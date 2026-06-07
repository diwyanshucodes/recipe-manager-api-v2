import prisma from '../db/prisma'

beforeAll(async() => {
    // clean test data before all tests
    await prisma.ingredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
})

afterAll(async() => {
    //clean up after tests
    await prisma.ingredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await new Promise(resolve => setTimeout(resolve, 500)); // wait for pool to close
});