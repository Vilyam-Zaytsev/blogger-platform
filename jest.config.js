// /** @type {import('ts-jest').JestConfigWithTsJest} */
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   // testRegex: "__tests__/.*.e2e.test.ts$",
//   roots: ['<rootDir>/__tests__'], // Директория, где находятся тесты
//   testMatch: [
//       '**/__tests__/**/*.e2e.test.ts',
//       '**/src/common/helpers/__tests__/**.*.unit.test.ts'
//   ],
// }

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'], // Указываем корневые папки
  testMatch: [
    '**/__tests__/**/*.e2e.test.ts',               // Шаблон для e2e тестов
    '**/src/**/*.unit.test.ts'                     // Универсальный шаблон для unit тестов
  ],
  moduleFileExtensions: ['ts', 'js'],              // Расширения файлов для модулей
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',                  // Трансформация TypeScript в JavaScript
  },
};