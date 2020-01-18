import React, { useRef, useEffect, useState } from 'react'
import { render } from 'react-dom'

import { useInterval } from './hooks'
import { useKeyDownListener } from './hooks/useKeyDownListener'
import { height, width, dPad, directionController, drawBoard } from './utils'
import { createGame, advance } from './snake-logic'


export const App = props => {
  const ref = useRef()
  const [gameActive, setGameActive] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(100)
  
  useInterval(() => {
    if (gameActive) {
      const result = advance(ref.current.getContext('2d'))

      if (result.hasEaten) {
        // setSpeed(s => s - 10)
        setScore(s => s + 4)
      }

      if (result.dead) {
        setGameActive(false)
        setIsDead(true)
      }
    }
  }, speed)

  useKeyDownListener(e => {
    if (dPad[e.which]) {
      if (!gameActive && !isDead) {
        setGameActive(true)
      }

      directionController.push(dPad[e.which])
    }
  })

  useEffect(() => {
    createGame(ref.current.getContext('2d'))
  }, [])

  return <main>
    <div className='flex justify-evenly items-end'>
      <p>Speed: {(1000 / speed).toFixed(1)}</p>
      <h1 className='text-3xl text-center'>Snek</h1>
      <p>Score: {score}</p>
    </div>
    <canvas
      className='border border-green-300 mx-auto w-90vmin'
      ref={ref}
      height={height}
      width={width}
    />
    {gameActive && !isDead && <button
      className='mx-auto p-2 shadow-md bg-red-300 text-red-700 rounded'
      onClick={e => !isDead && setGameActive(false)}
    >
      Pause
    </button>}
  </main>
}

render(<App />, document.getElementById('app'))
