import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [questions, setQuestions] = useState<string[]>([])
  const [selected, setSelected] = useState<string>("")
  const [confirmed, setConfirmed] = useState<string>("")

  useEffect(() => {
    fetch("http://localhost:3000/api/questions")
      .then(res => res.json())
      .then((data: string[]) => {
        setQuestions(data)
        setSelected(data[0] ?? "")
      })
      .catch(err => console.error("Failed to fetch questions:", err))
  }, [])

  return (
    <div className="app-container">
      <div className="panels">
        <div className="panel">
          <h2 className="panel-title">Original</h2>
          <div className="panel-content" />
        </div>
        <div className="panel">
          <h2 className="panel-title">Reconstruction</h2>
          <div className="panel-content" />
        </div>
      </div>

      <div className="selection-bar">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="question-select"
          title={selected}
        >
          {questions.map((q, i) => (
            <option key={i} value={q}>{q}</option>
          ))}
        </select>
        <button
          className="confirm-btn"
          onClick={() => setConfirmed(selected)}
          disabled={!selected}
        >
          Confirm
        </button>
      </div>

      {confirmed && (
        <p className="confirmed-label">Selected: {confirmed}</p>
      )}
    </div>
  )
}

export default App