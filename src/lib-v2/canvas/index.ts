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
        gradientSize,
        lineColor,
        lineWidth,
    }: {
        gradientAccent?: string
        gradientTransparent?: string
        gradientSize?: number
        lineColor?: string
        lineWidth?: number
    } = {}
) {
    gradientAccent ??= '#ffa90066'
    gradientTransparent ??= '#ffa90000'
    lineColor ??= '#9c6700'
    lineWidth ??= 2
    gradientSize ??= 1 / 1.25

    // The gradient is perpendicular to the line, first generate a point on the line
    let [p1, p2] = [0, 0]
    if (a2 === 0) {
        p1 = b / a1
        p2 = 0
    } else {
        p1 = 0
        p2 = b / a2
    }

    const normalize = Math.sqrt(a1 ** 2 + a2 ** 2) / gradientSize

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
    g.lineWidth = (lineWidth * 10) / (g.canvas.width / window.devicePixelRatio)

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

export function drawSimpleArrow(
    g: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    size: number,
    color: string = '#333',
    lineDash: number[] = []
) {
    const arrowLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const actualSize = (500 * size) / g.canvas.offsetWidth

    g.save()
    g.strokeStyle = color
    g.fillStyle = color
    g.setLineDash(lineDash)

    g.beginPath()
    g.translate(x1, y1)
    g.rotate(Math.atan2(y2 - y1, x2 - x1))
    g.moveTo(0, 0)
    g.lineTo(arrowLength - actualSize / 2, 0)
    g.stroke()

    g.beginPath()
    g.moveTo(arrowLength, 0)
    g.lineTo(arrowLength - actualSize, -actualSize * 0.75)
    g.lineTo(arrowLength - actualSize, +actualSize * 0.75)
    g.lineTo(arrowLength, 0)
    g.fill()
    g.restore()
}

export function fillDot(g: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    g.beginPath()
    g.arc(x, y, radius, 0, 2 * Math.PI)
    g.fill()
}

export function strokeDot(g: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    g.beginPath()
    g.arc(x, y, radius, 0, 2 * Math.PI)
    g.stroke()
}

export function strokeInfiniteLine(g: CanvasRenderingContext2D, x1: number, y1: number, angle: number) {
    g.beginPath()
    g.moveTo(x1 - Math.cos(angle) * MAX_LINE_SIZE, y1 - Math.sin(angle) * MAX_LINE_SIZE)
    g.lineTo(x1 + Math.cos(angle) * MAX_LINE_SIZE, y1 + Math.sin(angle) * MAX_LINE_SIZE)
    g.stroke()
}
