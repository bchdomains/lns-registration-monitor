import { time } from 'console';
import express from 'express';
import * as fs from 'fs'
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`APP_LOG::App listening on port ${PORT}`);
});

module.exports = app;


const interval = parseInt(process.env.INTERVAL) || 5000; // 5 seconds interval
const fileName = "lastCheck"
let timestamp = fs.readFileSync(fileName, "utf-8");
setInterval(async () => {
  // https://graph.bch.domains/subgraphs/name/graphprotocol/ens/graphql?query=%7Bregistrations(where%3A%7BregistrationDate_gte%3A%221647525065%22%7D)%7BlabelName%2Ccost%2CregistrationDate%2CexpiryDate%7D%7D
  const response = await fetch("https://graph.bch.domains/subgraphs/name/graphprotocol/ens", {
    "headers": {
      "accept": "application/json",
      "content-type": "application/json",
    },
    "body": `{\"query\":\"{registrations(where:{registrationDate_gte:\\\"${timestamp}\\\"}){labelName,cost,registrationDate,expiryDate}}\",\"variables\":null,\"operationName\":null}`,
    "method": "POST"
  });
  const json: any = await response.json();
  const registrations = json?.data?.registrations;
  if (registrations?.length) {
    // handler
    console.log(timestamp, registrations)
  }

  fs.writeFileSync(fileName, timestamp, "utf-8");
  timestamp = String(Math.round(Date.now()/1000));
}, interval);
