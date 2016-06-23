/**
 * Prevent override of the default paste event, often used by shady CTOs
 * who thinks we're not smart enough to decide when to use this standard
 * functionality on their website.
 */
document.addEventListener('paste', e => e.stopImmediatePropagation(), true)

/**
 * Remove events on <a> elements that have nothing to do here. Keey my links
 * clean, I only require an href attribute for it to work as expected.
 */
const blackList = ['onclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup']
const whiteList = ['id', 'target', 'rel', 'alt']
const blackSelector = blackList.reduce((end, cur, i) => end + `${i ? ', ' : ''}a[${cur}]`, '')

const blackMethod = () => {
  const links = document.querySelectorAll(blackSelector)

  for (let i = 0; i < links.length; ++i) {
    const link = links[i]
    blackList.forEach(attr => link.removeAttribute(attr))
    link.setAttribute('true-href', link.href)
    link.setAttribute('onclick', 'this.href=this.getAttribute("true-href")')
  }
}

/**
 * Since a lot of websites uses asynchronously loaded data, we're gonna listen
 * for new nodes and recall our blacklist method to catch newly created
 * elements in the DOM, with a little debounce.
 */

let id = null

const newObs = new MutationObserver(mutations => mutations.forEach(m => {
  if (!m.addedNodes) { return }
  if (id) { clearTimeout(id) }
  id = setTimeout(() => {
    id = null
    blackMethod()
  }, 500)
}))

/**
 * Blacklist on some loading events and observe document
 */
window.addEventListener('load', blackMethod)
document.addEventListener('DOMContentLoaded', () => {

  blackMethod()

  newObs.observe(document.body, {
    subtree: true,
    childList: true
  })

})
