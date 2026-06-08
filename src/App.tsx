import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'

const JoinPage = lazy(() => import('./routes/JoinPage').then((m) => ({ default: m.JoinPage })))
const HostPage = lazy(() => import('./routes/HostPage').then((m) => ({ default: m.HostPage })))
const AdminLayout = lazy(() => import('./routes/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const QuestionsListPage = lazy(() => import('./routes/admin/QuestionsListPage').then((m) => ({ default: m.QuestionsListPage })))
const QuestionEditorPage = lazy(() => import('./routes/admin/QuestionEditorPage').then((m) => ({ default: m.QuestionEditorPage })))
const QuizzesListPage = lazy(() => import('./routes/admin/QuizzesListPage').then((m) => ({ default: m.QuizzesListPage })))
const QuizEditorPage = lazy(() => import('./routes/admin/QuizEditorPage').then((m) => ({ default: m.QuizEditorPage })))

function RouteFallback() {
  return <main className="flex min-h-svh items-center justify-center bg-slate-950 text-slate-400">Loading…</main>
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="questions" replace />} />
            <Route path="questions" element={<QuestionsListPage />} />
            <Route path="questions/new" element={<QuestionEditorPage />} />
            <Route path="questions/:id" element={<QuestionEditorPage />} />
            <Route path="quizzes" element={<QuizzesListPage />} />
            <Route path="quizzes/new" element={<QuizEditorPage />} />
            <Route path="quizzes/:id" element={<QuizEditorPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
