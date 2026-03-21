import { useMapStore } from '@/stores/mapStore'

export function LegendRenderer() {
  const legend = useMapStore((s) => s.legend)
  const routes = useMapStore((s) => s.routes)
  const cityCategories = useMapStore((s) => s.cityCategories)
  const cities = useMapStore((s) => s.cities)

  if (!legend.visible) return null

  const { position, width, style, title } = legend
  const padding = style.padding
  const lineHeight = style.fontSize * 1.6

  // Auto-generate items from visible routes and city categories
  const items: { type: 'line' | 'circle'; color: string; label: string; strokeWidth?: number; size?: number }[] = []

  // Routes
  routes.filter((r) => r.visible).forEach((route) => {
    items.push({
      type: 'line',
      color: route.style.stroke,
      strokeWidth: route.style.strokeWidth,
      label: route.name,
    })
  })

  // City categories (only those with visible cities)
  cityCategories.forEach((cat) => {
    const hasCities = cities.some((c) => c.categoryId === cat.id && c.visible)
    if (hasCities) {
      items.push({
        type: 'circle',
        color: cat.markerStyle.fill,
        size: cat.markerStyle.size,
        label: cat.name,
      })
    }
  })

  // Add custom items from legend config
  legend.items.forEach((item) => {
    items.push({
      type: item.type === 'route' ? 'line' : 'circle',
      color: item.customColor || '#333333',
      label: item.label,
    })
  })

  if (items.length === 0 && !title) return null

  const titleHeight = title ? style.titleFontSize * 1.4 + 8 : 0
  const contentHeight = titleHeight + items.length * lineHeight
  const totalHeight = contentHeight + padding * 2

  return (
    <g id="legende" transform={`translate(${position.x}, ${position.y})`}>
      {/* Background */}
      <rect
        width={width}
        height={totalHeight}
        rx={style.borderRadius}
        fill={style.backgroundColor}
        fillOpacity={style.backgroundOpacity}
        stroke={style.borderColor}
        strokeWidth={style.borderWidth}
      />

      {/* Title */}
      {title && (
        <text
          x={padding}
          y={padding + style.titleFontSize}
          fontFamily={style.fontFamily}
          fontSize={style.titleFontSize}
          fontWeight={style.titleFontWeight}
          fill={style.fontColor}
        >
          {title}
        </text>
      )}

      {/* Items */}
      {items.map((item, i) => {
        const y = padding + titleHeight + i * lineHeight + lineHeight / 2

        return (
          <g key={i}>
            {item.type === 'line' ? (
              <line
                x1={padding}
                y1={y}
                x2={padding + 20}
                y2={y}
                stroke={item.color}
                strokeWidth={item.strokeWidth || 2}
                strokeLinecap="round"
              />
            ) : (
              <circle
                cx={padding + 10}
                cy={y}
                r={item.size || 3}
                fill={item.color}
              />
            )}
            <text
              x={padding + 28}
              y={y + style.fontSize * 0.35}
              fontFamily={style.fontFamily}
              fontSize={style.fontSize}
              fill={style.fontColor}
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
