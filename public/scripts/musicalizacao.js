document.addEventListener('DOMContentLoaded', async () => {
  const config = JSON.parse(sessionStorage.getItem('musicalizacao_config'));
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
        const res = await window.authFetch(`/api/profile?id=${user.id}`);
        const profile = await res.json();
        if (profile.full_name) name = profile.full_name;
      } catch (err) {
        console.error('Erro ao buscar nome:', err);
      }
    }
    if (!name) name = user.email?.split('@')[0] || '...';
    
    // Formatting name for display
    name = name.split(/[\.\s]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
    window.auxiliarFullName = name;
    
    summary.innerHTML = `
      <strong>Mês:</strong> ${config.mes}${config.ano ? '/' + config.ano : ''} |
      <strong>Município:</strong> ${config.municipio} |
      <strong>Polo:</strong> ${config.comum} <br>
      <span style="color: var(--brand); font-weight: 700;">Responsável: ${name}</span>
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
      <div class="sunday-card-title">${title}</div>
      ${dateField}
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
        <div class="form-group">
          <label>Ciclo</label>
          <select name="ciclo_${index}" class="form-control">
            <option value="Ciclo 1">Ciclo 1</option>
            <option value="Ciclo 2">Ciclo 2</option>
            <option value="Ciclo 3">Ciclo 3</option>
            <option value="Ciclo 4">Ciclo 4</option>
          </select>
        </div>
        <div class="form-group">
          <label>Número da Aula (Lição)</label>
          <input type="number" name="numero_aula_${index}" min="1" value="1" required class="form-control">
        </div>
      </div>

      <div class="grid-counts" style="grid-template-columns: repeat(2, 1fr); margin-bottom: 15px;">
        <div class="form-group">
          <label>Meninas</label>
          <input type="number" name="meninas_${index}" min="0" value="0" required class="count-input">
        </div>
        <div class="form-group">
          <label>Meninos</label>
          <input type="number" name="meninos_${index}" min="0" value="0" required class="count-input">
        </div>
      </div>

      <div class="grid-counts" style="margin-bottom: 15px; background: #f8fafc; padding: 10px; border-radius: 8px;">
        <div class="form-group">
          <label style="font-size: 11px;">Colaboradores</label>
          <input type="number" name="colaboradores_${index}" min="0" value="0" class="count-input" style="font-size: 14px; height: 35px;">
        </div>
        <div class="form-group">
          <label style="font-size: 11px;">Coordenadores</label>
          <input type="number" name="coordenadores_${index}" min="0" value="0" class="count-input" style="font-size: 14px; height: 35px;">
        </div>
        <div class="form-group">
          <label style="font-size: 11px;">Instrutores</label>
          <input type="number" name="instrutores_${index}" min="0" value="0" class="count-input" style="font-size: 14px; height: 35px;">
        </div>
      </div>

      <div class="suspension-row">
        <label class="suspension-toggle">
          <input type="checkbox" name="suspenso_${index}" class="suspension-checkbox">
          <span>Não houve aula nesta data</span>
        </label>
        <div class="justification-area hidden">
          <label style="font-size: 11px; margin-bottom: 4px;">Motivo:</label>
          <select name="justificativa_pre_${index}" class="justification-select">
            <option value="">-- Selecione o motivo --</option>
            <option value="Feriado">Feriado</option>
            <option value="Reforma">Reforma</option>
            <option value="Evento Regional">Evento Regional</option>
            <option value="Falta de Alunos">Falta de Alunos</option>
            <option value="Outros">Outros</option>
          </select>
          <input type="text" name="justificativa_custom_${index}" class="form-control other-justification hidden" placeholder="Descreva...">
        </div>
      </div>
    `;

    // Logic for suspension and inputs
    const inputs = card.querySelectorAll('.count-input');
    const selects = card.querySelectorAll('select:not(.justification-select)');
    const numberInputs = card.querySelectorAll('input[type="number"]:not(.count-input)');
    const suspensionCheckbox = card.querySelector(`.suspension-checkbox`);
    const justificationArea = card.querySelector(`.justification-area`);
    const justificationSelect = card.querySelector(`.justification-select`);
    const justificationCustom = card.querySelector(`.other-justification`);

    suspensionCheckbox.addEventListener('change', (e) => {
      const isSuspended = e.target.checked;
      card.classList.toggle('suspension-active', isSuspended);
      justificationArea.classList.toggle('hidden', !isSuspended);
      
      [...inputs, ...selects, ...numberInputs].forEach(el => {
        el.disabled = isSuspended;
        if (isSuspended && el.classList.contains('count-input')) {
          el.value = '0';
        }
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
      input.addEventListener('blur', () => { if (input.value === '') input.value = '0'; });
    });

    return card;
  }

  if (config.type === 'all') {
    config.sundays.forEach((dateBR, index) => {
      const [day, month, year] = dateBR.split('/');
      container.appendChild(createCard(`Aula Musicalização ${index + 1}`, index, `${year}-${month}-${day}`));
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

  const form = document.getElementById('musicalizacaoForm');
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
      let just = '';
      if (isSus) {
        const pre = rawData[`justificativa_pre_${i}`];
        just = pre === 'Outros' ? (rawData[`justificativa_custom_${i}`] || 'Outro') : pre;
      }

      entries.push({
        data_aula: formatToISO(dateLabel),
        cidade: config.municipio,
        polo: config.comum,
        ciclo: rawData[`ciclo_${i}`],
        numero_aula: parseInt(rawData[`numero_aula_${i}`] || '0', 10),
        meninas_presentes: isSus ? 0 : parseInt(rawData[`meninas_${i}`] || '0', 10),
        meninos_presentes: isSus ? 0 : parseInt(rawData[`meninos_${i}`] || '0', 10),
        colaboradores_presentes: isSus ? 0 : parseInt(rawData[`colaboradores_${i}`] || '0', 10),
        coordenadores_presentes: isSus ? 0 : parseInt(rawData[`coordenadores_${i}`] || '0', 10),
        instrutores_presentes: isSus ? 0 : parseInt(rawData[`instrutores_${i}`] || '0', 10),
        observacoes: just
      });
    }

    Swal.fire({ title: 'Enviando...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      for (const entry of entries) {
        const res = await window.authFetch('/api/atividades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const errObj = new Error(body.error || 'Erro no envio.');
          errObj.status = res.status;
          throw errObj;
        }
      }
      // Montar lista de datas das aulas submetidas (para presença nominal)
      const datasAulas = entries
        .filter(e => !e.observacoes || e.observacoes === '')
        .map(e => e.data_aula)
        .filter(Boolean);

      // Salvar config para a página de presença
      sessionStorage.setItem('presenca_config', JSON.stringify({
        polo: config.comum,
        municipio: config.municipio,
        data_aulas: datasAulas.length > 0 ? datasAulas : entries.map(e => e.data_aula).filter(Boolean)
      }));

      Swal.fire({
        title: '✅ Enviado com Sucesso!',
        html: `<div style="font-size:15px; color:#475569; text-align:left; line-height:1.7;">
          Presença registrada com sucesso.<br><br>
          <strong style="color:#1e4b7a;">Deseja também registrar a frequência nominal dos alunos?</strong><br>
          <span style="font-size:13px; color:#64748b;">Marque cada aluno como presente ou faltou.</span>
        </div>`,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '📋 Lançar Presença Nominal',
        cancelButtonText: 'Encerrar',
        confirmButtonColor: '#059669',
        cancelButtonColor: '#64748b',
        reverseButtons: false
      }).then(result => {
        if (result.isConfirmed) {
          window.location.href = '/presenca';
        } else {
          window.location.href = '/';
        }
      });
    } catch (err) {
      if (err.status === 409) {
        Swal.fire({
          title: 'Lançamento Bloqueado',
          html: `<div style="font-size:15px; color:#475569; text-align:center;">${err.message}</div>`,
          icon: 'warning',
          confirmButtonColor: '#1e4b7a',
          confirmButtonText: 'Entendi'
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#1e4b7a',
          timer: 5000,
          timerProgressBar: true
        });
      }
    } finally {
      isSubmitting = false;
      setSubmittingState(false);
    }
  });
});
