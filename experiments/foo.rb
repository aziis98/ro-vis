class CardDSL
  def initialize
    @blocks = []
  end

  def text(content)
    @blocks << { type: "text", content: content }
  end

  def code(content)
    @blocks << { type: "code", content: content }
  end

  def math(content)
    @blocks << { type: "math", content: content }
  end

  def blocks
    @blocks
  end
end

def print_card(&block)
  card = CardDSL.new
  card.instance_eval(&block)

  card.blocks.each { |block| p block }
  # JS.global[:rubyOutputs].push(card)
end

print_card do
  text "Hello, world!"
  code "puts 'Hello, world!'"
  math "\\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\end{bmatrix}"
end
