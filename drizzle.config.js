
/** @type { import("drizzle-kit").Config } */
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.js",
  dbCredentials: {
    url: "postgresql://postgres:123@localhost:5432/projectplanner",
  },
};

// url: "postgresql://postgres:123@localhost:5432/projectplanner"
// postgres:123     postgres - имя пользователя, 123 - пароль
