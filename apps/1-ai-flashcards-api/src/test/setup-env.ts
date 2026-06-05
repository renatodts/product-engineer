// Loads environment for integration tests. `.env.test` (a dedicated test database)
// takes precedence; neither file overrides variables already present in the
// environment (e.g. DATABASE_URL injected by the CI Postgres service container).
import { config } from 'dotenv';

config({ path: '.env.test' });
config({ path: '.env' });
