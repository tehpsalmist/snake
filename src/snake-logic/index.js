import { directionController, drawBoard, width, height, boxSize, oppositeOf } from '../utils'

let currentBoard

const gridWidth = width / boxSize
const gridHeight = height / boxSize

const startingSnakeSegments = 8
const firstSnakeHeadX = (gridWidth / 2) + Math.floor(startingSnakeSegments / 2)

export const createGame = ctx => {
  const firstSnake = Array(startingSnakeSegments)
    .fill((gridHeight / 2) - 1)
    .map((y, i) => ({ x: firstSnakeHeadX - i, y, from: 'left', to: 'right' }))

  const firstApple = nextApple(checkMap(firstSnake))

  currentBoard = { snake: firstSnake, apple: firstApple, poops: [] }

  drawBoard(currentBoard, ctx)
}

export const advance = ctx => {
  const result = {}

  currentBoard = nextBoard(currentBoard)

  if (willCollide(currentBoard.snake, currentBoard.poops)) {
    result.dead = true

    return result
  }

  if (currentBoard.snake[0].hasEaten) {
    result.hasEaten = true
  }

  drawBoard(currentBoard, ctx)

  return result
}

const nextBoard = board => {
  const snake = board.snake.slice()
  let apple = board.apple

  const direction = directionController.take()

  const currentHead = snake[0]

  currentHead.to = direction

  const x = nextX(currentHead.x, direction)
  const y = nextY(currentHead.y, direction)
  const from = oppositeOf[direction]

  const newHead = { x, y, from, hasEaten: apple.x === x && apple.y === y }

  snake.unshift(newHead)

  const tail = snake[snake.length - 1]

  if (tail.hasEaten) {
    board.poops.push({ x: tail.x, y: tail.y })
  }

  const poops = board.poops.length > 10 ? board.poops.slice(1) : board.poops

  const poopMap = checkMap(poops)

  if (!newHead.hasEaten) {
    snake.pop()
  } else {
    apple = nextApple({ ...checkMap(snake), ...poopMap })
  }

  const projectedY = nextY(y, direction)
  const projectedX = nextX(x, direction)

  if ((projectedX === apple.x && projectedY === apple.y) || poopMap[`${projectedX}-${projectedY}`]) {
    newHead.aboutToEat = true
  }

  return {
    snake,
    apple,
    poops
  }
}

const nextApple = (check) => {
  const appleCandidate = {
    x: Math.floor(Math.random() * gridWidth),
    y: Math.floor(Math.random() * gridHeight)
  }

  if (check[`${appleCandidate.x}-${appleCandidate.y}`]) {
    return nextApple(check)
  }

  return appleCandidate
}

const willCollide = (snake, poops) => {
  const snakeCheck = {}
  const tailIndex = snake.length - 1
  const poopCheck = checkMap(poops)

  return snake.some(({ x, y }, i) => {
    const isTail = i === tailIndex
    const coordinates = `${x}-${y}`

    if (snakeCheck[coordinates] || (!isTail && poopCheck[coordinates])) {
      return true
    }

    snakeCheck[coordinates] = 1
  })
}

const checkMap = itemList => itemList.reduce((map, { x, y }) => ({ ...map, [`${x}-${y}`]: 1 }), {})

const nextX = (original, direction) => {
  let x = original

  switch (direction) {
    case 'right':
      x++

      if (x >= gridWidth) {
        x = 0
      }

      return x
    case 'left':
      x--

      if (x < 0) {
        x = gridWidth - 1
      }

      return x
    default:
      return x
  }
}

const nextY = (original, direction) => {
  let y = original

  switch (direction) {
    case 'down':
      y++

      if (y >= gridHeight) {
        y = 0
      }

      return y
    case 'up':
      y--

      if (y < 0) {
        y = gridHeight - 1
      }

      return y
    default:
      return y
  }
}

/*

Current Game Board State:
  position of
    snake head
      coords
      about to eat/is eating
    snake body segments
      coords
      at a turn
      eaten apple
    snake tail
      coords
    current apple
      coords
    animal bonus
      coords
      timer?
  direction

Next Game Board State:
  position of
    snake head
      coords
      about to eat/is eating
    snake body segments
      coords
      at a turn
      eaten apple
    snake tail
      coords
    current apple
      coords
    animal bonus
      coords
      timer?
  direction

  snakeSegment:
    x
    y
    from
    to
    hasEaten


  Information about rendering details
  Information about game scoring/collisions
  Information about allowed keystrokes

*/
