export const saveScore = (score, speed, name) => {
  console.log(score, speed, name)
  const scores = getFromLS(`snek-${speed}`) || []

  const newScores = scores
    .concat([{ score, name, date: Date.now() }])
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  setInLS(`snek-${speed}`, newScores)
}

export const getScores = () => {
  const scores = []

  let speed = 11
  while (speed --> 2) {
    const speedGroup = getFromLS(`snek-${speed}`)

    if (speedGroup) {
      scores.push({ speed, scores: speedGroup })
    }
  }

  return scores
}

const getFromLS = key => {
  try {
    return JSON.parse(localStorage.getItem(key))
  } catch (e) {
    return null
  }
}

const setInLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))

    return true
  } catch (e) {
    return false
  }
}