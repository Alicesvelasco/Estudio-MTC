/// <reference types="vite/client" />

declare module 'virtual:tests' {
  const tests: import('./domain/types').Test[]
  export default tests
}
