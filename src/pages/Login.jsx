import { toast } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { errMsg } from '../api'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  if (token) return <Navigate to="/" replace />

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post('/users/signin', values)
      login(data.data.token, data.data.user)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.danger(errMsg(err))
    }
  }

  return (
    <AuthLayout
      heading={<>Welcome<br />back.</>}
      copy="Pick up the conversation exactly where you left it."
      title="Log in to Stanley"
      subtitle="Good to see you again."
    >
      <form className="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" type="email" placeholder="you@example.com" error={errors.email}
          {...register('email', { required: 'Email is required', setValueAs: (v) => v.trim(), pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
        <Field label="Password" type="password" placeholder="Your password" error={errors.password}
          {...register('password', { required: 'Password is required' })} />
        <button className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <div className="auth-switch">
        New to Stanley? <Link to="/signup" className="link-btn">Create an account</Link>
      </div>
    </AuthLayout>
  )
}
