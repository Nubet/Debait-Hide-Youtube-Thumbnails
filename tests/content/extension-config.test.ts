import { describe, expect, it, vi } from "vitest"
import extensionConfig from "../../extension.config.js"

describe("production content script", () => {
  it("keeps native compilation but removes the Shadow DOM hydration wrapper", () => {
    const wrapper = { loader: "/extension/feature-scripts-content-script-wrapper.js" }
    const transpiler = { loader: "builtin:swc-loader" }
    const rules = [{ use: [wrapper, transpiler] }, { type: "css" }]
    const tap = vi.fn((_name, callback) => callback())
    const compiler = {
      hooks: { afterEnvironment: { tap } },
      options: { module: { rules } },
    }
    const config = extensionConfig.config({ mode: "production", plugins: [] })
    for (const plugin of config.plugins) plugin.apply(compiler)
    expect(rules).toEqual([{ use: [transpiler] }, { type: "css" }])
  })

  it("preserves development mounting and cleanup", () => {
    const config = { mode: "development", plugins: [] }
    expect(extensionConfig.config(config)).toBe(config)
    expect(config.plugins).toEqual([])
  })
})
