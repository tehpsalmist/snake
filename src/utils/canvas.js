export const width = 4000
export const height = 2000

export const boxSize = 100

export const drawSnakeHead = (x, y, ctx) => {
  ctx.fillStyle = 'green'
  ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
}

export const drawSnakeBody = (x, y, ctx) => {
  ctx.fillStyle = 'gray'
  ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
}

export const drawSnakeTail = (x, y, ctx) => {
  ctx.fillStyle = 'blue'
  ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
}

export const drawSnake = (snake, ctx) => {
  snake.forEach(({ x, y }, i) => {
    if (i === 0) {
      drawSnakeHead(x, y, ctx)
    } else if (i === snake.length - 1) {
      drawSnakeTail(x, y, ctx)
    } else {
      drawSnakeBody(x, y, ctx)
    }
  })
}

export const drawApple = ({ x, y }, ctx) => {
  ctx.fillStyle = 'red'
  ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize)
}

export const drawBoard = ({ snake, apple }, ctx) => {
  ctx.clearRect(0, 0, width, height)

  drawSnake(snake, ctx)
  drawApple(apple, ctx)
}
