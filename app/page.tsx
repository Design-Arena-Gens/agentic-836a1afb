'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

type Player = 'X' | 'O'
type CellValue = Player | null
type Board = CellValue[]

interface Game {
  id: string
  player_name: string
  opponent_name: string
  winner: string
  moves: number
  duration_seconds: number | null
  created_at: string
}

export default function Home() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<string | null>(null)
  const [playerXName, setPlayerXName] = useState('Player X')
  const [playerOName, setPlayerOName] = useState('Player O')
  const [moveCount, setMoveCount] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [totalGames, setTotalGames] = useState(0)

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('tic_tac_toe_scores')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      setGames(data)
      setTotalGames(data.length)
    }
  }

  const checkWinner = (board: Board): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    if (board.every(cell => cell !== null)) {
      return 'Draw'
    }

    return null
  }

  const handleClick = (index: number) => {
    if (board[index] || winner) return

    if (!startTime) {
      setStartTime(Date.now())
    }

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)
    setMoveCount(moveCount + 1)

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      saveGame(gameWinner, moveCount + 1)
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X')
    }
  }

  const saveGame = async (gameWinner: string, totalMoves: number) => {
    const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : null

    const { error } = await supabase
      .from('tic_tac_toe_scores')
      .insert({
        player_name: playerXName,
        opponent_name: playerOName,
        winner: gameWinner,
        moves: totalMoves,
        duration_seconds: duration,
      })

    if (!error) {
      fetchGames()
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setMoveCount(0)
    setStartTime(null)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getWinnerDisplay = (game: Game) => {
    if (game.winner === 'Draw') return 'Draw'
    if (game.winner === 'X') return game.player_name
    return game.opponent_name
  }

  return (
    <div className="container">
      <div className="game-section">
        <h1>Tic-Tac-Toe</h1>

        <div className="player-inputs">
          <input
            type="text"
            value={playerXName}
            onChange={(e) => setPlayerXName(e.target.value)}
            placeholder="Player X Name"
            disabled={moveCount > 0}
          />
          <input
            type="text"
            value={playerOName}
            onChange={(e) => setPlayerOName(e.target.value)}
            placeholder="Player O Name"
            disabled={moveCount > 0}
          />
        </div>

        <div className="status">
          {winner
            ? winner === 'Draw'
              ? "It's a Draw!"
              : `${winner === 'X' ? playerXName : playerOName} Wins!`
            : `Current: ${currentPlayer === 'X' ? playerXName : playerOName}`}
        </div>

        <div className="board">
          {board.map((cell, index) => (
            <button
              key={index}
              className={`cell ${cell?.toLowerCase() || ''}`}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="controls">
          <button className="reset" onClick={resetGame}>
            New Game
          </button>
        </div>
      </div>

      <div className="leaderboard-section">
        <h2>Global Leaderboard</h2>

        <div className="total-games">
          Total Games Played
          <strong>{totalGames}</strong>
        </div>

        <div className="leaderboard">
          {games.map((game) => (
            <div key={game.id} className="leaderboard-item">
              <div className="player-info">
                <div className="player-name">
                  {game.player_name} vs {game.opponent_name}
                </div>
                <div className="game-details">
                  {game.moves} moves • {formatDuration(game.duration_seconds)}
                </div>
              </div>
              <div className={`winner ${game.winner.toLowerCase()}`}>
                {getWinnerDisplay(game)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
