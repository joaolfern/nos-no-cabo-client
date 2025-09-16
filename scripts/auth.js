
function getParsedError(error) {
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && Array.isArray(parsed)) {
      return parsed.map(item => item.msg).join(', ');
    }
    if (parsed && parsed.error) {
      return parsed.error;
    }
  } catch (e) {}
  return error.message;
}


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.auth-form');
  const button = document.querySelector('.auth-form-button');

    window.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();

        const authForm = document.querySelector('.auth-form-container');

        const state = authForm.classList.toggle('hidden');

        const projectList = document.querySelector('.list');
        const joinForm = document.querySelector('.join-form-container');

        if (state) {
          projectList.classList.remove('hidden');
        } else {
          projectList.classList.add('hidden');
          joinForm.classList.add('hidden');
        }

      }
    });

  if (!form || !button) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const originalText = button.innerHTML;
    button.innerHTML = SPINNER_SMALL + 'Entrando';
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText   || 'Falha ao autenticar');
      }

      showHome()


    } catch (error) {
      const parsedError = getParsedError(error);
      alert(parsedError);
    } finally {
      button.innerHTML = originalText;
    }
  });
});
