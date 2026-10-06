import { toast } from '@heroui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api, { errMsg } from '../api'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { PASSWORD_MSG, PASSWORD_RULE } from './Signup'

function PasswordModal({ onClose }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async ({ password, newPassword }) => {
    try {
      await api.patch('/users/change-password', { password, newPassword })
      toast.success('Password changed')
      onClose()
    } catch (err) {
      toast.danger(errMsg(err))
    }
  }

  return (
    <Modal title="Change password" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Current password" type="password" error={errors.password}
          {...register('password', { required: 'Current password is required' })} />
        <Field label="New password" type="password" error={errors.newPassword}
          {...register('newPassword', { required: 'New password is required', pattern: { value: PASSWORD_RULE, message: PASSWORD_MSG } })} />
        <Field label="Confirm new password" type="password" error={errors.confirm}
          {...register('confirm', {
            required: 'Please confirm the new password',
            validate: (v) => v === getValues('newPassword') || 'Passwords do not match',
          })} />
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="feed-top"><h1 className="page-title">Settings</h1></div>
      <section className="settings">
        <div className="settings-head">
          <h2>Account settings</h2>
          <p>Keep your account secure and your profile up to date.</p>
        </div>
        <div className="setting-row">
          <div className="setting-main"><strong>Email address</strong><span>{user?.email}</span></div>
        </div>
        <div className="setting-row">
          <div className="setting-main"><strong>Appearance</strong><span>Switch between light and dark mode</span></div>
          <div className="setting-control"><ThemeToggle /></div>
        </div>
        <div className="setting-row">
          <div className="setting-main"><strong>Password</strong><span>Use a strong password you don’t use elsewhere</span></div>
          <div className="setting-control">
            <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>Change password</button>
          </div>
        </div>
      </section>
      {open && <PasswordModal onClose={() => setOpen(false)} />}
    </div>
  )
}
