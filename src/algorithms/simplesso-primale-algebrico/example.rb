require "json"
require "js"

def print_step(label, state)
    puts "Ruby: #{label} #{state}"
    JS.global[:rubyOutputs].push({
        label: label,
        state: state
    })
end

def run(config)
    i = config["i"] || 1
    j = config["j"] || 1
    n = config["n"] || 10

    print_step "Initial", { i: i, j: j, n: n }

    n.times do
        m = i + j
        i = j
        j = m

        print_step "Step", { i: i, j: j }
    end

    return i
end

run({ "n" => 10 })
