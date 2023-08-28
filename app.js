const exp = require("express");
const app = exp();
const { open } = require("sqlite");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
const sqlite3 = require("sqlite3");
app.use(exp.json());
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
    console.log("staart");
  } catch (e) {
    console.log(`Error DB : ${e.message}`);
    process.exit(1);
  }
};

initialize();

app.get("/players/", async (req, resp) => {
  const getplayerq = `SELECT player_id AS playerId,
    player_name AS playerName FROM player_details;`;
  const player = await db.all(getplayerq);
  resp.send(player);
});

app.get("/players/:playerId", async (req, resp) => {
  const { playerId } = req.params;
  const getplayerq = `SELECT player_id AS playerId,
    player_name AS playerName FROM player_details WHERE 
    player_id='${playerId}';`;
  const player = await db.get(getplayerq);
  resp.send(player);
});

app.put("/players/:playerId/", async (req, resp) => {
  const { playerId } = req.params;
  const playerd = req.body;
  const { playerName } = playerd;
  const updateplayer = `UPDATE player_details SET player_name='${playerName}'
     WHERE player_id='${playerId}';`;
  await db.run(updateplayer);
  resp.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (req, resp) => {
  const { matchId } = req.params;
  const matchq = `SELECT match_id AS matchId, match,year FROM match_details
    WHERE match_id='${matchId}';`;
  const match = await db.get(matchq);
  resp.send(match);
});

app.get("/players/:playerId/matches", async (req, resp) => {
  const { playerId } = req.params;
  const getmatch = `SELECT match_id AS matchId , match , year 
    FROM player_match_score NATURAL JOIN match_details
    WHERE player_id='${playerId}';`;
  const match = await db.all(getmatch);
  resp.send(match);
});

app.get("/matches/:matchId/players", async (req, resp) => {
  const { matchId } = req.params;
  const getplayer = `SELECT player_id AS playerId , player_name AS playerName
    FROM player_match_score NATURAL JOIN player_details
    WHERE match_id='${matchId}';`;
  const player = await db.all(getplayer);
  resp.send(player);
});

app.get("/players/:playerId/playerScores", async (req, resp) => {
  const { playerId } = req.params;
  const getmatch = `SELECT player_id AS playerId ,player_name AS playerName,
  SUM(score) AS totalScore,SUM(fours) as totalFours,SUM(sixes) AS totalSixes 
    FROM player_match_score NATURAL JOIN player_details
    WHERE player_id='${playerId}';`;
  const sc = await db.get(getmatch);
  resp.send(sc);
});

module.exports = app;
