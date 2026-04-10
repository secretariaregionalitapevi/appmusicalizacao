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

    // Se não tiver no metadata, tenta buscar na tabela rjm_auxiliares via API.
    if (!name) {
      try {
        const res = await fetch(`/api/profile?id=${user.id}`);
        const profile = await res.json();
        if (profile.full_name) {
          name = profile.full_name;
        }
      } catch (err) {
        console.error('Erro ao buscar nome completo:', err);
      }
    }

    if (!name) name = user.email?.split('@')[0] || '...';

    if (name.toLowerCase() === 'ricardograngeiro') {
      name = 'Ricardo Grangeiro';
    } else if (name.includes('.')) {
      name = name
        .split('.')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } else if (!user.user_metadata?.full_name) {
      name = name.charAt(0).toUpperCase() + name.slice(1);
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

    // No mensal, cada aula pode ter sua data ajustada. No avulso, a data
    // já é escolhida no topo e apenas reaproveitada no payload.
    const dateField = initialISO
      ? `<label style="font-size: 13px; color: #64748b; margin-bottom: 5px; display: block;">Confirme a data desta aula:</label>
         <input type="date" name="date_${index}" value="${initialISO}" required style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:6px; margin-bottom:15px; font-family:inherit;">`
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
    `;

    const inputs = card.querySelectorAll('.count-input:not(.total-field)');
    const totalField = card.querySelector(`input[name="total_presentes_${index}"]`);

    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        if (input.value === '0') input.value = '';
      });

      input.addEventListener('blur', () => {
        if (input.value === '') {
          input.value = '0';
          input.dispatchEvent(new Event('input'));
        }
      });

      input.addEventListener('input', () => {
        let sum = 0;
        inputs.forEach((field) => {
          sum += parseInt(field.value || 0, 10);
        });
        totalField.value = sum;
      });
    });

    return card;
  }

  if (config.type === 'all') {
    config.sundays.forEach((dateBR, index) => {
      const [day, month, year] = dateBR.split('/');
      const iso = `${year}-${month}-${day}`;
      container.appendChild(createCard(`Reunião das Crianças ${index + 1}`, index, iso));
    });
  } else {
    datePickerRow.classList.remove('hidden');

    const formatISODate = (date) => {
      const withZero = (value) => (value < 10 ? `0${value}` : String(value));
      return `${date.getFullYear()}-${withZero(date.getMonth() + 1)}-${withZero(date.getDate())}`;
    };

    selectedDateSelect.value = formatISODate(new Date());

    const updateCard = (isoDate) => {
      container.innerHTML = '';
      if (!isoDate) return;

      const [year, month, day] = isoDate.split('-');
      container.appendChild(createCard(`Data: ${day}/${month}/${year}`, 0));
    };

    updateCard(selectedDateSelect.value);
    selectedDateSelect.addEventListener('change', (event) => updateCard(event.target.value));
  }

  const formatToISO = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;

    return dateStr;
  };

  const form = document.getElementById('recitativosForm');
  let isSubmitting = false;

  const setSubmittingState = (submitting) => {
    const controls = Array.from(form.querySelectorAll('button, input, select, textarea'));
    controls.forEach((control) => {
      if (control.id === 'selectedDate') return;
      control.disabled = submitting;
    });

    const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    submitButtons.forEach((button) => {
      if (!button.dataset.originalLabel) {
        button.dataset.originalLabel = button.tagName === 'INPUT' ? button.value : button.textContent;
      }

      if (button.tagName === 'INPUT') {
        button.value = submitting ? 'Enviando...' : button.dataset.originalLabel;
      } else {
        button.textContent = submitting ? 'Enviando...' : button.dataset.originalLabel;
      }
    });
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    const user = window.currentUser;
    if (!user) {
      Swal.fire('Erro', 'Você precisa estar logado para enviar.', 'error');
      return;
    }

    const formData = new FormData(form);
    const rawData = Object.fromEntries(formData.entries());
    const entries = [];
    const count = config.type === 'all' ? config.sundays.length : 1;

    isSubmitting = true;
    setSubmittingState(true);

    for (let index = 0; index < count; index += 1) {
      const dateLabel = config.type === 'all' ? rawData[`date_${index}`] : selectedDateSelect.value;
      if (!dateLabel && config.type !== 'all') {
        isSubmitting = false;
        setSubmittingState(false);
        Swal.fire('Aviso', 'Selecione a data.', 'warning');
        return;
      }

      // Fallback: se a chave não estiver no rawData, tenta pegar via match direto no form
      let valMeninas = rawData[`meninas_${index}`];
      let valMeninos = rawData[`meninos_${index}`];

      if (valMeninas === undefined || valMeninas === '') {
        const inputM = form.querySelector(`input[name="meninas_${index}"]`);
        if (inputM) valMeninas = inputM.value;
      }
      if (valMeninos === undefined || valMeninos === '') {
        const inputH = form.querySelector(`input[name="meninos_${index}"]`);
        if (inputH) valMeninos = inputH.value;
      }

      const meninas = parseInt(String(valMeninas || '0').trim() || '0', 10);
      const meninos = parseInt(String(valMeninos || '0').trim() || '0', 10);

      const entry = {
        data_reuniao: formatToISO(dateLabel),
        meninas,
        meninos,
        colaboradoras: 0,
        livro: '-',
        capitulo: '-',
        versiculo: '-',
        titulo_historia: '-',
        instrutora: window.auxiliarFullName || user.user_metadata?.full_name || user.email.split('@')[0],
        localidade: config.comum,
        cidade: config.municipio
      };

      console.log(`[Cadastro EBI] Coletando Payload Reunião das Crianças ${index + 1}:`, entry);
      entries.push(entry);
    }

    Swal.fire({
      title: 'Enviando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      for (const entry of entries) {
        const response = await fetch('/api/recitativos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });

        const responseBody = await response.json().catch(() => ({}));
        if (!response.ok) {
          const error = new Error(responseBody.error || 'Falha no envio de uma das datas.');
          error.status = response.status;
          error.payload = responseBody;
          throw error;
        }
      }

      Swal.fire({
        title: 'Sucesso!',
        text: 'Lançamento realizado com sucesso.',
        icon: 'success',
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#1e4b7a'
      }).then(() => {
        window.location.href = '/';
      });
    } catch (err) {
      if (err.status === 409) {
        Swal.fire({
          title: 'Lançamento já realizado',
          text: err.payload?.error || 'Esta Comum já realizou um lançamento nesta data. Procure a coordenação.',
          icon: 'warning',
          confirmButtonColor: '#1e4b7a',
          timer: 3500,
          timerProgressBar: true,
          showConfirmButton: true,
          confirmButtonText: 'OK'
        });
        return;
      }

      Swal.fire('Erro', err.message || 'Não foi possível concluir o lançamento.', 'error');
    } finally {
      isSubmitting = false;
      setSubmittingState(false);
    }
  });
});
