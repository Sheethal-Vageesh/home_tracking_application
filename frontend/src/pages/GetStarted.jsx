import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Card, Container } from '../components/ui'

export function GetStarted() {
  return (
    <AppShell>
      <Container>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Choose your role</h2>
          <p className="mt-2 text-sm text-slate-600">
            Clinicians can manage parent requests. Parents can choose a clinician and request access.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Card className="text-left">
              <div className="text-sm font-semibold text-slate-900">Clinician</div>
              <p className="mt-2 text-sm text-slate-600">Register / login to accept parent requests.</p>
              <div className="mt-4">
                <Link to="/clinician/auth">
                  <Button className="w-full">Clinician login / register</Button>
                </Link>
              </div>
            </Card>

            <Card className="text-left">
              <div className="text-sm font-semibold text-slate-900">Parent</div>
              <p className="mt-2 text-sm text-slate-600">
                Choose your clinician, submit child details, and send a request.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/parent/request">
                  <Button className="w-full">Send request</Button>
                </Link>
                <Link to="/parent/login">
                  <Button className="w-full" variant="secondary">
                    Already have Child ID
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </AppShell>
  )
}

