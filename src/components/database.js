import Dexie from "dexie";

export const db = new Dexie('vpDatabase');  // virtual piano database

db.version(1).stores({
    recordings: 'order, title, duration'
});