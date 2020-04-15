import React, { useRef, useEffect, useState } from 'react'
import { render } from 'react-dom'

import { useInterval } from './hooks'
import { useKeyDownListener } from './hooks/useKeyDownListener'
import { height, width, dPad, directionController, drawBoard, saveScore, getScores } from './utils'
import { createGame, advance } from './snake-logic'


export const App = props => {
  const ref = useRef()
  const newGameRef = useRef()
  const [name, setName] = useState(localStorage.getItem('snek-name') ?? 'Anonymous')
  const [gameActive, setGameActive] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [scores, setScores] = useState(getScores())
  const [showDPad, setShowDPad] = useState(false)
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(4)

  const updateName = name => {
    setName(name)
    localStorage.setItem('snek-name', name)
  }
  
  useInterval(() => {
    if (gameActive) {
      const result = advance(ref.current.getContext('2d'))

      if (result.hasEaten) {
        setScore(s => s + speed)
      }

      if (result.dead) {
        setGameActive(false)
        setIsDead(true)
        saveScore(score, speed, name)
        setScores(getScores())
      }
    }
  }, 1000 / speed)

  const dPadEventHandler = direction => {
    if (!gameActive && !isDead) {
      setGameActive(true)
    }

    directionController.push(direction)
  }

  useKeyDownListener(e => {
    if (dPad[e.which]) {
      e.preventDefault()

      dPadEventHandler(dPad[e.which])
    }
  })

  useEffect(() => {
    if (!isDead) {
      createGame(ref.current.getContext('2d'))
    }

    if (isDead) {
      newGameRef.current.focus()
    }
  }, [isDead])

  return <main>
    <div className='heading-grid my-2'>
      <div className='flex-center'>
        <button className='text-xl w-8 h-8 border rounded shadow focus:outline-none focus:bg-blue-400 focus:text-white' onClick={e => setSpeed(s => gameActive || s < 2 ? s : s - 1)}>-</button>
        <p className='mx-3'>Speed: {speed} m/s</p>
        <button className='text-xl w-8 h-8 border rounded shadow focus:outline-none focus:bg-blue-400 focus:text-white' onClick={e => setSpeed(s => gameActive || s > 9 ? s : s + 1)}>+</button>
      </div>
      <input className='p-1 rounded border border-green-300 text-center focus:outline-none focus:shadow-outline' value={name} onChange={e => updateName(e.target.value)} />
      {gameActive && !isDead
        ? <button
          className='px-2 py-1 shadow-md bg-red-300 text-red-700 rounded'
          onClick={e => !isDead && setGameActive(false)}
        >
          Pause
        </button>
        : <h1 className='text-3xl text-center'>Snek</h1>}
      <p>Score: {score}</p>
    </div>
    <canvas
      className='border border-green-300 mx-auto w-full md:w-4/5'
      ref={ref}
      height={height}
      width={width}
    />
    {isDead && <div className='flex-center my-4'>
      <button
        ref={newGameRef}
        className='mx-auto p-2 shadow-md bg-green-300 text-green-700 rounded'
        onClick={e => {
          setGameActive(false)
          setScore(0)
          setIsDead(false)
          directionController.clear()
        }}
      >
        New Game
      </button>
    </div>}
    <div className='d-pad'>
      <button className='up d-button' onClick={e => dPadEventHandler('up')}>U</button>
      <button className='down d-button' onClick={e => dPadEventHandler('down')}>D</button>
      <button className='left d-button' onClick={e => dPadEventHandler('left')}>L</button>
      <button className='right d-button' onClick={e => dPadEventHandler('right')}>R</button>
    </div>
    <div className='max-w-sm mx-auto'>
      <h3 className='text-center text-xl'>Scoreboard</h3>
      {scores.map(set => <ul key={set.speed}>
        <h4 className='font-semibold text-lg underline'>Speed: {set.speed}</h4>
        {set.scores.map(({ name, score, date }) => <li key={date}>
          {name}: <strong>{score}</strong> <em>({new Date(date).toLocaleString('en-US')})</em>
        </li>)}
      </ul>)}
    </div>
  </main>
}

render(<App />, document.getElementById('app'))
