import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Card, Container, Input, Select } from '../components/ui'
import { api } from '../lib/api'

export function ParentRequest() {
  const [clinicians, setClinicians] = useState([])
  const [loadingClinicians, setLoadingClinicians] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    clinicianId: '',
    childName: '',
    childAge: '',
    parentName: '',
    email: '',
    phone: '',
  })

  const selectedClinician = useMemo(
    () => clinicians.find((c) => c.id === form.clinicianId) || null,
    [clinicians, form.clinicianId],
  )

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        setLoadingClinicians(true)
        const { data } = await api.get('/api/clinicians/public')
        if (!mounted) return
        setClinicians(data.clinicians || [])
      } catch (_e) {
        if (!mounted) return
        setClinicians([])
      } finally {
        if (mounted) setLoadingClinicians(false)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [])

  const onChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      const payload = {
        clinicianId: form.clinicianId,
        childName: form.childName,
        childAge: form.childAge,
        parentName: form.parentName,
        email: form.email,
        phone: form.phone,
      }
      const { data } = await api.post('/api/auth/parent/request', payload)
      setSuccess(`Request sent successfully. Request ID: ${data.requestId}`)
      setForm((s) => ({ ...s, childName: '', childAge: '', parentName: '', email: '', phone: '' }))
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send request')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Send request to your clinician</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose a clinician, enter child & parent details, and submit your request. Once accepted, you’ll receive a
            unique Child ID by email.
          </p>

          <Card className="mt-5">
            <form onSubmit={onSubmit} className="grid gap-3">
              <Select
                label="Select clinician"
                value={form.clinicianId}
                onChange={onChange('clinicianId')}
                disabled={loadingClinicians}
              >
                <option value="">{loadingClinicians ? 'Loading clinicians…' : 'Choose a clinician'}</option>
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.specialization} ({c.clinicName})
                  </option>
                ))}
              </Select>

              {selectedClinician ? (
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  Selected: <span className="font-semibold">{selectedClinician.name}</span> ({selectedClinician.clinicName}
                  )
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Child name" value={form.childName} onChange={onChange('childName')} />
                <Input label="Child age" value={form.childAge} onChange={onChange('childAge')} placeholder="e.g., 4" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Parent name" value={form.parentName} onChange={onChange('parentName')} />
                <Input label="Phone" value={form.phone} onChange={onChange('phone')} />
              </div>
              <Input label="Email" value={form.email} onChange={onChange('email')} placeholder="parent@email.com" />

              {error ? <div className="text-sm font-medium text-red-700">{error}</div> : null}
              {success ? (
                <div className="text-sm font-medium text-emerald-700">
                  {success}{' '}
                  <span className="font-normal text-slate-600">
                    (Now wait for the clinician to accept. Then use your Child ID to log in.)
                  </span>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link className="text-sm font-semibold text-indigo-700" to="/parent/login">
                  Already have Child ID? Login
                </Link>
                <Button disabled={busy || !form.clinicianId} className="w-full sm:w-auto">
                  {busy ? 'Sending…' : 'Send request'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>
    </AppShell>
  )
}

