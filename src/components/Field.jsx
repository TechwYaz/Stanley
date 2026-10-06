import { useState } from 'react'

export default function Field({ label, error, type = 'text', ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const input = (
    <input {...props} type={isPassword && show ? 'text' : type} />
  )

  return (
    <div className="field">
      <label>{label}</label>
      {isPassword ? (
        <div className="password-row">
          {input}
          <button type="button" className="toggle-pass" onClick={() => setShow(!show)}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
      ) : (
        input
      )}
      {error && <span className="err">{error.message}</span>}
    </div>
  )
}
