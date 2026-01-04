'use client'

// Admin Page: Push Notification Test
// Internal tool for testing push notification delivery
// URL: /admin/push-test
// TODO: Add authentication/authorization check

import { useState } from 'react'
import { useAuthSession } from '@/hooks/useAuthSession'

export default function PushTestPage() {
  const { session } = useAuthSession()
  const userId = session?.user?.id
  const [targetUserId, setTargetUserId] = useState('')
  const [title, setTitle] = useState('Test Notification')
  const [message, setMessage] = useState('This is a test push notification from DAB')
  const [url, setUrl] = useState('/')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendTest = async () => {
    setSending(true)
    setError(null)
    setResult(null)

    try {
      // Get current session token for authentication
      const { data: { session } } = await (await import('@/lib/supabaseClient')).requireSupabase().auth.getSession()

      if (!session) {
        throw new Error('Not authenticated. Please log in.')
      }

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: targetUserId || userId,
          title,
          message,
          url,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send push')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-surface-bg)',
      padding: 'var(--space-xl)',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text-default)',
          marginBottom: 'var(--space-xl)',
        }}>
          🔔 Push Notification Test
        </h1>

        <div style={{
          backgroundColor: 'var(--color-surface-panel)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          border: '1px solid var(--color-border-default)',
        }}>
          {/* Target User ID */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-default)',
              marginBottom: 'var(--space-xs)',
            }}>
              Target User ID
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder={userId || 'Enter user UUID'}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-default)',
                fontSize: 'var(--font-size-md)',
              }}
            />
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-xs)',
            }}>
              Leave empty to send to yourself
            </p>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-default)',
              marginBottom: 'var(--space-xs)',
            }}>
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-default)',
                fontSize: 'var(--font-size-md)',
              }}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-default)',
              marginBottom: 'var(--space-xs)',
            }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-default)',
                fontSize: 'var(--font-size-md)',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* URL */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-default)',
              marginBottom: 'var(--space-xs)',
            }}>
              Click URL (optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/"
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-default)',
                fontSize: 'var(--font-size-md)',
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendTest}
            disabled={sending}
            style={{
              width: '100%',
              padding: 'var(--space-lg)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface-bg)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-md)',
              fontWeight: 'var(--font-weight-bold)',
              cursor: sending ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.5 : 1,
            }}
          >
            {sending ? 'Sending...' : 'Send Test Push'}
          </button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: 'var(--space-lg)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(92, 225, 230, 0.1)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
            }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-default)',
                margin: 0,
              }}>
                ✅ {result.message}
              </p>
              <pre style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-sm)',
                overflow: 'auto',
              }}>
                {JSON.stringify(result.results, null, 2)}
              </pre>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: 'var(--space-lg)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid var(--color-state-red)',
              borderRadius: 'var(--radius-md)',
            }}>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-state-red)',
                margin: 0,
              }}>
                ❌ {error}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-lg)',
          backgroundColor: 'var(--color-surface-panel)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-default)',
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-default)',
            marginTop: 0,
            marginBottom: 'var(--space-sm)',
          }}>
            Testing Instructions
          </h3>
          <ol style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            paddingLeft: 'var(--space-lg)',
            margin: 0,
          }}>
            <li>Go to /profile/settings and enable notifications</li>
            <li>Grant permission when browser prompts</li>
            <li>Enter your user ID or leave empty for self-test</li>
            <li>Customize title and message</li>
            <li>Click "Send Test Push"</li>
            <li>Check notification appears on device</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
