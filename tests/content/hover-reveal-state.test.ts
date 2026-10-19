import { afterEach, describe, expect, it, vi } from "vitest"
import { HoverRevealState } from "../../src/content/hover-reveal-state"
import { defaultSettings } from "../../src/domain/settings"
import { createRuntimeState } from "../../src/domain/policy"

describe("HoverRevealState", () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("reveals watch recommendations after the delay and resets on pointer exit", () => {
    vi.useFakeTimers()
    vi.stubGlobal("window", globalThis)
    class TestElement {
      public attributes = new Map<string, string>()
      public closest(selector: string) {
        expect(selector).toContain("yt-lockup-view-model:not(ytd-rich-item-renderer *)")
        return this
      }
      public setAttribute(name: string, value: string) { this.attributes.set(name, value) }
      public removeAttribute(name: string) { this.attributes.delete(name) }
    }
    vi.stubGlobal("Element", TestElement)
    vi.stubGlobal("Node", TestElement)
    const listeners = new Map<string, (event: unknown) => void>()
    const root = {
      querySelectorAll: () => [],
      addEventListener: (name: string, handler: (event: unknown) => void) => listeners.set(name, handler),
      removeEventListener: (name: string) => listeners.delete(name),
    }
    const state = new HoverRevealState(root as unknown as Document)
    state.apply(createRuntimeState({ ...defaultSettings, mode: "hidden-except-hover", hoverDelay: "patient" }, "watch"))
    const target = new TestElement()
    listeners.get("pointerover")?.({ target, relatedTarget: null })
    expect(target.attributes.size).toBe(0)
    vi.advanceTimersByTime(699)
    expect(target.attributes.size).toBe(0)
    vi.advanceTimersByTime(1)
    expect(target.attributes.get("data-hyt-hover-revealed")).toBe("true")
    listeners.get("pointerout")?.({ target, relatedTarget: null })
    expect(target.attributes.size).toBe(0)
    listeners.get("pointerover")?.({ target, relatedTarget: null })
    state.clear()
    vi.advanceTimersByTime(700)
    expect(target.attributes.size).toBe(0)
    expect(listeners.size).toBe(0)
  })
})
