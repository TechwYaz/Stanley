import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toast } from '@heroui/react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import PostDetails from './pages/PostDetails'
import Profile from './pages/Profile'
import Search from './pages/Search'
import Settings from './pages/Settings'
import Signup from './pages/Signup'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toast.Provider placement="top end" />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/posts/:id" element={<PostDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users/:id" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
