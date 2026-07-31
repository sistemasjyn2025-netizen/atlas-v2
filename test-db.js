const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.fpnzfjpqrmqlwrklhrag:3472436713Nb%21@aws-0-ca-central-1.pooler.supabase.com:5432/postgres",
});

client.connect()
  .then(() => {
    console.log("Connected successfully!");
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log("Query result:", res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
