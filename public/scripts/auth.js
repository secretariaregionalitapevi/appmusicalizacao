let supabaseClient;

window.togglePassword = (id) => {
  const input = document.getElementById(id);
  const container = input.closest('.form-group');
  const toggle = container.querySelector('.password-toggle');
  
  if (input.type === 'password') {
    input.type = 'text';
    // Mudar para olho fechado (eye-off)
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
  } else {
    input.type = 'password';
    // Mudar para olho aberto (eye)
    toggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  }
};

async function initSupabase() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    // Atribui ao escopo global para outros scripts usarem se necessário
    window.supabaseClient = supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        storage: window.sessionStorage // Sessão morre quando fecha a aba/navegador
      }
    });
    supabaseClient = window.supabaseClient;
  } catch (err) {
    console.error('Falha ao inicializar Supabase:', err);
  }
}

window.checkAuth = async () => {
  if (!supabaseClient) await initSupabase();
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  const user = session?.user;

  if (!user && window.location.pathname !== '/login.html') {
    window.location.href = '/login.html';
    return null;
  }
  
  return user;
};

window.authFetch = async (url, options = {}) => {
  if (!supabaseClient) await initSupabase();
  
  const { data: { session } } = await supabaseClient.auth.getSession();
  const token = session?.access_token;
  
  options.headers = options.headers || {};
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }
  
  return fetch(url, options);
};

const errorTranslations = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos.',
  'Signup disabled': 'O cadastro está temporariamente desativado.',
};

function translateError(msg) {
  for (const [eng, pt] of Object.entries(errorTranslations)) {
    if (msg.includes(eng)) return pt;
  }
  return msg;
}

// Logica para os formularios de login e registro
document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      const feedback = document.getElementById('loginFeedback');
      
      if (feedback) feedback.textContent = 'Autenticando...';
      if (!supabaseClient) await initSupabase();
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (feedback) feedback.textContent = 'Erro: ' + translateError(error.message);
      } else {
        // Limpar apenas configuracoes especificas de dados, mas nao a sessao do Supabase
        sessionStorage.removeItem('musicalizacao_config');
        window.location.href = '/';
      }
    });
  }

  // REGISTRO
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = e.target.fullName.value;
      const email = e.target.email.value;
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;
      const comum = e.target.comum.value;
      const cidade = e.target.cidade ? e.target.cidade.value : 'Itapevi';
      const feedback = document.getElementById('registerFeedback');
      const comumSearch = document.getElementById('comumSearch');

      if (!comum || (comumSearch && comumSearch.value.trim() !== comum.trim())) {
        if (feedback) feedback.textContent = 'Selecione um Polo da lista antes de criar a conta.';
        comumSearch?.focus();
        return;
      }

      if (password !== confirmPassword) {
        if (feedback) feedback.textContent = 'As senhas não coincidem.';
        return;
      }

      if (feedback) feedback.textContent = 'Criando conta...';
      if (!supabaseClient) await initSupabase();

      // 1. Criar usuario no Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            comum: comum,
            cidade: cidade,
            cadastro_origem: 'musicalizacao',
            cadastro_origem_label: 'Musicalização'
          }
        }
      });

      if (authError) {
        if (feedback) feedback.textContent = 'Erro: ' + translateError(authError.message);
        return;
      }

      // 2. Salvar perfil na tabela rjm_auxiliares via API do servidor (seguro contra RLS/permissao)
      try {
        const resProf = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: authData.user.id,
            full_name: fullName,
            email: email,
            comum: comum,
            cidade: cidade
          })
        });
        const resProfData = await resProf.json();
        console.log('Resposta /api/profile:', resProfData);
      } catch (err) {
        console.error('Erro ao salvar perfil via API:', err);
      }

      Swal.fire({
        title: 'Conta Criada!',
        text: 'Sua conta foi criada com sucesso. Faça login para continuar.',
        icon: 'success',
        confirmButtonColor: '#1e4b7a'
      }).then(() => {
        // Limpar estados locais ao criar conta
        sessionStorage.removeItem('musicalizacao_config');
        window.location.href = '/login.html';
      });
    });
  }
});
