export default {
  config(config) {
    if (config.mode !== "production") return config

    // CSS is injected by the manifest; this content script has no Shadow DOM to hydrate.
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.afterEnvironment.tap("NativeContentScript", () => {
          for (const rule of compiler.options.module.rules) {
            if (!Array.isArray(rule.use)) continue
            rule.use = rule.use.filter(entry =>
              !entry.loader?.endsWith("feature-scripts-content-script-wrapper.js"),
            )
          }
        })
      },
    })
    return config
  },
}
