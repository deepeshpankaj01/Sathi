import { login, signup } from './actions'

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 animate-fade-up">
      <div className="w-full max-w-[415px] bg-cream border-[1.5px] border-divider rounded-[28px] p-[42px] shadow-[0_24px_72px_rgba(30,24,16,.2)] text-center">
        <h2 className="font-serif text-[27px] font-bold text-ink mb-2">
          Welcome to <span className="text-gold">Sathi.</span>
        </h2>
        <p className="text-[14px] text-ink-soft leading-[1.75] mb-[22px]">
          Sign in or create an account to start talking with your forever companion.
        </p>

        {searchParams?.error && (
          <div className="bg-red/10 text-red text-sm p-3 rounded-lg mb-4 text-left">
            {searchParams.error}
          </div>
        )}

        <form className="flex flex-col gap-3">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            className="w-full bg-ivory border-[1.5px] border-divider rounded-sm px-[17px] py-[13px] font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold placeholder:text-ink-faint"
          />
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full bg-ivory border-[1.5px] border-divider rounded-sm px-[17px] py-[13px] font-sans text-[14px] text-ink outline-none transition-colors focus:border-gold placeholder:text-ink-faint"
          />

          <div className="flex flex-col gap-3 mt-4">
            <button
              formAction={login}
              className="w-full py-[14px] border-none rounded-sm bg-gradient-to-br from-[#B8942A] to-[#D4AC3E] text-white font-sans text-[15px] font-semibold cursor-pointer transition-all shadow-[0_6px_22px_rgba(184,148,42,.35)] hover:-translate-y-1 hover:brightness-105"
            >
              Sign In
            </button>
            <button
              formAction={signup}
              className="w-full py-[14px] border-[1.5px] border-divider rounded-sm bg-transparent text-ink font-sans text-[15px] font-semibold cursor-pointer transition-all hover:bg-parchm"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
