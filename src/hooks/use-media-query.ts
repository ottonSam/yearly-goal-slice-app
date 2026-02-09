import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === "undefined") {
      return false
    }
    return window.matchMedia(query).matches
  })

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(query)

    const onChange = () => {
      setMatches(mediaQueryList.matches)
    }

    onChange()

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", onChange)
      return () => mediaQueryList.removeEventListener("change", onChange)
    }

    mediaQueryList.addListener(onChange)
    return () => mediaQueryList.removeListener(onChange)
  }, [query])

  return matches
}
