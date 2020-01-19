export const dPad = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

export const oppositeOf = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up'
}

class DirectionController {
  constructor (initialDirection = 'right') {
    this.direction = initialDirection

    this.queue = []
  }

  take () {
    this.direction = this.queue.shift() || this.direction

    return this.direction
  }

  push (direction) {
    const queueLength = this.queue.length
    const lastOne = this.queue[queueLength - 1]

    if (
      (
        !lastOne &&
        direction !== this.direction &&
        direction !== oppositeOf[this.direction]
      ) || (
        lastOne &&
        direction !== oppositeOf[lastOne] &&
        direction !== lastOne
      )
    ) {
      this.queue.push(direction)
    }
  }

  clear () {
    this.direction = 'right'
    this.queue = []
  }
}

export const directionController = new DirectionController()