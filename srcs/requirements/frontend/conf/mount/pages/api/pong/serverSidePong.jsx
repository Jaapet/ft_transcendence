let gameState = {
	objects: {
	  ball: {
		position: { x: 0, y: 2, z: 4 },
		rotation: { x: 0, y: 0, z: 0 },
		direction: { x: 0.99999, z: 0.00001 }
	  }
	},
	raquettes: {
	  player1: {
		position: { x: -43, y: 2, z: 0 }
	  },
	  player2: {
		position: { x: 43, y: 2, z: 0 }
	  }
	}
  };
  
  const raquettesMove = {
	player1: 0,
	player2: 0
  };
  
  function updateGame() {
	const ball = gameState.objects.ball;
	const speed = 1;
  
	ball.position.x += speed * ball.direction.x;
	ball.position.z += speed * ball.direction.z;
  
	// Ball collision with walls
	if (ball.position.z >= 20 || ball.position.z <= -20) {
	  ball.direction.z = -ball.direction.z;
	}
  
	// Ball collision with paddles
	const player1 = gameState.raquettes.player1;
	const player2 = gameState.raquettes.player2;
	if (
	  (ball.position.x <= player1.position.x + 2 && ball.position.z <= player1.position.z + 5 && ball.position.z >= player1.position.z - 5) ||
	  (ball.position.x >= player2.position.x - 2 && ball.position.z <= player2.position.z + 5 && ball.position.z >= player2.position.z - 5)
	) {
	  ball.direction.x = -ball.direction.x;
	}
  
	// Ball out of bounds
	if (ball.position.x >= 43 || ball.position.x <= -43) {
	  //console.log('Ball out of bounds!');
	  // Reset ball position
	  ball.position = { x: 0, y: 2, z: 4 };
	  ball.direction = { x: 0.99999, z: 0.00001 };
	}
  
	// Update paddle positions
	player1.position.z += raquettesMove.player1;
	player2.position.z += raquettesMove.player2;
  
	// Limit paddle movement
	if (player1.position.z > 16) player1.position.z = 16;
	if (player1.position.z < -16) player1.position.z = -16;
	if (player2.position.z > 16) player2.position.z = 16;
	if (player2.position.z < -16) player2.position.z = -16;
  }
  
  module.exports = updateGame;
  