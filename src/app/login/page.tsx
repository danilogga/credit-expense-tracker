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
          <span className="login-logo">💳</span>
          <h1>Expense Tracker</h1>
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
          <button type="submit" style={{ width: "100%", justifyContent: "center" }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
