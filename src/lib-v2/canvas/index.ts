const MAX_LINE_SIZE = 50

/**
 * Draw a semi-plane delimited by the equation `a1 x + a2 y <= b`
 */
export function drawSemiplane(
    g: CanvasRenderingContext2D,
    a1: number,
    a2: number,
    b: number,
    {
        gradientAccent,
        gradientTransparent,
        lineColor,
        lineWidth,
    }: { gradientAccent?: string; gradientTransparent?: string; lineColor?: string; lineWidth?: number } = {}
) {
    gradientAccent ??= '#ffa90066'
    gradientTransparent ??= '#ffa90000'
    lineColor ??= '#9c6700'
    lineWidth ??= 2

    // The gradient is perpendicular to the line, first generate a point on the line
    let [p1, p2] = [0, 0]
    if (a2 === 0) {
        p1 = b / a1
        p2 = 0
    } else {
        p1 = 0
        p2 = b / a2
    }

    const normalize = Math.sqrt(a1 ** 2 + a2 ** 2) * 1.5

    const gradient = g.createLinearGradient(p1, p2, p1 - a1 / normalize, p2 - a2 / normalize)
    gradient.addColorStop(0, gradientAccent)
    gradient.addColorStop(1, gradientTransparent)
    g.fillStyle = gradient

    // g.fillStyle = 'rgba(0, 0, 0, 0.1)'

    g.beginPath()
    if (a2 === 0) {
        if (a1 > 0) {
            g.moveTo(b / a1, -MAX_LINE_SIZE)
            g.lineTo(-MAX_LINE_SIZE, -MAX_LINE_SIZE)
            g.lineTo(-MAX_LINE_SIZE, MAX_LINE_SIZE)
            g.lineTo(b / a1, MAX_LINE_SIZE)
        } else {
            g.moveTo(b / a1, -MAX_LINE_SIZE)
            g.lineTo(MAX_LINE_SIZE, -MAX_LINE_SIZE)
            g.lineTo(MAX_LINE_SIZE, MAX_LINE_SIZE)
            g.lineTo(b / a1, MAX_LINE_SIZE)
        }
    } else {
        if (a2 > 0) {
            g.moveTo(-MAX_LINE_SIZE, (b - a1 * -MAX_LINE_SIZE) / a2)
            g.lineTo(-MAX_LINE_SIZE, MAX_LINE_SIZE)
            g.lineTo(-MAX_LINE_SIZE, -MAX_LINE_SIZE)
            g.lineTo(MAX_LINE_SIZE, (b - a1 * MAX_LINE_SIZE) / a2)
        } else {
            g.moveTo(MAX_LINE_SIZE, (b - a1 * MAX_LINE_SIZE) / a2)
            g.lineTo(MAX_LINE_SIZE, -MAX_LINE_SIZE)
            g.lineTo(MAX_LINE_SIZE, MAX_LINE_SIZE)
            g.lineTo(-MAX_LINE_SIZE, (b - a1 * -MAX_LINE_SIZE) / a2)
        }
    }
    g.fill()

    // Draw the line
    g.strokeStyle = lineColor
    g.lineWidth = (lineWidth * 10) / g.canvas.width

    g.beginPath()
    if (a2 === 0) {
        g.moveTo(b / a1, -MAX_LINE_SIZE)
        g.lineTo(b / a1, MAX_LINE_SIZE)
    } else {
        g.moveTo(-MAX_LINE_SIZE, (b - a1 * -MAX_LINE_SIZE) / a2)
        g.lineTo(MAX_LINE_SIZE, (b - a1 * MAX_LINE_SIZE) / a2)
    }
    g.stroke()
}
