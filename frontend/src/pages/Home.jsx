import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Card, Container } from '../components/ui'

export function Home() {
  return (
    <AppShell>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 indigo-gradient-to-b from-indigo-50 to-transparent" />
        <Container>
          <div className="grid gap-8 py-6 lg:grid-cols-2 lg:items-center lg:py-10">
            <div>
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-semibold text-indigo-700">
                FluentPath
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Track parent–child interaction strategies
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                A secure workflow for clinicians and parents to coordinate preschool home strategies for children who
                stutter — with demos, practice tracking, and progress review.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Link to="/get-started">
                  <Button className="w-full sm:w-auto">Get started</Button>
                </Link>
                {/* <Link to="/parent/login">
                  <Button className="w-full sm:w-auto" variant="secondary">
                    Parent login (Child ID)
                  </Button>
                </Link> */}
              </div>
            </div>

            <Card className="lg:ml-auto">
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">How FluentPath works</div>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  <li>Parents choose their clinician and send a request.</li>
                  <li>Clinicians accept requests and assign a Child ID.</li>
                  <li>Clinicians assign strategies with optional demo videos.</li>
                  <li>Parents practise, submit ratings/durations, and optionally upload a practice video.</li>
                </ol>
              </div>
            </Card>
          </div>
        </Container>
      </div>
    </AppShell>
  )
}

