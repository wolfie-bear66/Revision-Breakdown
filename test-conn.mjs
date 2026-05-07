import pg from 'pg';
const { Client } = pg;
const regions = ['eu-west-1','eu-west-2','eu-central-1','us-east-1','us-west-1','ap-southeast-1'];
for (const region of regions) {
  const c = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    database: 'postgres',
    user: 'postgres.ejvivqhtrnwfijtbarxq',
    password: 'FNsTNB3brmen49tZ',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    await c.connect();
    console.log(`${region}: OK`);
    await c.end();
  } catch (e) {
    console.log(`${region}: FAIL - ${e.message}`);
  }
}
