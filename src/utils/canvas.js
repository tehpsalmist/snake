import { oppositeOf } from './dpad'

export const width = 3000
export const height = 1600

export const boxSize = 100

const halfBoxSize = boxSize / 2
const tenthBoxSize = boxSize / 10
const twentieth = boxSize / 20
const hundredth = boxSize / 100

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
export const drawSnakeHead = ({ aboutToEat, ...segment }, ctx) => {
  return aboutToEat ? drawSnakeHeadMouthOpened(segment, ctx) : drawSnakeHeadMouthClosed(segment, ctx)
}

/**
 * Draw the snake's head with mouth closed
 * @param {SnakeSegment} segment
 * @param {CanvasRenderingContext2D} ctx
 */
export const drawSnakeHeadMouthClosed = ({ x, y, from }, ctx) => {
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
  ctx.ellipse(eyeX, eyeY, twentieth, twentieth / 2, getRotation(from, Math.PI / 20), 0, 2 * Math.PI)
  ctx.fill()

  // tongue
  if (Math.floor(Math.random() * 10) >= 8) {
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
 * Draw the snake's head with mouth opened
 * @param {SnakeSegment} segment
 * @param {CanvasRenderingContext2D} ctx
 */
export const drawSnakeHeadMouthOpened = ({ x, y, from }, ctx) => {
  const actualX = actualSize(x)
  const actualY = actualSize(y)

  const getXY = createXYFactory(from, actualX, actualY)

  const begin = getXY(0, 25)
  const upperLip = getXY(70, 12)
  const topTooth = getXY(73, 35)
  const cornerOfMouth = getXY(15, 50)
  const bottomTooth = getXY(73, 65)
  const lowerLip = getXY(70, 88)
  const end = getXY(0, 75)

  // teeth
  ctx.strokeStyle = 'gray'
  ctx.lineWidth = hundredth

  ctx.beginPath()
  ctx.moveTo(...getXY(67, 13))
  ctx.bezierCurveTo(...getXY(72, 22), ...getXY(72, 22),...topTooth)
  ctx.bezierCurveTo(...getXY(68, 26), ...getXY(68, 26),...getXY(58, 20))
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(...getXY(67, 87))
  ctx.bezierCurveTo(...getXY(72, 78), ...getXY(72, 78),...bottomTooth)
  ctx.bezierCurveTo(...getXY(68, 74), ...getXY(68, 74),...getXY(58, 80))
  ctx.stroke()

  // tongue
  ctx.strokeStyle = 'red'
  ctx.lineWidth = twentieth / 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'bevel'

  ctx.beginPath()
  ctx.moveTo(...getXY(25, 57))
  ctx.bezierCurveTo(...getXY(35, 54), ...getXY(35, 54), ...getXY(45, 54))
  ctx.lineTo(...getXY(53, 52))
  ctx.moveTo(...getXY(45, 54))
  ctx.lineTo(...getXY(53, 58))
  ctx.stroke()

  // head
  ctx.fillStyle = 'green'
  ctx.strokeStyle = 'green'

  ctx.beginPath()
  ctx.moveTo(...begin)
  ctx.bezierCurveTo(...getXY(50, 10), ...getXY(60, 5), ...upperLip)
  ctx.lineTo(...cornerOfMouth)
  ctx.lineTo(...lowerLip)
  ctx.bezierCurveTo(...getXY(60, 95), ...getXY(50, 90), ...end)
  ctx.closePath()
  ctx.fill()

  // eye
  ctx.fillStyle = '#444'

  ctx.beginPath()
  ctx.ellipse(...getXY(27, 25), twentieth, twentieth / 2, -0.2, 0, 2 * Math.PI)
  ctx.fill()
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
    ctx.lineCap = 'square'
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

/**
 * 
 * @param {{ x: number, y: number }} segment
 * @param {CanvasRenderingContext2D} ctx 
 */
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

/**
 * 
 * @param {{ x: number, y: number }[]} poops
 * @param {CanvasRenderingContext2D} ctx 
 */
export const drawPoops = (poops, ctx) => {
  poops.forEach(poop => drawPoop(poop, ctx))
  /**
   * 
   * @param {{ x: number, y: number }} poop
   * @param {CanvasRenderingContext2D} ctx 
   */
  function drawPoop ({ x, y }, ctx) {
    const actualX = actualSize(x)
    const actualY = actualSize(y)

    const getXY = createXYFactory('left', actualX, actualY)

    ctx.fillStyle = 'brown'
    ctx.beginPath()
    ctx.ellipse(...getXY(50, 40), 12, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(...getXY(50, 50), 20, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(...getXY(50, 60), 25, 12, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

export const drawBoard = ({ snake, apple, poops }, ctx) => {
  ctx.clearRect(0, 0, width, height)

  drawPoops(poops, ctx)
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
 * @returns {[number, number]}
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
 * @returns {[number, number]}
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

function getRotation (from, rotation) {
  switch (from) {
    case 'down':
      return (Math.PI / 2) + rotation
    case 'up':
      return -(Math.PI / 2) + rotation
    case 'left':
      return rotation
    case 'right':
      return Math.PI - rotation
  }
}

function createXYFactory (from, actualX, actualY) {
  const getXY = (desiredX, desiredY) => {
    const xOffset = desiredX * hundredth
    const yOffset = desiredY * hundredth

    switch (from) {
      case 'down':
        return [actualX + yOffset, (actualY + boxSize) - xOffset]
      case 'up':
        return [(actualX + boxSize) - yOffset, actualY + xOffset]
      case 'left':
        return [actualX + xOffset, actualY + yOffset]
      case 'right':
        return [(actualX + boxSize) - xOffset, actualY + yOffset]
    }
  }

  return getXY
}
