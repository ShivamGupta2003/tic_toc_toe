let boxes = document.querySelectorAll(".box");
let turno = true; // Player 'O' starts first

const winningPositions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let board = Array(9).fill(null); // Array to store moves

// Function to check if there's a winner
function checkWinner() {
  for (let positions of winningPositions) {
    const [a, b, c] = positions;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // Returns 'X' or 'O'
    }
  }
  return null; // No winner yet
}

// Event listener for each box (cell in the game grid)
boxes.forEach((box, index) => {
  box.addEventListener("click", () => {
    console.log("Button clicked");

    if (board[index] !== null) return; // Prevent marking an already filled box

    // Mark the box with 'O' or 'X' depending on the turn
    if (turno) {
      box.innerHTML = "O";
      board[index] = "O";
      turno = false; // Switch turn to Player 2 (X)
    } else {
      box.innerHTML = "X";
      board[index] = "X";
      turno = true; // Switch turn to Player 1 (O)
    }

    const win = checkWinner(); // Check if there's a winner
    if (win) {
      // Determine which player won (assuming Player 1 is 'O' and Player 2 is 'X')
      let winner = win === "O" ? "Player 1" : "Player 2";

      alert(`${winner} wins!`); // Notify the user of the winner

      // Send the winner data to the backend
      fetch("/update-game-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winner: winner, // Send winner's name
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message); // Show success message
          window.location.href = "/game-over"; // Redirect to result page
        })
        .catch((error) => {
          console.error("Error updating the winner:", error);
          alert("There was an error updating the game result.");
        });

      return; // Stop the game after a winner has been determined
    }

    // If all boxes are filled and no winner, it's a tie
    if (!board.includes(null)) {
      alert("It's a tie!"); // Notify the user of a tie

      // Send tie result to the backend
      fetch("/update-game-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          winner: "Tie", // Send 'Tie' as the result
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          alert(data.message); // Show tie message
          window.location.href = "/game-over"; // Redirect to result page
        })
        .catch((error) => {
          console.error("Error processing tie:", error);
          alert("There was an error processing the tie.");
        });
    }
  });
});
