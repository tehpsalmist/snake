import React, { useEffect } from 'react'

export function useKeyDownListener (callback) {
  useEffect(() => {
    window.addEventListener('keydown', callback)

    return () => window.removeEventListener('keydown', callback)
  }, [callback])
}