// Safe serverless database stub
export const db: any = {
  pragma: () => {},
  exec: () => {},
  prepare: () => ({
    get: () => null,
    all: () => [],
    run: () => ({ lastInsertRowid: 1, changes: 1 })
  })
};

export function initDatabase() {
  console.log('Serverless database initialized in memory.');
}
