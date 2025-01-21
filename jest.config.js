/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // testRegex: "__tests__/.*.e2e.test.ts$",
  roots: ['<rootDir>/__tests__'], // Директория, где находятся тесты
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)', // Путь к тестам
    '**/?(*.)+(spec|test).[jt]s?(x)', // Альтернативный формат названия файлов
  ],
}