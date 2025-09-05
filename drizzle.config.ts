import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRESQL_HOST!,
    port: Number(process.env.POSTGRESQL_PORT || 5432),
    user: process.env.POSTGRESQL_USER!,
    password: String(process.env.POSTGRESQL_PASSWORD || ''),
    database: process.env.POSTGRESQL_DBNAME!,
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  },
  migrations: {
    schema: 'public',
    table: 'drizzle_migrations',
  },
} satisfies Config


