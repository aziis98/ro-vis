import rubyWasmModuleUrl from '@ruby/3.3-wasm-wasi/dist/ruby+stdlib.wasm?url'
import { DefaultRubyVM } from '@ruby/wasm-wasi/dist/browser'

window.rubyOutputs = []
let vmInstance = null

async function preloadRuby() {
    if (vmInstance) return

    const response = await fetch(rubyWasmModuleUrl)
    const module = await WebAssembly.compileStreaming(response)
    const { vm } = await DefaultRubyVM(module)
    vmInstance = vm
}

export async function evalRuby(code) {
    await preloadRuby()

    window.rubyOutputs = []
    const result = vmInstance.eval(code)

    return {
        result,
        outputs: window.rubyOutputs,
    }
}
