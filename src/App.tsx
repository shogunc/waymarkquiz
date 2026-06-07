import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { JoinPage } from './routes/JoinPage'
import { HostPage } from './routes/HostPage'
import { AdminLayout } from './routes/admin/AdminLayout'
import { QuestionsListPage } from './routes/admin/QuestionsListPage'
import { QuestionEditorPage } from './routes/admin/QuestionEditorPage'
import { QuizzesListPage } from './routes/admin/QuizzesListPage'
import { QuizEditorPage } from './routes/admin/QuizEditorPage'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
