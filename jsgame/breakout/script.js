// html上で、id="myCanvas"のやつをget
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// メインカラー
const mainColor = "#0095DD";

// ボールの初期位置設定
const initBallX = canvas.width / 2;
const initBallY = canvas.height - 30;
let ballX = initBallX;
let ballY = initBallY;

// ボールの速度設定
const initBallDeltaX = 3;
const initBallDeltaY = -3;
let dx = initBallDeltaX;
let dy = initBallDeltaY;

//ボールの大きさ色設定
const ballRadius = 10;

// 色設定
let currentBallColor = mainColor;

// パドル（棒）設定
const paddleHeight = 10;
const paddleWidth = 75;
const initPaddleX = (canvas.width - paddleWidth) / 2;
// パドル左端をパドルのｘ座標とする
let paddleX = initPaddleX;
let paddleSpeed = 10;

// ブロックの個数
const brickRowCount = 3;
const brickColumnCount = 5;
// ブロックの大きさ
const brickWidth = 75;
const brickHeight = 20;
// ブロック同士の位置関係
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// スコア
let score = 0;
// ライフ
let lives = 3;
// 操作に関わる部分
let rightPressed = false;
let leftPressed = false;
let escapePressed = false;

// bricks配列を定義、二次元配列、bricks[c][r]に入っている各要素がオブジェクト
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
	bricks[c] = [];
	for (let r = 0; r < brickRowCount; r++) {
		// オブジェクトの初期化
		// 二次元配列bricksのr行c列の中身は
		// x: 0, y: 0, status: 1  という3つのプロパティを持つオブジェクト
		bricks[c][r] = { x: 0, y: 0, status: 1 };
	}
}

// rgbランダム色生成器
function genRandColor() {
	return "rgb("
		+ Math.floor(Math.random() * 256)
		+ ","
		+ Math.floor(Math.random() * 256)
		+ ","
		+ Math.floor(Math.random() * 256)
		+ ")"
}

// ボールの描画
function drawBall() {
	ctx.beginPath();
	ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
	ctx.fillStyle = currentBallColor;
	ctx.fill();
	ctx.closePath();
}

// パドルの描画
function drawPaddle() {
	ctx.beginPath();
	ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
	ctx.fillStyle = mainColor;
	ctx.fill();
	ctx.closePath();
}

// ブロックの描画
function drawBricks() {
	for (let c = 0; c < brickColumnCount; c++) {
		for (let r = 0; r < brickRowCount; r++) {
			// その位置のブロックが壊れていなければ描画
			if (bricks[c][r].status === 1) {
				// ループごとに座標をずらす
				const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
				const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
				bricks[c][r].x = brickX;
				bricks[c][r].y = brickY;

				// 指定座標に描画する
				ctx.beginPath();
				ctx.rect(brickX, brickY, brickWidth, brickHeight);
				ctx.fillStyle = mainColor;
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}

// スコア描画
function drawScore() {
	ctx.font = "16px Arial";
	ctx.fillStyle = mainColor;
	ctx.fillText(`Score: ${score}`, 8, 20);
}

// ライフ描画
function drawLives() {
	ctx.font = "16px Arial";
	ctx.fillStyle = mainColor;
	ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}


// イベントリスナー（イベントを検出するやつ）を準備する
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// イベントハンドラ… e ←キーやマウスのイベントを監視
// イベントが発生したら各々判定して一致したら当該プログラム実行

// キーダウンイベントハンドラ
function keyDownHandler(e) {
	console.log(e.key);// debug
	if (e.key === "Right" || e.key === "ArrowRight") {
		rightPressed = true;
	} else if (e.key === "Left" || e.key === "ArrowLeft") {
		leftPressed = true;
	}
	// 追記、エスケープでアラート疑似的にポーズ
	else if (e.key === "Escape") {
		escapePressed = true;
	}
}

// キーアップイベントハンドラ
function keyUpHandler(e) {
	console.log(e.key);// debug
	if (e.key === "Right" || e.key === "ArrowRight") {
		rightPressed = false;
	} else if (e.key === "Left" || e.key === "ArrowLeft") {
		leftPressed = false;
	}
	// 追記、エスケープでアラート疑似的にポーズ
	else if (e.key === "Escape") {
		escapePressed = false;
	}
}

// マウスイベントハンドラ
function mouseMoveHandler(e) {
	console.log(e.clientX);// debug
	// 内容はキー操作と同じ、左右の移動幅を制限
	// マウスが動いたときに検知する
	const relativeX = e.clientX - canvas.offsetLeft;
	if (relativeX > 0 && relativeX < canvas.width) {
		// マウスの位置からパドル半分左へずらした位置に移動（真ん中になるように）
		paddleX = relativeX - paddleWidth / 2;
	}
}

// 衝突検出
function collisionDetection() {
	for (let c = 0; c < brickColumnCount; c++) {
		for (let r = 0; r < brickRowCount; r++) {
			const b = bricks[c][r];
			if (b.status === 1) {
				if (
					ballX > b.x &&
					ballX < b.x + brickWidth &&
					ballY > b.y &&
					ballY < b.y + brickHeight
				) {
					dy = -dy;
					b.status = 0;
					score++;

					// 全部壊したら
					if (score === brickRowCount * brickColumnCount) {
						alert("YOU WIN, CONGRATULATIONS!");
						document.location.reload();
						clearInterval(interval); // Needed for Chrome to end game
					}
					// ランダムに色を変える
					currentBallColor = genRandColor();

				}
			}
		}
	}
}

// メインループ
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawBall();
	drawPaddle();
	drawBricks();
	drawScore();
	drawLives();
	collisionDetection();

	// 左右の壁で反転
	if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
		dx = -dx;
		// ランダムに色を変える
		currentBallColor = genRandColor();
	}
	// 上辺に当たった時
	if (ballY + dy < ballRadius) {
		dy = -dy;
	}
	// 下辺に当たった時
	else if (ballY + dy > canvas.height - ballRadius) {
		// 円の中心位置が、パドル左端とパドルの右端の間にあれば跳ね返す
		if (ballX > paddleX && ballX < paddleX + paddleWidth) {
			dy = -dy;
		}
		else {
			// ライフを減らす
			lives--;
			if (!lives) {
				alert("GAME OVER");
				document.location.reload();
				// （１）　クロームがゲームを終了するのに必要
				// clearInterval(interval);
			} else {
				// 初期位置、初期速度に戻す処理
				ballX = initBallX;
				ballY = initBallY;
				dx = initBallDeltaX;
				dy = initBallDeltaY;
				paddleX = initPaddleX;
			}
		}
	}


	// パドルを移動する
	if (rightPressed) {
		paddleX = Math.min(paddleX + paddleSpeed, canvas.width - paddleWidth);
	} else if (leftPressed) {
		paddleX = Math.max(paddleX - paddleSpeed, 0);
	}

	// （次に表示する）座標を更新
	ballX += dx;
	ballY += dy;
	// 自身を呼ぶ
	requestAnimationFrame(draw);
}

// このままだと、アラートを出した後再開する
// setInterval(draw, 10);
// （１）　const にするとページを読み込みなおす？んだと思うわからん
// const interval = setInterval(draw, 10);
draw();