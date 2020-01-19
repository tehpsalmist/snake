import { oppositeOf } from './dpad'

export const width = 3000
export const height = 1600

export const boxSize = 100

const halfBoxSize = boxSize / 2
const tenthBoxSize = boxSize / 10
const twentieth = boxSize / 20

const snakePattern = [
  'green', // middle
  'gray', // inner right
  'gray', // inner left
  'green', // outer right
  'green' // outer left
]

function actualSize (number) {
  return boxSize * number
}

/**
 * @typedef {{ x: number, y: number, from: string, to: string, hasEaten: boolean, aboutToEat: boolean }} SnakeSegment
 */

/**
 * Draw the snake's head
 * @param {SnakeSegment} segment
 * @param {CanvasRenderingContext2D} ctx
 */
export const drawSnakeHead = ({ x, y, from, aboutToEat }, ctx) => {
  const actualX = actualSize(x)
  const actualY = actualSize(y)

  const [beginX, beginY] = relativeToCenterOfEdge(from, actualX, actualY, { enterOffset: -5 * twentieth })
  const [endX, endY] = relativeToCenterOfEdge(from, actualX, actualY, { enterOffset: 5 * twentieth })
  const [oppX, oppY] = relativeToCenterOfEdge(oppositeOf[from], actualX, actualY)

  const [noseX, noseY] = towardCenterFromDirection(twentieth * 5, oppositeOf[from], oppX, oppY)

  const toNoseCoords = [
    ...towardCenterFromDirection(tenthBoxSize, from, beginX, beginY),
    ...towardCenterFromDirection(15 * twentieth, from, beginX, beginY),
    noseX,
    noseY
  ]

  const toEndCoords = [
    ...towardCenterFromDirection(15 * twentieth, from, endX, endY),
    ...towardCenterFromDirection(tenthBoxSize, from, endX, endY),
    endX,
    endY
  ]

  const cornerOfMouth = getCornerOfMouthCoords(actualX, actualY, from)
  const mouthControlPoints = towardCenterFromDirection(5 * tenthBoxSize, oppositeOf[from], noseX, noseY)

  const mouthCoords = [
    ...mouthControlPoints,
    ...mouthControlPoints,
    ...cornerOfMouth
  ]

  const [eyeX, eyeY] = getEyeCoords(actualX, actualY, from)

  ctx.fillStyle = 'green'
  ctx.strokeStyle = 'green'

  // head
  ctx.beginPath()
  ctx.moveTo(beginX, beginY)
  ctx.bezierCurveTo(...toNoseCoords)
  ctx.bezierCurveTo(...toEndCoords)
  ctx.closePath()
  ctx.fill()

  // mouth
  ctx.strokeStyle = 'white'
  ctx.lineWidth = twentieth / 2
  ctx.beginPath()
  ctx.moveTo(noseX, noseY)
  ctx.bezierCurveTo(...mouthCoords)
  ctx.stroke()

  // eye
  ctx.fillStyle = '#444'
  ctx.beginPath()
  ctx.arc(eyeX, eyeY, twentieth, 0, 2 * Math.PI)
  ctx.fill()

  // tongue
  if (!aboutToEat && Math.floor(Math.random() * 10) >= 8) {
    ctx.strokeStyle = 'red'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'bevel'

    ctx.beginPath()
    ctx.moveTo(noseX, noseY)
    
    for (const [x, y] of getTongueCoords(actualX, actualY, from)) {
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }
}

/**
 * Draw one of the snake's body segments
 * @param {SnakeSegment} segment
 * @param {CanvasRenderingContext2D} ctx
 */
export const drawSnakeBody = ({ x, y, from, to, hasEaten }, ctx) => {
  const actualX = actualSize(x)
  const actualY = actualSize(y)

  if (hasEaten) {
    drawFullBelly({ x, y }, ctx)
  }

  ctx.lineWidth = tenthBoxSize

  let i = 0
  for (const color of snakePattern) {
    const beginCoords = relativeToCenterOfEdge(from, actualX, actualY, { enterOffset: i })
    const endCoords = relativeToCenterOfEdge(to, actualX, actualY, { exitOffset: i })

    const cpX = (beginCoords[0] % boxSize === 0 ? endCoords[0] : beginCoords[0])
    const cpY = (beginCoords[1] % boxSize === 0 ? endCoords[1] : beginCoords[1])
    const bezierCoords = [cpX, cpY, cpX, cpY, ...endCoords]

    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(...beginCoords)
    ctx.bezierCurveTo(...bezierCoords)
    ctx.stroke()

    i = i > 0 ? 0 - i : Math.abs(0 - i) + tenthBoxSize
  }
}

/**
 * Draw the snake's tail
 * @param {SnakeSegment} segment
 * @param {CanvasRenderingContext2D} ctx
 */
export const drawSnakeTail = ({ x, y, from, to, hasEaten }, ctx) => {
  const actualX = actualSize(x)
  const actualY = actualSize(y)

  ctx.save()
  ctx.lineWidth = tenthBoxSize
  ctx.lineCap = 'round'

  const beginCoords = hasEaten
    ? relativeToCenterOfEdge(oppositeOf[to], actualX, actualY, {
      enterOffset: (to === 'right' ? -4 : 4) * tenthBoxSize
    })
    : relativeToCenterOfEdge(oppositeOf[to], actualX, actualY)

  let i = 0
  for (const color of snakePattern) {
    const endCoords = relativeToCenterOfEdge(to, actualX, actualY, { exitOffset: i })

    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(...beginCoords)
    ctx.lineTo(...endCoords)
    ctx.stroke()

    i = i > 0 ? 0 - i : Math.abs(0 - i) + tenthBoxSize
  }

  ctx.restore()
}

export const drawSnake = (snake, ctx) => {
  snake.forEach((segment, i) => {
    if (i === 0) {
      drawSnakeHead(segment, ctx)
    } else if (i === snake.length - 1) {
      drawSnakeTail(segment, ctx)
    } else {
      drawSnakeBody(segment, ctx)
    }
  })
}

/**
 * 
 * @param {{ x: number, y: number }} segment
 * @param {CanvasRenderingContext2D} ctx 
 */
export const drawApple = ({ x, y }, ctx) => {
  const middleX = actualSize(x) + halfBoxSize
  const actualY = actualSize(y)
  const bezierOffsetY = actualY + (tenthBoxSize * 2)

  // apple
  ctx.fillStyle = 'red'
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  ctx.arc(middleX, actualY + (tenthBoxSize * 5.5), halfBoxSize / 2, 0, 2 * Math.PI)
  ctx.fill()

  // stem
  ctx.beginPath()
  ctx.strokeStyle = 'brown'
  ctx.lineWidth = tenthBoxSize
  ctx.moveTo(middleX, actualY + (tenthBoxSize * 3))
  ctx.bezierCurveTo(middleX, bezierOffsetY + tenthBoxSize, middleX, bezierOffsetY, middleX + tenthBoxSize, bezierOffsetY)
  ctx.stroke()
}

const drawFullBelly = ({ x, y }, ctx) => {
  const middleX = actualSize(x) + halfBoxSize
  const middleY = actualSize(y) + halfBoxSize

  ctx.fillStyle = 'green'
  ctx.strokeStyle = 'green'
  ctx.beginPath()
  ctx.arc(middleX, middleY, tenthBoxSize * 4, 0, 2 * Math.PI)
  ctx.fill()

  ctx.fillStyle = 'gray'
  ctx.strokeStyle = 'gray'
  ctx.beginPath()
  ctx.arc(middleX, middleY, tenthBoxSize * 3, 0, 2 * Math.PI)
  ctx.fill()
}

export const drawBoard = ({ snake, apple }, ctx) => {
  ctx.clearRect(0, 0, width, height)

  drawSnake(snake, ctx)
  drawApple(apple, ctx)
}

function getCornerOfMouthCoords (x, y, from) {
  return towardCenterFromDirection(
    5 * twentieth,
    from,
    ...relativeToCenterOfEdge(from, x, y, { enterOffset: from === 'right' ? twentieth : -twentieth })
  )
}

function getEyeCoords (x, y, from) {
  return towardCenterFromDirection(
    6 * twentieth,
    from,
    ...relativeToCenterOfEdge(from, x, y, { enterOffset: from === 'right' ? (3 * twentieth) : -(3 * twentieth) })
  )
}

function * getTongueCoords (x, y, from) {
  const tongueBottom = relativeToCenterOfEdge(from, x, y, { enterOffset: from === 'right' ? -tenthBoxSize : tenthBoxSize })
  const tongueBase = towardCenterFromDirection(17 * twentieth, from, ...tongueBottom)
  const bottomTip = towardCenterFromDirection(tenthBoxSize, from, ...tongueBase)
  const topTip = towardCenterFromDirection(
    19 * twentieth - (twentieth / 2),
    from,
    ...relativeToCenterOfEdge(from, x, y, { enterOffset: from === 'right' ? -twentieth : twentieth })
  )

  yield tongueBase
  yield bottomTip
  yield tongueBase
  yield topTip
}

/**
 * 
 * @param {'up' | 'down' | 'left' | 'right'} side
 * @param {number} x
 * @param {number} y
 * 
 * @returns {number[]}
 */
function relativeToCenterOfEdge (side, x, y, { enterOffset = 0, exitOffset = 0 } = { enterOffset: 0, exitOffset: 0 }) {
  switch (side) {
    case 'down':
      return [x + halfBoxSize + (enterOffset - exitOffset), y + boxSize]
    case 'up':
      return [x + halfBoxSize + (exitOffset - enterOffset), y]
    case 'left':
      return [x, y + halfBoxSize + (enterOffset - exitOffset)]
    case 'right':
      return [x + boxSize, y + halfBoxSize + (exitOffset - enterOffset)]
  }
}

/**
 * 
 * @param {number} distance
 * @param {'up' | 'down' | 'left' | 'right'} from
 * @param {number} x
 * @param {number} y
 * 
 * @returns {number[]}
 */
function towardCenterFromDirection (distance, from, x, y) {
  switch (from) {
    case 'down':
      return [x, y - distance]
    case 'up':
      return [x, y + distance]
    case 'left':
      return [x + distance, y]
    case 'right':
      return [x - distance, y]
  }
}
