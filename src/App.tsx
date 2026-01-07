import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ApiNotificationProvider } from './contexts/ApiNotificationContext'
import Layout from './components/Layout'
import ApiNotification from './components/ApiNotification'
// import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateQuiz from './pages/CreateQuiz'
import TakeQuiz from './pages/TakeQuiz'
import QuizPreview from './pages/QuizPreview'
import Settings from './pages/Settings'
import Login from './pages/Login'

import StudyAssistant from './pages/StudyAssistant'
import MaterialsHistory from './pages/MaterialsHistory'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <ApiNotificationProvider>
        <Router>
          <Layout>
            <ApiNotification />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/quiz/:id" element={<TakeQuiz />} />
              <Route path="/quiz/:id/preview" element={<QuizPreview />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/study-assistant/:materialId?" element={<StudyAssistant />} />
              <Route path="/materials" element={<MaterialsHistory />} />
            </Routes>
          </Layout>
        </Router>
      </ApiNotificationProvider>
    </AuthProvider>
  )
}

export default App
