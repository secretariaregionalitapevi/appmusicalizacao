document.addEventListener('DOMContentLoaded', async () => {
  const config = JSON.parse(sessionStorage.getItem('recitativos_config'));
  if (!config) {
    window.location.href = '/';
    return;
  }

  const container = document.getElementById('cardsContainer');
  const summary = document.getElementById('selectionSummary');
  const datePickerRow = document.getElementById('datePickerRow');
  const selectedDateSelect = document.getElementById('selectedDate');

  window.updateSummaryWithName = async (user) => {
    let name = user.user_metadata?.full_name;
    if (!name) {
      try {
        const res = await fetch(`/api/profile?id=${user.id}`);
        const profile = await res.json();
        if (profile.full_name) name = profile.full_name;
      } catch (err) {
        console.error('Erro ao buscar nome:', err);
      }
    }
    if (!name) name = user.email?.split('@')[0] || '...';
    if (name.toLowerCase() === 'ricardograngeiro') {
      name = 'Ricardo Grangeiro';
    } else {
      name = name.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }
    window.auxiliarFullName = name;
    summary.innerHTML = `
      <strong>Mês:</strong> ${config.mes} |
      <strong>Município:</strong> ${config.municipio} |
      <strong>Comum:</strong> ${config.comum} <br>
      <span style="color: var(--brand); font-weight: 700;">Nome: ${name}</span>
    `;
  };

  if (window.currentUser) {
    await window.updateSummaryWithName(window.currentUser);
  }

  function createCard(title, index, initialISO = null) {
    const card = document.createElement('div');
    card.className = 'sunday-card';
    const dateField = initialISO
      ? `<label style="font-size: 13px; color: #64748b; margin-bottom: 5px; display: block;">Confirme a data:</label>
         <input type="date" name="date_${index}" value="${initialISO}" required class="form-control">`
      : `<input type="hidden" name="date_${index}" value="${title.replace('Data: ', '')}">`;

    card.innerHTML = `
      <div class="sunday-card-title" style="margin-bottom: 10px; color: var(--brand); font-weight: 700;">${title}</div>
      ${dateField}
      <div class="grid-counts">
        <div class="form-group">
          <label>Meninas</label>
          <input type="number" name="meninas_${index}" min="0" value="0" required class="count-input">
        </div>
        <div class="form-group">
          <label>Meninos</label>
          <input type="number" name="meninos_${index}" min="0" value="0" required class="count-input">
        </div>
        <div class="form-group">
          <label>Total</label>
          <input type="number" name="total_presentes_${index}" value="0" readonly class="count-input total-field">
        </div>
      </div>
      <div class="suspension-row">
        <label class="suspension-toggle">
          <input type="checkbox" name="suspenso_${index}" class="suspension-checkbox">
          <span>EBI Suspenso nesta data</span>
        </label>
        <div class="justification-area hidden">
          <label style="font-size: 11px; margin-bottom: 4px;">Motivo da Suspensão:</label>
          <select name="justificativa_pre_${index}" class="justification-select">
            <option value="">-- Selecione o motivo --</option>
            <option value="Reforma">Reforma</option>
            <option value="Culto de Mocidade">Culto de Mocidade</option>
            <option value="Evento Regional">Evento Regional</option>
            <option value="Outros">Outros</option>
          </select>
          <input type="text" name="justificativa_custom_${index}" class="form-control other-justification hidden" placeholder="Descreva...">
        </div>
      </div>
    `;

    const inputs = card.querySelectorAll('.count-input:not(.total-field)');
    const totalField = card.querySelector(`input[name="total_presentes_${index}"]`);
    const suspensionCheckbox = card.querySelector(`.suspension-checkbox`);
    const justificationArea = card.querySelector(`.justification-area`);
    const justificationSelect = card.querySelector(`.justification-select`);
    const justificationCustom = card.querySelector(`.other-justification`);

    suspensionCheckbox.addEventListener('change', (e) => {
      const isSuspended = e.target.checked;
      card.classList.toggle('suspension-active', isSuspended);
      justificationArea.classList.toggle('hidden', !isSuspended);
      inputs.forEach(input => {
        input.disabled = isSuspended;
        if (isSuspended) { input.value = '0'; input.dispatchEvent(new Event('input')); }
      });
      justificationSelect.required = isSuspended;
    });

    justificationSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'Outros') {
        justificationCustom.classList.remove('hidden');
        justificationCustom.required = true;
      } else {
        justificationCustom.classList.add('hidden');
        justificationCustom.required = false;
      }
    });

    inputs.forEach(input => {
      input.addEventListener('focus', () => { if (input.value === '0') input.value = ''; });
      input.addEventListener('blur', () => { if (input.value === '') { input.value = '0'; input.dispatchEvent(new Event('input')); } });
      input.addEventListener('input', () => {
        let sum = 0;
        inputs.forEach(f => sum += parseInt(f.value || 0, 10));
        totalField.value = sum;
      });
    });

    return card;
  }

  if (config.type === 'all') {
    config.sundays.forEach((dateBR, index) => {
      const [day, month, year] = dateBR.split('/');
      container.appendChild(createCard(`Reunião das Crianças ${index + 1}`, index, `${year}-${month}-${day}`));
    });
  } else {
    datePickerRow.classList.remove('hidden');
    selectedDateSelect.value = new Date().toISOString().split('T')[0];
    const updateCard = (iso) => {
      container.innerHTML = '';
      if (!iso) return;
      const [y, m, d] = iso.split('-');
      container.appendChild(createCard(`Data: ${d}/${m}/${y}`, 0));
    };
    updateCard(selectedDateSelect.value);
    selectedDateSelect.addEventListener('change', (e) => updateCard(e.target.value));
  }

  const formatToISO = (dateStr) => {
    if (!dateStr || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : dateStr;
  };

  const form = document.getElementById('recitativosForm');
  let isSubmitting = false;

  const setSubmittingState = (st) => {
    Array.from(form.querySelectorAll('button, input, select')).forEach(c => {
      if (c.id !== 'selectedDate') c.disabled = st;
    });
    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.textContent = st ? 'Enviando...' : 'Finalizar e Enviar Presença';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const user = window.currentUser;
    if (!user) {
      Swal.fire('Erro', 'Faça login novamente.', 'error');
      return;
    }

    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());
    const entries = [];
    const count = config.type === 'all' ? config.sundays.length : 1;

    isSubmitting = true;
    setSubmittingState(true);

    for (let i = 0; i < count; i++) {
      const dateLabel = config.type === 'all' ? rawData[`date_${i}`] : selectedDateSelect.value;
      const isSus = rawData[`suspenso_${i}`] === 'on';
      let just = '-';
      if (isSus) {
        const pre = rawData[`justificativa_pre_${i}`];
        just = pre === 'Outros' ? (rawData[`justificativa_custom_${i}`] || 'Outro') : pre;
      }

      entries.push({
        data_reuniao: formatToISO(dateLabel),
        meninas: isSus ? 0 : parseInt(rawData[`meninas_${i}`] || '0', 10),
        meninos: isSus ? 0 : parseInt(rawData[`meninos_${i}`] || '0', 10),
        colaboradores: 0,
        suspenso: isSus ? 'Sim' : 'Não',
        justificativa: just,
        instrutora: window.auxiliarFullName || user.email,
        localidade: config.comum,
        cidade: config.municipio,
        // Campos obrigatórios conforme restrições NOT NULL da tabela ebi_atividades
        livro: '-',
        capitulo: '-',
        versiculo: '-',
        titulo_historia: '-'
      });
    }

    Swal.fire({ title: 'Enviando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      for (const entry of entries) {
        const res = await fetch('/api/atividades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Erro no envio.');
        }
      }
      Swal.fire({
        title: 'Sucesso!',
        text: 'Presença registrada.',
        icon: 'success',
        timer: 4000,
        timerProgressBar: true,
        confirmButtonColor: '#1e4b7a'
      }).then(() => window.location.href = '/');
    } catch (err) {
      Swal.fire({
        title: 'Erro',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#1e4b7a',
        timer: 4000,
        timerProgressBar: true
      });
    } finally {
      isSubmitting = false;
      setSubmittingState(false);
    }
  });
});
