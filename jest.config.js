module.exports = {
  preset: "ts-jest",
  // tells Jest to use ts-jest transformer
  // so it understands TypeScript files directly
  // without this Jest only understands plain JS

  testEnvironment: "node",
  // run tests in Node environment (not browser/jsdom)
  // your Express app runs in Node — match that

  testMatch: ["**/__tests__/**/*.test.ts"],
  // which files are test files
  // ** = any folder depth
  // __tests__ = folder named __tests__
  // *.test.ts = any file ending in .test.ts

  setupFilesAfterEnv: ['./src/__tests__/setup.ts'],
  // run setup.ts before each test file
  // where you put beforeAll/afterAll cleanup


  testTimeout: 10000,
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
  }
};
