import { Wallet } from "@phosphor-icons/react/dist/ssr";
import { loginAction } from "./actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-mark">
            <Wallet size={22} weight="fill" />
          </div>
          <div>
            <h1>Planner</h1>
            <p>Cartão de crédito</p>
          </div>
        </div>

        {error && <p className="login-error">{error}</p>}

        <form action={loginAction} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="admin"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="login-submit">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
