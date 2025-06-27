const API_URL = 'http://localhost:3000'
const SPINNER = '<svg class="spinner" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_5nOS{transform-origin:center;animation:spinner_sEAn .75s infinite linear;fill:currentColor;}@keyframes spinner_sEAn{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" class="spinner_5nOS"/></svg>'
const SPINNER_SMALL = '<svg class="spinner" width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_5nOS{transform-origin:center;animation:spinner_sEAn .75s infinite linear;fill:currentColor;}@keyframes spinner_sEAn{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" class="spinner_5nOS"/></svg>';
const SPINNER_SECTION = `<div class="loader">${SPINNER}</div>`

window.addEventListener('DOMContentLoaded', () => {
  initializeList()
  handleGoBack()
  handleShowForm()
})

const renderEditButton = ({ name, id }) => `<button class='list-item-button list-item-edit' arial-label='Editar ${name}' title='Editar ${name}' data-id="${id}" ><img src='./assets/editIcon.svg'/></button>`
const renderRemoveButton = ({ name, id }) => `<button class='list-item-button list-item-remove' data-id="${id}" arial-label='Remover ${name}' title='Remover ${name}'><img src='./assets/removeIcon.svg'/></button>`
const renderListItem = ({ name, url, id }) => `<li class="list-item">${renderRemoveButton({ name, id })}<a class="list-item-link" href=${url} target="_blank" aria-label=${name}></a><span class='list-item-text-inner'><span class="list-item-text">${name}</span>${renderEditButton({ name, id })}</span></li>`
const renderListContainer = ({ listItems, shouldUseExtraColumn }) => `<ol class="list-content"${shouldUseExtraColumn ? ` style="--max-column-count: 4"` : ''}>${listItems}<ol>`

let currentList = []
let currentFormCleanup = null

async function initializeList () {
  const listContainer = document.querySelector('.list-content-container')
  listContainer.innerHTML = SPINNER_SECTION

  try {
    const response = await fetch(`${API_URL}/project`)
    const data = await response.json()

    renderList(data)
  } catch (error) {
    console.error('Error rendering list:', error)
    listContainer.innerHTML = `<p>Não foi possível carregar os projetos: ${error.message}</p>`
  }
}

function renderList (data) {
  const listContainer = document.querySelector('.list-content-container')

  if (data && data.length > 0) {
    const listItems = data.map(renderListItem).join('')
    const shouldUseExtraColumn = data.length > 83

    listContainer.innerHTML = renderListContainer({ listItems, shouldUseExtraColumn })

    currentList = data
    handleItemsRemoval()
    handleItemsEdit()

    return
  }
  listContainer.innerHTML = '<p>No items found</p>'
}

function handleShowForm () {
  const button = document.querySelector('#show-form')

  button.addEventListener('click', () => {
    toggleHome()
    setFormTexts({ title: 'Adicionar Projeto', button: 'Adicionar' })

    if (currentFormCleanup) currentFormCleanup()
    currentFormCleanup = handleFormSubmit(handleProjectCreate)
  })
}

function handleGoBack () {
  const button = document.querySelector('#go-back')

  button.addEventListener('click', () => {
    const formContainer = document.querySelector('.form-container')
    const listContainer = document.querySelector('.list')
    const form = document.querySelector('.form')
    form.reset()

    formContainer.classList.add('hidden')
    listContainer.classList.remove('hidden')
  })
}

function handleFormSubmit (action) {
  const button = document.querySelector('.form-button')

  const handler = async (event) => {
    event.preventDefault()
    const form = document.querySelector('.form')

    if (!form.checkValidity()) {
      form.reportValidity()
      return;
    }


    const originalText = button.innerHTML

    button.innerHTML = SPINNER_SMALL + 'Salvando'

    const formData = new FormData(form)

    const data = {}
    for (let [key, value] of formData.entries()) {
      data[key] = value
    }

    try {
      const body = JSON.stringify(data)

      await action(body)

      form.reset()
      toggleHome()
      initializeList()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(`Error adding item: ${error.message}`)
    } finally {
      button.innerHTML = originalText
    }
  }

  button.addEventListener('click', handler)

  const cleanup = () => {
    button.removeEventListener('click', handler)
  }

  return cleanup
}

async function handleProjectCreate (body) {
  const response = await fetch(`${API_URL}/project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  })

  if (!response) {
    throw new Error('Failed to add item')
  }
}

const handleProjectUpdate = (id) => (
  async (body) => {
    const response = await fetch(`${API_URL}/project/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })

    if (!response) {
      throw new Error('Failed to add item')
    }
  }
)

function handleItemsRemoval () {
  const buttons = document.querySelectorAll('.list-item-remove')

  for (const btn of buttons) {
    btn.addEventListener('click', async (event) => {
      event.preventDefault()

      const id = Number(btn.getAttribute('data-id'))
      const originalText = btn.innerHTML
      btn.innerHTML = SPINNER_SMALL

      btn.classList.add('list-button-loading')
      try {
        const response = await fetch(`${API_URL}/project/${id}`, {
          method: 'DELETE'
        })

        if (!response.ok) {
          throw new Error('Failed to remove item')
        }

        const updatedList = currentList.filter(item => item.id !== id)
        renderList(updatedList)
      } catch (error) {
        console.error('Error removing item:', error)
        alert(`Error removing item: ${error.message}`)
      } finally {
        btn.innerHTML = originalText
        btn.classList.remove('list-button-loading')
      }
    })
  }
}


function handleItemsEdit () {
  const buttons = document.querySelectorAll('.list-item-edit')

  for (const btn of buttons) {
    btn.addEventListener('click', (event) => {
      event.preventDefault()
      const listItem = btn.closest('.list-item')

      setFormTexts({ title: 'Editar Projeto', button: 'Salvar' })

      const linkElement = listItem.querySelector('.list-item-link')
      const url = linkElement.getAttribute('href')
      const name = listItem.querySelector('.list-item-text-inner').textContent

      fillForm({
        url,
        name
      })

      const id = Number(btn.getAttribute('data-id'))
      toggleHome()

      if (currentFormCleanup) currentFormCleanup()
      currentFormCleanup = handleFormSubmit(handleProjectUpdate(id))

      fillFormWithProjectFromServer(id)
    })
  }
}

async function fillFormWithProjectFromServer (id) {
  const project = await getProject(id)

  if (project) fillForm(project)
}

function fillForm (data) {
  const form = document.querySelector('.form')


  for (const field in data) {
    const value = data[field]
    if (value) {

      form[field].value = value
    }
  }
}

async function getProject (id) {
  try {
    const response = await fetch(`${API_URL}/project/${id}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching project:', error)
    throw new Error(`Failed to fetch project with id ${id}: ${error.message}`)
  }
}

function toggleHome () {
  const formContainer = document.querySelector('.form-container')
  const listContainer = document.querySelector('.list')
  const form = document.querySelector('.form')

  form.reset()
  formContainer.classList.toggle('hidden')
  listContainer.classList.toggle('hidden')
}

function setFormTexts ({ title, button }) {
  const titleElement = document.querySelector('.form-container .page-subtitle')
  const buttonElement = document.querySelector('.form-button')

  titleElement.textContent = title
  buttonElement.textContent = button
}
