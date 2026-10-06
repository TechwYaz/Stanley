import { toast } from '@heroui/react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { errMsg } from '../api'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { useAuth } from '../context/AuthContext'

export const PASSWORD_RULE = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
export const PASSWORD_MSG =
  'Min 8 chars with uppercase, lowercase, a number and a special character (#?!@$%^&*-)'

const validDob = (v) => {
  const d = new Date(v)
  if (Number.isNaN(d.getTime()) || d > new Date()) return 'Enter a valid date of birth'
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000)
  if (age < 13) return 'You must be at least 13 years old'
  if (age > 120) return 'Enter a valid date of birth'
  return true
}

export default function Signup() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { gender: 'male' } })

  if (token) return <Navigate to="/" replace />

  const onSubmit = async (values) => {
    try {
      const { firstName, lastName, ...rest } = values
      await api.post('/users/signup', { ...rest, name: `${firstName.trim()} ${lastName.trim()}`, username: rest.username.trim().toLowerCase() })
      toast.success('Account created, please log in')
      navigate('/login')
    } catch (err) {
      toast.danger(errMsg(err))
    }
  }

  return (
    <AuthLayout
      heading={<>Your people.<br />Your feed.<br />Your Stanley.</>}
      copy="A simple social space for conversations, updates and the little things worth sharing."
      title="Create your account"
      subtitle="Join Stanley in less than a minute."
    >
      <form className="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="field-row">
          <Field label="First name" placeholder="First name" error={errors.firstName}
            {...register('firstName', { required: 'First name is required', setValueAs: (v) => v.trim(), minLength: { value: 2, message: 'At least 2 characters' }, maxLength: { value: 30, message: 'Too long' } })} />
          <Field label="Last name" placeholder="Last name" error={errors.lastName}
            {...register('lastName', { required: 'Last name is required', setValueAs: (v) => v.trim(), minLength: { value: 2, message: 'At least 2 characters' }, maxLength: { value: 30, message: 'Too long' } })} />
        </div>
        <Field label="Username" placeholder="e.g. yazan_sofian" autoCapitalize="none" error={errors.username}
          {...register('username', { required: 'Username is required', setValueAs: (v) => v.trim().toLowerCase(), pattern: { value: /^[a-z0-9_]{3,30}$/, message: '3-30 characters: letters, numbers and underscores only' } })} />
        <Field label="Email" type="email" placeholder="you@example.com" error={errors.email}
          {...register('email', { required: 'Email is required', setValueAs: (v) => v.trim().toLowerCase(), pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
        <Field label="Date of birth" type="date" error={errors.dateOfBirth}
          max={new Date().toISOString().slice(0, 10)}
          {...register('dateOfBirth', { required: 'Date of birth is required', validate: validDob })} />
        <div className="field">
          <label>Gender</label>
          <select {...register('gender')}>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <Field label="Password" type="password" placeholder="8+ characters" error={errors.password}
          {...register('password', { required: 'Password is required', pattern: { value: PASSWORD_RULE, message: PASSWORD_MSG } })} />
        <Field label="Confirm password" type="password" placeholder="Repeat password" error={errors.rePassword}
          {...register('rePassword', {
            required: 'Please confirm your password',
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })} />
        <button className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
      </form>
      <div className="auth-switch">
        Already have an account? <Link to="/login" className="link-btn">Log in</Link>
      </div>
    </AuthLayout>
  )
}
