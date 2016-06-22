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

    const oldLink = links[i]

    // No parent: remove useless attributes, and hope nothing will alter the element.
    if (!oldLink.parentNode) {
      blackList.forEach(attr => oldLink.removeAttribute(attr))
      continue
    }

    // If we have however, recreate a new element and only keep needed things.
    const oldStyle = oldLink.getAttribute('style')
    const newLink = document.createElement('a')
    newLink.setAttribute('href', oldLink.href)
    if (oldLink.className) { newLink.setAttribute('class', oldLink.className) }
    if (oldStyle) { newLink.setAttribute('style', oldStyle) }
    whiteList.forEach(attr => oldLink[attr] && newLink.setAttribute(attr, oldLink[attr]))

    oldLink.childNodes.forEach(node => newLink.appendChild(node))
    oldLink.parentNode.replaceChild(newLink, oldLink)

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
