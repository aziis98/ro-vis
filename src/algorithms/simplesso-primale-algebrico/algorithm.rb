require "matrix"
require "json"
require "js"

Rational.class_eval do
  def to_s
    if self.denominator == 1
      self.numerator.to_s
    else
      "#{self.numerator}/#{self.denominator}"
    end
  end
end

Matrix.class_eval do
  def to_latex
    "\\begin{bmatrix}\n" + self.to_a.map { |r| r.join(" & ") }.join(" \\\\\n") + "\n\\end{bmatrix}"
  end

  def submatrix(rows, cols)
    if rows.is_a?(Range)
      rows = rows.to_a
    end
    if cols.is_a?(Range)
      cols = cols.to_a
    end

    Matrix.build(rows.size, cols.size) { |i, j| self[rows[i], cols[j]] }
  end
end

Vector.class_eval do
  def to_latex
    "\\begin{bmatrix}\n" + self.to_a.join(" \\\\\n") + "\n\\end{bmatrix}"
  end
end

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

def print_card(title, &block)
  card = CardDSL.new
  card.instance_eval(&block)

  JS.global[:rubyOutputs].push({
    title: title,
    blocks: card.blocks,
  })
end

def run(config)
  c = Vector[500r, 200r]
  mat = Matrix[[1r, 0r], [0r, 1r], [2r, 1r], [-1r, 0r], [0r, -1r]]
  b = Vector[4r, 7r, 9r, 0r, 0r]

  # set of initial indices
  basis = [1, 2] # [2, 3], ruby is 0-indexed

  print_card "Initial" do
    math <<-LATEX
      \\begin{aligned}
        c &= #{c.to_latex} \\\\
        A &= #{mat.to_latex} \\\\
        b &= #{b.to_latex} \\\\
        \\mathcal B &= \\{ #{basis.map { |i| i + 1 }.join(", ")} \\}
      \\end{aligned}
    LATEX
  end

  10.times do
    mat_basis = mat.submatrix(basis, (0...mat.column_count))
    mat_basis_inv = mat_basis.inv

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          \\mathcal B &= \\{ #{basis.map { |i| i + 1 }.join(", ")} \\} \\\\
          A_\\mathcal B &= #{mat_basis.to_latex} \\\\
          A_\\mathcal B^{-1} &= #{mat_basis_inv.to_latex}
        \\end{aligned}
      LATEX
    end

    b_basis = Vector.elements(basis.map { |i| b[i] })
    x_bar = mat_basis_inv * b_basis

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          b_\\mathcal B &= #{b_basis.to_latex} \\\\
          \\bar x &= #{mat_basis_inv.to_latex} #{b_basis.to_latex} = #{x_bar.to_latex}
        \\end{aligned}
      LATEX
    end

    y_bar_basis = mat_basis_inv * c

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          \\bar y_\\mathcal B &= #{mat_basis_inv.to_latex} #{c.to_latex} = #{y_bar_basis.to_latex}
        \\end{aligned}
      LATEX
    end

    if y_bar_basis.all? { |y| y >= 0 }
      print_card "Step" do
        text "Optimal solution found."
        math <<-LATEX
          \\begin{aligned}
            \\bar y_\\mathcal B = #{y_bar_basis.to_latex} \\geq 0
          \\end{aligned}
        LATEX
      end

      break
    end

    basis_inv = (0...mat.row_count).to_a.map { |i| basis.include?(i) ? basis.index(i) : nil }
    p basis_inv

    h = basis[(0...basis.size).to_a.find { |i| y_bar_basis[i] < 0 }]

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          \\mathcal B &= \\{ #{basis.map { |i| i + 1 }.join(", ")} \\} \\\\
          \\bar y_\\mathcal B &= #{y_bar_basis.to_latex} \\\\
          h &= \\min \\{ i \\in \\mathcal B : \\bar y_i < 0 \\} = #{h + 1}
        \\end{aligned}
      LATEX
    end

    u = Vector.basis(size: basis.size, index: h)

    xi = -mat_basis_inv * u

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          u_{\\mathcal B(h)} &= (e_h)_\\mathcal B = #{u.to_latex} \\\\
          \\xi &= A_\\mathcal B^{-1} u_{\\mathcal B(h)} = #{mat_basis_inv.to_latex} #{u.to_latex} = #{xi.to_latex}
        \\end{aligned}
      LATEX
    end

    basis_op = (0...mat.row_count).to_a - basis

    mat_basis_op = mat.submatrix(basis_op, (0...mat.column_count))

    d = mat_basis_op * xi

    print_card "Step" do
      math <<-LATEX
        \\begin{aligned}
          N &= \\{ #{basis.map { |i| i + 1 }.join(", ")} \\} \\setminus \\{ #{h + 1} \\} \\\\
          A_N &= #{mat_basis_op.to_latex} \\\\
          d &= A_N \\xi = #{mat_basis_op.to_latex} #{xi.to_latex} = #{d.to_latex}
        \\end{aligned}
      LATEX
    end

    if d.all? { |d| d <= 0 }
      break
    end
  end
end

run({ "n" => 10 })
