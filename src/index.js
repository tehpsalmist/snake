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
  const [speed, setSpeed] = useState(4)
  
  useInterval(() => {
    if (gameActive) {
      const result = advance(ref.current.getContext('2d'))

      if (result.hasEaten) {
        // setSpeed(s => s - 10)
        setScore(s => s + speed)
      }

      if (result.dead) {
        setGameActive(false)
        setIsDead(true)
      }
    }
  }, 1000 / speed)

  useKeyDownListener(e => {
    if (dPad[e.which]) {
      e.preventDefault()

      if (!gameActive && !isDead) {
        setGameActive(true)
      }

      directionController.push(dPad[e.which])
    }
  })

  useEffect(() => {
    if (!isDead) {
      createGame(ref.current.getContext('2d'))
    }
  }, [isDead])

  return <main>
    <div className='flex justify-evenly items-end'>
      <div className='flex-center'>
        <button className='text-xl w-8 h-8 border rounded shadow focus:outline-none focus:bg-blue-400 focus:text-white      ' onClick={e => setSpeed(s => gameActive || s < 2 ? s : s - 1)}>-</button>
        <p className='mx-3'>Speed: {speed} m/s</p>
        <button className='text-xl w-8 h-8 border rounded shadow focus:outline-none focus:bg-blue-400 focus:text-white      ' onClick={e => setSpeed(s => gameActive || s > 9 ? s : s + 1)}>+</button>
      </div>
      <h1 className='text-3xl text-center'>Snek</h1>
      <p>Score: {score}</p>
    </div>
    <canvas
      className='border border-green-300 mx-auto w-4/5'
      ref={ref}
      height={height}
      width={width}
    />
    <div className='flex-center mt-4'>
      {gameActive && !isDead && <button
        className='mx-auto p-2 shadow-md bg-red-300 text-red-700 rounded'
        onClick={e => !isDead && setGameActive(false)}
      >
        Pause
      </button>}
      {isDead && <button
        className='mx-auto p-2 shadow-md bg-green-300 text-green-700 rounded'
        onClick={e => {
          setGameActive(false)
          setScore(0)
          setIsDead(false)
          directionController.clear()
        }}
      >
        New Game
      </button>}
    </div>
  </main>
}

render(<App />, document.getElementById('app'))
