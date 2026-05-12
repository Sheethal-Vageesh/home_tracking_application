import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Button, Card, Container } from '../components/ui'

export function GetStarted() {
  return (
    <AppShell>
      <Container>
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Choose your role
            </h2>

            <div className="mt-2 text-lg font-medium text-indigo-700">
              ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Clinicians can manage parent requests. Parents can choose a clinician
              and request access.
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              ತಜ್ಞರು (Clinicians) ಪೋಷಕರ ವಿನಂತಿಗಳನ್ನು ನಿರ್ವಹಿಸಬಹುದು.
              ಪೋಷಕರು ತಮ್ಮ ತಜ್ಞರನ್ನು ಆಯ್ಕೆಮಾಡಿ ಪ್ರವೇಶಕ್ಕಾಗಿ ವಿನಂತಿಸಬಹುದು.
            </p>
          </div>

          {/* Cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">

            {/* Clinician */}
            <Card className="text-left border border-indigo-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Clinician
                </div>

                <div className="text-xs font-medium text-slate-500">
                  ತಜ್ಞರು
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Register / login to accept parent requests.
              </p>

              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                ಪೋಷಕರ ವಿನಂತಿಗಳನ್ನು ಸ್ವೀಕರಿಸಲು ನೋಂದಣಿ / ಲಾಗಿನ್ ಮಾಡಿ.
              </p>

              <div className="mt-5">
                <Link to="/clinician/auth">
                  <Button className="w-full">
                    Clinician Login / Register
                    <span className="ml-1 text-xs opacity-90">
                      (ತಜ್ಞರ ಲಾಗಿನ್ / ನೋಂದಣಿ)
                    </span>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Parent */}
            <Card className="text-left border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Parent
                </div>

                <div className="text-xs font-medium text-slate-500">
                  ಪೋಷಕರು
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Choose your clinician, submit child details, and send a request.
              </p>

              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                ನಿಮ್ಮ ತಜ್ಞರನ್ನು ಆಯ್ಕೆಮಾಡಿ, ಮಗುವಿನ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ ಮತ್ತು ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಿ.
              </p>

              <div className="mt-5 flex flex-col gap-3">

                <Link to="/parent/request">
                  <Button className="w-full">
                    Send Request
                    <span className="ml-1 text-xs opacity-90">
                      (ವಿನಂತಿ ಕಳುಹಿಸಿ)
                    </span>
                  </Button>
                </Link>

                <Link to="/parent/login">
                  <Button className="w-full" variant="secondary">
                    Already have Child ID
                    <span className="ml-1 text-xs opacity-90">
                      (Child ID ಈಗಾಗಲೇ ಇದೆ)
                    </span>
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


// import { Link } from 'react-router-dom'
// import { AppShell } from '../components/AppShell'
// import { Button, Card, Container } from '../components/ui'

// export function GetStarted() {
//   return (
//     <AppShell>
//       <Container>
//         <div className="mx-auto max-w-3xl">
//           <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Choose your role</h2>
//           <p className="mt-2 text-sm text-slate-600">
//             Clinicians can manage parent requests. Parents can choose a clinician and request access.
//           </p>

//           <div className="mt-5 grid gap-4 sm:grid-cols-2">
//             <Card className="text-left">
//               <div className="text-sm font-semibold text-slate-900">Clinician</div>
//               <p className="mt-2 text-sm text-slate-600">Register / login to accept parent requests.</p>
//               <div className="mt-4">
//                 <Link to="/clinician/auth">
//                   <Button className="w-full">Clinician login / register</Button>
//                 </Link>
//               </div>
//             </Card>

//             <Card className="text-left">
//               <div className="text-sm font-semibold text-slate-900">Parent</div>
//               <p className="mt-2 text-sm text-slate-600">
//                 Choose your clinician, submit child details, and send a request.
//               </p>
//               <div className="mt-4 flex flex-col gap-2">
//                 <Link to="/parent/request">
//                   <Button className="w-full">Send request</Button>
//                 </Link>
//                 <Link to="/parent/login">
//                   <Button className="w-full" variant="secondary">
//                     Already have Child ID
//                   </Button>
//                 </Link>
//               </div>
//             </Card>
//           </div>
//         </div>
//       </Container>
//     </AppShell>
//   )
// }

