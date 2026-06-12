import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Runs once per cold start — CREATE IF NOT EXISTS is safe to call repeatedly
let _ready: Promise<void> | null = null;
function ensureReady() {
  if (!_ready) _ready = initTables();
  return _ready;
}

async function initTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS results (
      id               TEXT PRIMARY KEY,
      original         TEXT NOT NULL,
      target_job       TEXT,
      suggestions      TEXT NOT NULL,
      optimized_resume TEXT NOT NULL,
      comparison_html  TEXT NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id              SERIAL PRIMARY KEY,
      result_id       TEXT NOT NULL REFERENCES results(id),
      paddle_order_id TEXT UNIQUE NOT NULL,
      customer_email  TEXT,
      paid_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function saveResult(data: {
  id: string;
  original: string;
  targetJob: string | null;
  suggestions: string;
  optimizedResume: string;
  comparisonHtml: string;
}) {
  await ensureReady();
  await sql`
    INSERT INTO results (id, original, target_job, suggestions, optimized_resume, comparison_html)
    VALUES (${data.id}, ${data.original}, ${data.targetJob}, ${data.suggestions}, ${data.optimizedResume}, ${data.comparisonHtml})
  `;
}

export async function getResult(id: string) {
  await ensureReady();
  const rows = await sql`
    SELECT id, original, target_job, suggestions, optimized_resume, comparison_html, created_at
    FROM results WHERE id = ${id}
  `;
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: r.id as string,
    original: r.original as string,
    targetJob: r.target_job as string | null,
    suggestions: r.suggestions as string,
    optimizedResume: r.optimized_resume as string,
    comparisonHtml: r.comparison_html as string,
    createdAt: new Date(r.created_at as string).getTime(),
  };
}

export async function savePaidState(
  resultId: string,
  paddleOrderId: string,
  customerEmail: string | null,
) {
  await ensureReady();
  await sql`
    INSERT INTO payments (result_id, paddle_order_id, customer_email)
    VALUES (${resultId}, ${paddleOrderId}, ${customerEmail})
    ON CONFLICT (paddle_order_id) DO NOTHING
  `;
}

export async function isPaid(resultId: string): Promise<boolean> {
  await ensureReady();
  const rows = await sql`SELECT 1 FROM payments WHERE result_id = ${resultId} LIMIT 1`;
  return rows.length > 0;
}
