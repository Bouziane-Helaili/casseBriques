const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.style.border = "5px solid #6198d8";
ctx.lineWidth = 1;

const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 20;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 5;
const SCORE_UNIT = 10;
const MAX_LEVEL = 3;
let leftArrow = false;
let rightArrow = false;
let life = 3;
let score = 0;
let level = 1;
let gameOver = false;
let isPaused = false;

const paddle = {
    x: (canvas.width / 2) - (PADDLE_WIDTH / 2),
    y: canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
    w: PADDLE_WIDTH,
    h: PADDLE_HEIGHT,
    dx: 8
};

const resetPaddle = () => {
    paddle.x = (canvas.width / 2) - (PADDLE_WIDTH / 2);
    paddle.y = canvas.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT;
}

drawPaddle = () => {
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.strokeStyle = "#6198d8";
    ctx.strokeRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.closePath();
}
drawPaddle();

document.addEventListener("keydown", (e) => {
    if (e.key == "Left" || e.key == "ArrowLeft") {
        leftArrow = true;
    } else if (e.key == "Right" || e.key == "ArrowRight") {
        rightArrow = true;
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key == "Left" || e.key == "ArrowLeft") {
        leftArrow = false;
    } else if (e.key == "Right" || e.key == "ArrowRight") {
        rightArrow = false;
    }
});

movePaddle = () => {
    if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx;
    } else if (rightArrow && paddle.x + paddle.w < canvas.width) {
        paddle.x += paddle.dx;
    }
}

const ball = {
    x: canvas.width / 2,
    y: paddle.y - BALL_RADIUS,
    radius: BALL_RADIUS,
    velocity: 7,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3
}

const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#6198d8";
    ctx.stroke();
    ctx.closePath();
}

const moveBall = () => {
    ball.x += ball.dx;
    ball.y += ball.dy;
}


const resetBall = () => {
    ball.x = canvas.width / 2;
    ball.y = paddle.y - BALL_RADIUS;
    ball.dx = 3 * (Math.random() * 2 - 1);
    ball.dy = -3;
}

const brickProp = {
    row: 5,
    column: 13,
    w: 35,
    h: 10,
    padding: 3,
    offsetX: 55,
    offsetY: 40,
    fillColor: "#fff",
    visible: true,
}

let bricks = [];
const createBricks = () => {
    for (let r = 0; r < brickProp.row; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickProp.column; c++) {
            bricks[r][c] = {
                x: c * (brickProp.w + brickProp.padding) + brickProp.offsetX,
                y: r * (brickProp.h + brickProp.padding) + brickProp.offsetY,
                status: true,
                ...brickProp
            }
        }
    }
}

createBricks();

const drawBricks = () => {
    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.status) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.w, brick.h);
                ctx.fillStyle = brick.fillColor;
                ctx.fill();
                ctx.closePath();
            }
        })
    })
}

const ballBrickColision = () => {
    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.status) {
                if ((ball.x + ball.radius > brick.x &&
                    ball.x - ball.radius < brick.x + brick.w &&
                    ball.y + ball.radius > brick.y &&
                    ball.y - ball.radius < brick.y + brick.h)) {
                    BRICK_HIT.play();
                    ball.dy *= -1;
                    brick.status = false;
                    score += SCORE_UNIT;
                }
            }
        })
    })
}

const showStats = (img, iPosX, IposY, text = "", tPosX = null, tPosY = null) => {
    ctx.fillStyle = "#fff";
    ctx.font = "20px serif";
    ctx.fillText(text, tPosX, tPosY);
    ctx.drawImage(img, iPosX, IposY, width = 20, height = 20);
}

//Fin du jeu
const gameover = () => {
    if (life < 0) {
        showEndInfo('lose');
        gameOver = true;
    }
}

const nextLevel = () => {
    let isLevelUp = true;

    for (let r = 0; r < brickProp.row; r++) {
        for (let c = 0; c < brickProp.column; c++) {
            isLevelUp = isLevelUp && !bricks[r][c].status;
        }
    }
    if (isLevelUp) {
        WIN.play();
        if (level >= MAX_LEVEL) {
            showEndInfo();
            gameOver = true;
            return;
        }
        brickProp.row += 2;
        createBricks();
        ball.velocity += 1;
        resetBall();
        resetPaddle();
        level++;
    }
}

const ballWallColision = () => {
     if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        WALL_HIT.play();
        ball.dx *= -1;
    }
    if (ball.y - ball.radius < 0) {
        WALL_HIT.play();
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        LIFE_LOST.play();
        life--;
        resetBall();
        resetPaddle();
    }
}

const ballPaddleColision = () => {
    if (ball.x + ball.radius > paddle.x &&
        ball.x - ball.radius < paddle.x + paddle.w &&
        ball.y + ball.radius > paddle.y) {
        PADDLE_HIT.play();
        let colisionPoint = ball.x - (paddle.x + paddle.w / 2);
        colisionPoint = colisionPoint / (paddle.w / 2);
        let angle = colisionPoint * Math.PI / 3;
        ball.dx = ball.velocity * Math.sin(angle);
        ball.dy = -ball.velocity * Math.cos(angle);
    }
}

const draw = () => {
    drawPaddle();
    drawBall();
    drawBricks();
    showStats(SCORE_IMG, canvas.width - 100, 5, score, canvas.width - 65, 22);
    showStats(LIFE_IMG, 35, 5, life, 70, 22);
    showStats(LEVEL_IMG, canvas.width / 2 - 25, 5, level, canvas.width / 2 - 65, 22);
}

const update = () => {
    movePaddle();
    moveBall();
    ballWallColision();
    ballPaddleColision();
    ballBrickColision();
    gameover();
    nextLevel();
}
loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isPaused) {
        draw();
        update();
    }
    if (!gameOver) {
        requestAnimationFrame(loop);
    }
}
loop();

const sound = document.getElementById("sound");
sound.addEventListener("click", audioManager);

function audioManager() {
    let imgSrc = sound.getAttribute("src");
    let SOUND_IMG = imgSrc === "image/sound_on.png" ? "image/muted.png" : "image/sound_on.png";
    this.src = SOUND_IMG;
    WALL_HIT.muted = !WALL_HIT.muted;
    PADDLE_HIT.muted = !PADDLE_HIT.muted;
    BRICK_HIT.muted = !BRICK_HIT.muted;
    WIN.muted = !WIN.muted;
    LIFE_LOST.muted = !LIFE_LOST.muted;
}

const rules = document.getElementById("rules");
const rulesBtn = document.getElementById("rules-btn");
const closeBtn = document.getElementById("close-btn");
const game_over = document.getElementById("game-over");
const youWon = document.getElementById("you-won");
const youLose = document.getElementById("you-lose");
const restart = document.getElementById("restart");

rulesBtn.addEventListener("click", () => {
    rules.classList.add("show");
    isPaused = true;
});
closeBtn.addEventListener("click", () => {
    rules.classList.remove("show");
    isPaused = false;
});

const showEndInfo = (type = "WIN") => {
    game_over.style.visibility = "visible";
    game_over.style.opacity = "1";
    if (type == "WIN") {
        youWon.style.visibility = "visible";
        youLose.style.visibility = "hidden";
        youLose.style.opacity = "0";
    } else {
        youWon.style.visibility = "hidden";
        youLose.style.visibility = "visible";
        youWon.style.opacity = "1";
    }
}

restart.addEventListener("click", () => {
    location.reload();
})
