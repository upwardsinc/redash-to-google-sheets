require('dotenv').load();
const { google } = require('googleapis');
const googleAuth = require('./lib/google-auth');
const queries = require('./config');
const queryToSheet = require('./lib/query-to-sheet');


const createBatches = (queries, batchSize) => {
  const batches = [];
  for (let i = 0; i < queries.length; i += batchSize) {
    batches.push(queries.slice(i, i + batchSize));
  }
  return batches;
};


(async () => {
  try {
    const googleSheets = google.sheets({
      version: 'v4',
      auth: await googleAuth(),
    });

    // Function to process batches of queries
    const processBatch = async (batch) => {
      await Promise.all(batch.map(queryToSheet(googleSheets)));
    };

    const batchSize = 50;
    const batches = createBatches(queries, batchSize);

    for (const batch of batches) {
      await processBatch(batch);
      if (batch !== batches[batches.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 70000));
      }
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
})();
