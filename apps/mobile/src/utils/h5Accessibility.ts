/** uni-button is a custom element in uni H5, not an HTML button. Enhance it once. */
export function installH5Accessibility() {
  const enhance = (root: ParentNode) => {
    root.querySelectorAll<HTMLElement>('uni-button').forEach((el) => {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button')
      const disabled =
        el.hasAttribute('disabled') ||
        el.classList.contains('is-disabled') ||
        el.classList.contains('is-loading')
      el.setAttribute('tabindex', disabled ? '-1' : '0')
      el.setAttribute('aria-disabled', String(disabled))
    })
    root.querySelectorAll<HTMLInputElement>('input').forEach((el) => {
      if (!el.getAttribute('aria-label') && !el.labels?.length) {
        const label =
          el.closest('.wd-input')?.querySelector('.wd-input__label')?.textContent?.trim() ||
          el.placeholder ||
          el.closest('uni-input')?.querySelector('.uni-input-placeholder')?.textContent?.trim()
        if (label) el.setAttribute('aria-label', label)
      }
    })
  }
  enhance(document)
  const observer = new MutationObserver((records) => {
    if (
      records.some(
        (r) =>
          r.type === 'childList' || r.attributeName === 'disabled' || r.attributeName === 'class',
      )
    )
      enhance(document)
  })
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['disabled', 'class'],
  })
  document.addEventListener('keydown', (event) => {
    const el = (event.target as HTMLElement)?.closest<HTMLElement>('uni-button')
    if (!el || event.defaultPrevented || event.repeat || !['Enter', ' '].includes(event.key)) return
    event.preventDefault()
    if (el.getAttribute('aria-disabled') !== 'true') el.click()
  })
  return () => observer.disconnect()
}
