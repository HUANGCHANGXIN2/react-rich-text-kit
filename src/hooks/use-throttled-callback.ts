import { useEffect, useMemo } from "react"

interface ThrottleSettings {
  leading?: boolean | undefined
  trailing?: boolean | undefined
}

const defaultOptions: ThrottleSettings = {
  leading: false,
  trailing: true,
}

type ThrottledFunction<T extends (...args: never[]) => unknown> = {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
  flush: () => ReturnType<T> | undefined
}

function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  wait: number,
  options: ThrottleSettings
): ThrottledFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: Parameters<T> | undefined
  let lastThis: ThisParameterType<T> | undefined
  let lastResult: ReturnType<T> | undefined
  let lastCallTime = 0

  const invoke = (time: number) => {
    lastCallTime = time
    const args = lastArgs
    const thisArg = lastThis
    lastArgs = undefined
    lastThis = undefined

    if (!args) return lastResult
    lastResult = fn.apply(thisArg, args) as ReturnType<T>
    return lastResult
  }

  const startTimer = (delay: number) => {
    timeoutId = setTimeout(() => {
      timeoutId = undefined
      if (options.trailing !== false && lastArgs) {
        invoke(Date.now())
      }
    }, delay)
  }

  const throttled = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    const now = Date.now()
    const isFirstCall = lastCallTime === 0

    lastArgs = args
    lastThis = this

    if (isFirstCall && options.leading === false) {
      lastCallTime = now
    }

    const remaining = wait - (now - lastCallTime)

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = undefined
      }
      return invoke(now)
    }

    if (!timeoutId && options.trailing !== false) {
      startTimer(remaining)
    }

    return lastResult
  } as ThrottledFunction<T>

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = undefined
    lastArgs = undefined
    lastThis = undefined
    lastCallTime = 0
  }

  throttled.flush = () => {
    if (!timeoutId) return lastResult

    clearTimeout(timeoutId)
    timeoutId = undefined
    if (lastArgs) {
      return invoke(Date.now())
    }

    return lastResult
  }

  return throttled
}

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes
 * @param options The throttle options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 250,
  dependencies: React.DependencyList = [],
  options: ThrottleSettings = defaultOptions
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> | undefined
  cancel: () => void
  flush: () => ReturnType<T> | undefined
} {
  const handler = useMemo(
    () => throttle<T>(fn, wait, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  )

  useEffect(() => () => handler.cancel(), [handler])

  return handler
}

export default useThrottledCallback
