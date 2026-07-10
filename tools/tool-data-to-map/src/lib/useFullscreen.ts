import { useCallback, useEffect, useState, type RefObject } from 'react'

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void
  mozRequestFullScreen?: () => void
  msRequestFullscreen?: () => void
}

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => void
  mozCancelFullScreen?: () => void
  msExitFullscreen?: () => void
  webkitFullscreenElement?: Element
  mozFullScreenElement?: Element
  msFullscreenElement?: Element
}

/** 跨浏览器全屏切换，返回 [是否全屏, 切换函数]。 */
export function useFullscreen(containerRef: RefObject<HTMLElement | null>): [boolean, () => void] {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggle = useCallback(() => {
    const el = containerRef.current as FullscreenElement | null
    if (!el) return

    if (!isFullscreen) {
      const request = el.requestFullscreen ?? el.webkitRequestFullscreen ?? el.mozRequestFullScreen ?? el.msRequestFullscreen
      request?.call(el)
    } else {
      const doc = document as FullscreenDocument
      const exit = document.exitFullscreen ?? doc.webkitExitFullscreen ?? doc.mozCancelFullScreen ?? doc.msExitFullscreen
      exit?.call(document)
    }
  }, [containerRef, isFullscreen])

  useEffect(() => {
    const handleChange = () => {
      const doc = document as FullscreenDocument
      setIsFullscreen(
        !!(document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)
      )
    }

    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange']
    events.forEach((event) => document.addEventListener(event, handleChange))
    return () => events.forEach((event) => document.removeEventListener(event, handleChange))
  }, [])

  return [isFullscreen, toggle]
}
