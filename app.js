const express = require("express");
const app = express();
const port = 3000;
const mysql = require("mysql2");
const { v4: uuidv4 } = require("uuid"); // Import the UUID generator

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mathura@1",
  database: "tic_tac_toe",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the MySQL database.");
  }
});

app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM players`;
  try {
    db.query(q, (err, result) => {
      if (err) {
        throw err;
      }
      let counts = result[0]["count(*)"];
      res.render("home.ejs", { counts });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/players", (req, res) => {
  let q = `SELECT * FROM players `;
  try {
    db.query(q, (err, players) => {
      if (err) {
        throw err;
      }
      //   console.log(result);

      res.render("Alluser.ejs", { players });
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/start", (req, res) => {
  res.render("start.ejs");
});

app.post("/start-game", (req, res) => {
  const player1Name = req.body["player1-name"];
  const player2Name = req.body["player2-name"];
  const player1Symbol = req.body["player1-symbol"];
  const player2Symbol = player1Symbol === "X" ? "O" : "X";
  const gameId = uuidv4();

  const query = `
    INSERT INTO players (id, player1_name, player2_name, player1_symbol, player2_symbol, winner)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [gameId, player1Name, player2Name, player1Symbol, player2Symbol, null],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err.message);
        return res.status(500).send("Error saving the game setup.");
      }

      res.render("index", {
        player1Name,
        player2Name,
        player1Symbol,
        player2Symbol,
        gameId,
        message: "Game is ready!",
      });
    }
  );
});

app.post("/reset-game", (req, res) => {
  const { message, winner, gameId } = req.body;
  console.log(gameId);

  console.log("Message:", message);
  console.log("Winner:", winner);
  const query = `
  UPDATE players
  SET winner = ? 
  WHERE winner IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
`;
  db.query(query, [winner], (err, results) => {
    if (err) {
      console.error("Error updating winner in the database:", err);
      return;
    }
    console.log("Winner updated successfully:");
  });
  res.redirect("finish", { winner });
});

app.get("/end", (req, res) => {
  const { winner } = req.body;
  console.log(winner);
  res.render("finish", { winner });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
