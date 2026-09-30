// Paste into page.evaluate(). Then: window.__whyStart(); ...interact...; window.__whyStop()
;(() => {
  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__
  const PERFORMED_WORK = 1
  const nameOf = (type) =>
    type.displayName || type.name || type.render?.name || type.type?.name || '?'

  let counts = null

  function visit(fiber) {
    while (fiber) {
      const { type, alternate: prev } = fiber
      const isComponent =
        typeof type === 'function' || (type && typeof type === 'object')
      const rendered =
        isComponent &&
        (fiber.flags & PERFORMED_WORK) === PERFORMED_WORK &&
        (!prev ||
          prev.memoizedProps !== fiber.memoizedProps ||
          prev.memoizedState !== fiber.memoizedState)

      if (rendered) {
        const changedProps = prev
          ? Object.keys(fiber.memoizedProps || {}).filter(
              (key) => fiber.memoizedProps[key] !== prev.memoizedProps?.[key]
            )
          : ['mount']
        const key = `${nameOf(type)}${changedProps.length ? ` [${changedProps.join(',')}]` : ''}`
        counts[key] = (counts[key] || 0) + 1
      }

      const childrenReused = prev && prev.child === fiber.child
      if (fiber.child && !childrenReused) visit(fiber.child)
      fiber = fiber.sibling
    }
  }

  if (!hook.__whyDidRender) {
    const original = hook.onCommitFiberRoot
    hook.onCommitFiberRoot = function (id, root, ...rest) {
      if (counts) {
        visit(root.current.child)
        counts.__commits = (counts.__commits || 0) + 1
      }
      return original.call(this, id, root, ...rest)
    }
    hook.__whyDidRender = true
  }

  window.__whyStart = () => {
    counts = {}
  }
  window.__whyStop = () => {
    const result = Object.entries(counts || {}).sort((a, b) => b[1] - a[1])
    counts = null
    return result.map(([key, n]) => `${key}: ${n}`)
  }
})()
