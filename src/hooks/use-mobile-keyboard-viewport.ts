import * as React from "react"

const KEYBOARD_OPEN_THRESHOLD = 80
const VIEWPORT_SETTLE_DELAY_MS = 160
const VIEWPORT_HEIGHT_CHANGE_THRESHOLD = 80
const VIEWPORT_WIDTH_CHANGE_THRESHOLD = 24

type ViewportState = {
  viewportHeight: number
  viewportOffsetTop: number
  keyboardOffset: number
}

type ViewportRuntimeState = {
  keyboardOpen: boolean
  viewportHeight: number
  viewportOffsetTop: number
  innerWidth: number
  innerHeight: number
}

function isEditableElement(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  )
}

function readViewportState(): ViewportState {
  const visualViewport = window.visualViewport
  const viewportHeight = Math.round(
    Math.max(0, visualViewport?.height ?? window.innerHeight)
  )
  const viewportOffsetTop = Math.round(
    Math.max(0, visualViewport?.offsetTop ?? 0)
  )

  return {
    viewportHeight,
    viewportOffsetTop,
    keyboardOffset: 0,
  }
}

function findScrollableContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement

  while (parent && parent !== document.body) {
    if (parent.hasAttribute("data-mobile-keyboard-scroll-root")) {
      return parent
    }

    const styles = window.getComputedStyle(parent)
    const canScrollY = /(auto|scroll|overlay)/.test(styles.overflowY)
    if (canScrollY && parent.scrollHeight > parent.clientHeight + 1) {
      return parent
    }

    parent = parent.parentElement
  }

  return null
}

function alignElementToCenterInWindow(
  element: HTMLElement,
  viewportHeight: number,
  viewportOffsetTop: number
) {
  const scrollRoot = document.scrollingElement
  if (!scrollRoot) {
    return
  }

  const elementRect = element.getBoundingClientRect()
  const targetScrollTop = Math.max(
    0,
    scrollRoot.scrollTop +
      elementRect.top +
      elementRect.height / 2 -
      (viewportOffsetTop + viewportHeight / 2)
  )
  if (Math.abs(scrollRoot.scrollTop - targetScrollTop) < 2) {
    return
  }

  window.scrollTo({ top: targetScrollTop, behavior: "auto" })
}

function alignElementToCenterInContainer(
  element: HTMLElement,
  container: HTMLElement
) {
  const elementRect = element.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  const targetScrollTop =
    container.scrollTop +
    (elementRect.top - containerRect.top) +
    elementRect.height / 2 -
    container.clientHeight / 2
  if (Math.abs(container.scrollTop - targetScrollTop) < 2) {
    return
  }

  container.scrollTo({
    top: Math.max(0, targetScrollTop),
    behavior: "auto",
  })
}

export function useMobileKeyboardViewport() {
  const viewportStateRef = React.useRef<ViewportState>({
    viewportHeight: 0,
    viewportOffsetTop: 0,
    keyboardOffset: 0,
  })
  const runtimeStateRef = React.useRef<ViewportRuntimeState>({
    keyboardOpen: false,
    viewportHeight: 0,
    viewportOffsetTop: 0,
    innerWidth: 0,
    innerHeight: 0,
  })
  const baseInnerHeightRef = React.useRef(0)
  const animationFrameRef = React.useRef<number | null>(null)
  const settleTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const isTouchDevice =
      window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window

    if (!isTouchDevice) {
      return
    }
    baseInnerHeightRef.current = window.innerHeight

    const alignFocusedElementToCenter = () => {
      const activeElement = document.activeElement
      if (!isEditableElement(activeElement) || !activeElement.isConnected) {
        return
      }

      const { keyboardOffset, viewportHeight, viewportOffsetTop } =
        viewportStateRef.current
      if (keyboardOffset < KEYBOARD_OPEN_THRESHOLD) {
        return
      }

      const scrollContainer = findScrollableContainer(activeElement)
      if (scrollContainer) {
        alignElementToCenterInContainer(activeElement, scrollContainer)
        return
      }

      alignElementToCenterInWindow(
        activeElement,
        viewportHeight,
        viewportOffsetTop
      )
    }

    const scheduleAlignmentAfterSettle = () => {
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current)
      }

      settleTimeoutRef.current = window.setTimeout(() => {
        alignFocusedElementToCenter()
      }, VIEWPORT_SETTLE_DELAY_MS)
    }

    const syncViewportState = () => {
      const nextStateDraft = readViewportState()
      const previousRuntimeState = runtimeStateRef.current
      const currentInnerHeight = window.innerHeight
      const orientationChanged =
        Math.abs(window.innerWidth - previousRuntimeState.innerWidth) >=
          VIEWPORT_HEIGHT_CHANGE_THRESHOLD &&
        Math.abs(currentInnerHeight - previousRuntimeState.innerHeight) >=
          VIEWPORT_HEIGHT_CHANGE_THRESHOLD

      if (orientationChanged) {
        baseInnerHeightRef.current = currentInnerHeight
      }

      const visualViewportBottom =
        nextStateDraft.viewportHeight + nextStateDraft.viewportOffsetTop
      const keyboardOffset = Math.round(
        Math.max(
          0,
          currentInnerHeight - visualViewportBottom,
          baseInnerHeightRef.current - visualViewportBottom
        )
      )
      const nextState = {
        ...nextStateDraft,
        keyboardOffset,
      }
      const keyboardOpen = keyboardOffset >= KEYBOARD_OPEN_THRESHOLD
      const keyboardJustOpened =
        !previousRuntimeState.keyboardOpen && keyboardOpen
      const viewportChanged =
        Math.abs(nextState.viewportHeight - previousRuntimeState.viewportHeight) >=
          VIEWPORT_HEIGHT_CHANGE_THRESHOLD ||
        Math.abs(
          nextState.viewportOffsetTop - previousRuntimeState.viewportOffsetTop
        ) >= VIEWPORT_HEIGHT_CHANGE_THRESHOLD ||
        Math.abs(window.innerWidth - previousRuntimeState.innerWidth) >=
          VIEWPORT_WIDTH_CHANGE_THRESHOLD ||
        Math.abs(currentInnerHeight - previousRuntimeState.innerHeight) >=
          VIEWPORT_HEIGHT_CHANGE_THRESHOLD

      viewportStateRef.current = nextState
      runtimeStateRef.current = {
        keyboardOpen,
        viewportHeight: nextState.viewportHeight,
        viewportOffsetTop: nextState.viewportOffsetTop,
        innerWidth: window.innerWidth,
        innerHeight: currentInnerHeight,
      }
      if (!keyboardOpen) {
        baseInnerHeightRef.current = currentInnerHeight
      }

      const appViewportHeight = Math.round(
        Math.max(
          0,
          nextState.viewportHeight + nextState.viewportOffsetTop
        )
      )
      const rootStyle = document.documentElement.style
      rootStyle.setProperty("--app-viewport-height", `${appViewportHeight}px`)
      rootStyle.setProperty("--virtual-keyboard-offset", `${nextState.keyboardOffset}px`)

      if (keyboardOpen && (keyboardJustOpened || viewportChanged)) {
        scheduleAlignmentAfterSettle()
      }
    }

    const queueViewportSync = () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        syncViewportState()
      })
    }

    runtimeStateRef.current = {
      keyboardOpen: false,
      viewportHeight: 0,
      viewportOffsetTop: 0,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    }
    syncViewportState()

    const visualViewport = window.visualViewport
    visualViewport?.addEventListener("resize", queueViewportSync)
    window.addEventListener("resize", queueViewportSync)
    window.addEventListener("orientationchange", queueViewportSync)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      if (settleTimeoutRef.current) {
        window.clearTimeout(settleTimeoutRef.current)
      }

      visualViewport?.removeEventListener("resize", queueViewportSync)
      window.removeEventListener("resize", queueViewportSync)
      window.removeEventListener("orientationchange", queueViewportSync)
    }
  }, [])
}
