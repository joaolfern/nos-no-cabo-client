const URL_IN_TEXT = /https?:\/\/\S+/
const TRAILING_PUNCTUATION = /[.,;:!?)]+$/

function urlInText(text: string | null) {
  const match = text?.match(URL_IN_TEXT)
  return match ? match[0].replace(TRAILING_PUNCTUATION, '') : ''
}

// Android's share sheet often sends the page address inside `text` instead of `url`.
export function sharedUrl(params: URLSearchParams) {
  return params.get('url') || urlInText(params.get('text'))
}
