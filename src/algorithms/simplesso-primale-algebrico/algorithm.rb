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

def print_step(label, state)
  puts "Ruby: #{label} #{state}"
  JS.global[:rubyOutputs].push({
    label: label,
    state: state,
  })
end

def run(config)
  c = Vector[500r, 200r]
  mat = Matrix[[1r, 0r], [0r, 1r], [2r, 1r], [-1r, 0r], [0r, -1r]]
  b = Vector[4r, 7r, 9r, 0r, 0r]

  # set of initial indices
  basis = [1, 2] # [2, 3], ruby is 0-indexed

  print_step "Initial", {
               "c": c.to_latex,
               "A": mat.to_latex,
               "b": b.to_latex,
               "\\mathcal B": "\\{ #{basis.map { |i| i + 1 }.join(", ")} \\}",
             }

  10.times do
    mat_basis = mat.submatrix(basis, (0...mat.column_count))
    mat_basis_inv = mat_basis.inv

    print_step "Step", {
                 "\\mathcal B": "\\{ #{basis.map { |i| i + 1 }.join(", ")} \\}",
                 "A_\\mathcal B": mat_basis.to_latex,
                 "A_\\mathcal B^{-1}": mat_basis_inv.to_latex,
               }

    b_basis = Vector.elements(basis.map { |i| b[i] })
    x_bar = mat_basis_inv * b_basis

    print_step "Step", {
                 "b_\\mathcal B": b_basis.to_latex,
                 "\\bar x": "#{mat_basis_inv.to_latex} #{b_basis.to_latex} = #{x_bar.to_latex}",
               }

    y_bar_basis = mat_basis_inv * c

    print_step "Step", {
                 "\\bar y_\\mathcal B": "#{mat_basis_inv.to_latex} #{c.to_latex} = #{y_bar_basis.to_latex}",
               }

    if y_bar_basis.all? { |y| y >= 0 }
      print_step "Step", {
                   "\\bar y_\\mathcal B": "#{y_bar_basis.to_latex} \\geq 0",
                 }
      break
    end

    basis_inv = (0...mat.row_count).to_a.map { |i| basis.include?(i) ? basis.index(i) : nil }
    p basis_inv

    h = basis[(0...basis.size).to_a.find { |i| y_bar_basis[i] < 0 }]

    # print_step "Step", {
    #              "\\mathcal B": "\\{ #{basis.map { |i| i + 1 }.join(", ")} \\}",
    #              "\\bar y_\\mathcal B": y_bar_basis.to_latex,
    #              "h": "\\min \\{ i \\in \\mathcal B : \\bar y_i < 0 \\} = #{h + 1}",
    #            }

    print_step "Step", [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      %Q(
        $$
        \\begin{align*}
          \\mathcal B &= \\{ #{basis.map { |i| i + 1 }.join(", ")} \\} \\\\
          \\bar y_\\mathcal B &= #{y_bar_basis.to_latex} \\\\
          h &= \\min \\{ i \\in \\mathcal B : \\bar y_i < 0 \\} = #{h + 1}
        \\end{align*}
        $$
      ),
    ]

    u = Vector.basis(size: basis.size, index: h)

    xi = -mat_basis_inv * u

    print_step "Step", {
                 "u_{\\mathcal B(h)}": "(e_h)_\\mathcal B = #{u.to_latex}",
                 "\\xi": "#{mat_basis_inv.to_latex} #{u.to_latex} = #{xi.to_latex}",
               }

    basis_op = (0...mat.row_count).to_a - basis

    mat_basis_op = mat.submatrix(basis_op, (0...mat.column_count))

    d = mat_basis_op * xi

    print_step "Step", {
                 "d": "#{mat_basis_op.to_latex} #{xi.to_latex} = #{d.to_latex} \\leq 0",
               }

    if d.all? { |d| d <= 0 }
      break
    end
  end
end

run({ "n" => 10 })
