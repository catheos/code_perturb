import { useState, useEffect } from 'react'

interface QuestionItem {
  id: number
  question: string
  dataset: any
}

function App() {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [selected, setSelected] = useState<QuestionItem | null>(null)
  const [reconstruction, setReconstruction] = useState<string | null>(null)

  useEffect(() => {
    if (!selected) return
    setReconstruction(null)
    fetch("http://localhost:3000/api/chat/full-cycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: JSON.stringify(selected.dataset) })
    })
      .then(res => res.json())
      .then(data => setReconstruction(data.phase2_reconstructedData))
      .catch(err => console.error("Full cycle failed:", err))
  }, [selected])

  useEffect(() => {
    fetch("http://localhost:3000/api/questions")
      .then(res => res.json())
      .then(setQuestions)
      .catch(err => console.error("Failed to fetch questions:", err))
  }, [])

  return (
    <div className="h-screen w-screen p-6 bg-slate-800 text-white flex flex-col">
      <div className="grid grid-cols-2 gap-4 mb-6 w-full flex-1 min-h-0">
        <div className="bg-slate-700 rounded-lg flex flex-col min-h-0">
          <h2 className="bg-blue-600 px-4 py-2 font-medium rounded-tl-lg rounded-tr-lg">Original</h2>
          <pre className="p-4 text-sm text-white whitespace-pre-wrap break-all overflow-auto flex-1">
            {selected ? JSON.stringify(selected.dataset, null, 2) : null}
          </pre>
        </div>
        <div className="bg-slate-700 rounded-lg flex flex-col min-h-0">
          <h2 className="bg-green-600 px-4 py-2 font-medium rounded-tl-lg rounded-tr-lg">Reconstruction</h2>
          <pre className="p-4 text-sm text-white whitespace-pre-wrap break-all overflow-auto flex-1">
            {reconstruction ?? (selected ? "Loading..." : null)}
          </pre>
        </div>
      </div>

      <select
        value={selected?.id ?? ""}
        onChange={e => setSelected(questions.find(q => q.id === Number(e.target.value)) ?? null)}
        className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600"
        title={selected?.question}
      >
        <option value="" disabled>Select a question</option>
        {questions.map(q => (
          <option key={q.id} value={q.id}>{q.question}</option>
        ))}
      </select>
    </div>
  )
}

export default App