type LogoItem = { svg: string; alt: string }
type TrailItem = string | LogoItem

export {}

declare global {
  interface Window {
    __mouseTrailLogos?: LogoItem[]
  }
}

const EMOJIS: string[] = [
  // 程序员 / 开发者
  '💻', '👨‍💻', '🧑‍💻', '🚀', '⌨️',
  // 跑步
  '🏃', '👟',
  // 乒乓球
  '🏓',
  // 羽毛球
  '🏸',
  // Switch 游戏
  '🎮', '🕹️',
  // 公园 / 大自然
  '🌳', '🌸', '🌻', '🌼', '🍀',
  // 晴天 / 雨天
  '☀️', '🌧️', '🌈',
]

const logoItems: LogoItem[] = window.__mouseTrailLogos ?? []
const ITEMS: TrailItem[] = [...EMOJIS, ...logoItems]

let lastKey = ''
let lastTime = 0
let lastX = 0
let lastY = 0
const THROTTLE = 80
const MIN_DISTANCE = 30

function randomItem(): TrailItem {
  let item: TrailItem
  let key: string
  do {
    item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
    key = typeof item === 'string' ? item : item.svg
  } while (key === lastKey)
  lastKey = key
  return item
}

function spawnItem(x: number, y: number): void {
  const item = randomItem()
  const size = 16 + Math.random() * 14
  const driftX = (Math.random() - 0.5) * 60
  const duration = 800 + Math.random() * 400

  const baseStyle = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    user-select: none;
    z-index: 99999;
    transform: translate(-50%, -50%);
    animation: mouse-trail-float ${duration}ms ease-out forwards;
    --drift-x: ${driftX}px;
  `

  let el: HTMLElement
  if (typeof item === 'string') {
    el = document.createElement('span')
    el.textContent = item
    el.style.cssText = baseStyle + `font-size: ${size}px; line-height: 1;`
  } else {
    const wrapper = document.createElement('span')
    wrapper.innerHTML = item.svg
    wrapper.setAttribute('aria-label', item.alt)
    wrapper.style.cssText = baseStyle + `width: ${size}px; height: ${size}px; display: block;`
    el = wrapper
  }

  document.body.appendChild(el)
  setTimeout(() => el.remove(), duration)
}

function handleMouseMove(e: MouseEvent): void {
  const now = Date.now()
  if (now - lastTime < THROTTLE) return

  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < MIN_DISTANCE) return

  lastTime = now
  lastX = e.clientX
  lastY = e.clientY
  spawnItem(e.clientX, e.clientY)
}

document.addEventListener('mousemove', handleMouseMove)

// 页面切换时重新绑定（Astro View Transitions）
document.addEventListener('astro:page-load', () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.addEventListener('mousemove', handleMouseMove)
})
