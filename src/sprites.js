// Generate character sprite textures from canvas drawing

function olCircle(ctx, x, y, r, fill, ol) {
  ctx.fillStyle = '#1a1008'
  ctx.beginPath(); ctx.arc(x, y, r + ol * 0.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = fill
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
}

function olLine(ctx, x1, y1, x2, y2, w, color, ol) {
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#1a1008'; ctx.lineWidth = w + ol * 2
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  ctx.strokeStyle = color; ctx.lineWidth = w
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}

function olShape(ctx, fn, fill, ol) {
  ctx.strokeStyle = '#1a1008'; ctx.lineWidth = ol * 2; fn(); ctx.stroke()
  ctx.fillStyle = fill; fn(); ctx.fill()
}

export function createSoldierCanvas(size = 256) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const s = size / 200
  const OL = 2.5 * s
  const cx = size / 2, cy = size * 0.55

  // Legs
  olLine(ctx, cx - 14*s, cy + 10*s, cx - 14*s, cy + 38*s, 6*s, '#d4a060', OL)
  olCircle(ctx, cx - 14*s, cy + 40*s, 5*s, '#8B5520', OL)
  ctx.strokeStyle = '#a09070'; ctx.lineWidth = 3*s
  ctx.beginPath(); ctx.moveTo(cx - 14*s, cy + 20*s); ctx.lineTo(cx - 14*s, cy + 32*s); ctx.stroke()
  olLine(ctx, cx + 14*s, cy + 10*s, cx + 14*s, cy + 38*s, 6*s, '#d4a060', OL)
  olCircle(ctx, cx + 14*s, cy + 40*s, 5*s, '#8B5520', OL)
  ctx.strokeStyle = '#a09070'; ctx.lineWidth = 3*s
  ctx.beginPath(); ctx.moveTo(cx + 14*s, cy + 20*s); ctx.lineTo(cx + 14*s, cy + 32*s); ctx.stroke()

  // Cape
  ctx.fillStyle = '#1a0808'
  ctx.beginPath(); ctx.moveTo(cx - 18*s, cy - 5*s); ctx.quadraticCurveTo(cx, cy + 28*s, cx + 18*s, cy - 5*s); ctx.fill()
  ctx.fillStyle = '#881818'
  ctx.beginPath(); ctx.moveTo(cx - 15*s, cy - 3*s); ctx.quadraticCurveTo(cx, cy + 24*s, cx + 15*s, cy - 3*s); ctx.fill()

  // Tunic
  olShape(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - 16*s, cy); ctx.lineTo(cx - 20*s, cy + 16*s); ctx.lineTo(cx + 20*s, cy + 16*s); ctx.lineTo(cx + 16*s, cy); ctx.closePath() }, '#cc3333', OL)
  ctx.fillStyle = '#aa7744'
  for (let i = -2; i <= 2; i++) { ctx.fillRect(cx + i*7*s - 2.5*s, cy + 11*s, 5*s, 8*s); ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 1*s; ctx.strokeRect(cx + i*7*s - 2.5*s, cy + 11*s, 5*s, 8*s) }

  // Chest armor
  olShape(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - 18*s, cy - 10*s); ctx.quadraticCurveTo(cx - 20*s, cy + 5*s, cx - 15*s, cy + 10*s); ctx.lineTo(cx + 15*s, cy + 10*s); ctx.quadraticCurveTo(cx + 20*s, cy + 5*s, cx + 18*s, cy - 10*s); ctx.closePath() }, '#b0a088', OL)
  ctx.fillStyle = '#ccc0a8'; ctx.beginPath(); ctx.ellipse(cx, cy - 2*s, 10*s, 8*s, 0, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#8a7a60'; ctx.lineWidth = 1.5*s
  for (let ab = -1; ab <= 1; ab++) { ctx.beginPath(); ctx.moveTo(cx - 14*s, cy + ab*5*s); ctx.lineTo(cx + 14*s, cy + ab*5*s); ctx.stroke() }
  // Belt
  olLine(ctx, cx - 17*s, cy + 8*s, cx + 17*s, cy + 8*s, 3*s, '#8B5520', OL)
  olCircle(ctx, cx, cy + 8*s, 3*s, '#e8c840', 1.5*s)

  // Shoulders
  olCircle(ctx, cx - 20*s, cy - 8*s, 8*s, '#a09078', OL)
  olCircle(ctx, cx + 20*s, cy - 8*s, 8*s, '#a09078', OL)
  ctx.fillStyle = '#e8c840'; ctx.beginPath(); ctx.arc(cx - 20*s, cy - 8*s, 2.5*s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 20*s, cy - 8*s, 2.5*s, 0, Math.PI * 2); ctx.fill()

  // Arms
  olLine(ctx, cx - 20*s, cy - 5*s, cx - 30*s, cy + 8*s, 5*s, '#d4a060', OL)
  olCircle(ctx, cx - 30*s, cy + 10*s, 5*s, '#d4a060', OL)
  olLine(ctx, cx + 20*s, cy - 5*s, cx + 28*s, cy + 10*s, 5*s, '#d4a060', OL)
  olCircle(ctx, cx + 28*s, cy + 12*s, 5*s, '#d4a060', OL)

  // Sword in left hand
  ctx.save(); ctx.translate(cx - 30*s, cy + 8*s); ctx.rotate(-0.6)
  olLine(ctx, 0, 2*s, 0, -38*s, 5*s, '#e8e8f0', OL)
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(-2.5*s, -35*s); ctx.lineTo(0, -42*s); ctx.lineTo(2.5*s, -35*s); ctx.closePath(); ctx.fill()
  olLine(ctx, -8*s, 2*s, 8*s, 2*s, 4*s, '#d4a030', OL)
  olLine(ctx, 0, 2*s, 0, 12*s, 4*s, '#6B3513', OL)
  olCircle(ctx, 0, 13*s, 3.5*s, '#d4a030', OL)
  ctx.restore()

  // Shield in right hand
  olShape(ctx, () => { ctx.beginPath(); ctx.moveTo(cx + 30*s, cy - 8*s); ctx.quadraticCurveTo(cx + 44*s, cy - 5*s, cx + 44*s, cy + 10*s); ctx.quadraticCurveTo(cx + 44*s, cy + 25*s, cx + 30*s, cy + 28*s); ctx.quadraticCurveTo(cx + 28*s, cy + 10*s, cx + 30*s, cy - 8*s); ctx.closePath() }, '#cc9922', OL)
  ctx.fillStyle = '#aa2222'; ctx.beginPath(); ctx.arc(cx + 36*s, cy + 10*s, 6*s, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#e8c840'; ctx.lineWidth = 1.5*s; ctx.stroke()

  // Neck
  olLine(ctx, cx, cy - 10*s, cx, cy - 18*s, 8*s, '#dbb880', OL)

  // Head
  const headS = 30 * s, headY = cy - 38*s
  olCircle(ctx, cx, headY, headS, '#f0c888', OL)
  ctx.fillStyle = 'rgba(180,120,60,0.12)'; ctx.beginPath(); ctx.ellipse(cx, headY + headS*0.2, headS*0.6, headS*0.4, 0, 0, Math.PI * 2); ctx.fill()

  // Face
  ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 3.5*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - 12*s, headY - 8*s); ctx.lineTo(cx - 5*s, headY - 4*s); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + 12*s, headY - 8*s); ctx.lineTo(cx + 5*s, headY - 4*s); ctx.stroke()
  // Eyes
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 1.5*s
  ctx.beginPath(); ctx.ellipse(cx - 8*s, headY - 2*s, 5*s, 4*s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#2a1808'; ctx.beginPath(); ctx.arc(cx - 7*s, headY - 2*s, 2.5*s, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 9*s, headY - 4*s, 1*s, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 1.5*s
  ctx.beginPath(); ctx.ellipse(cx + 8*s, headY - 2*s, 5*s, 4*s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#2a1808'; ctx.beginPath(); ctx.arc(cx + 9*s, headY - 2*s, 2.5*s, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx + 7*s, headY - 4*s, 1*s, 0, Math.PI * 2); ctx.fill()
  // Nose
  ctx.fillStyle = '#d4a870'; ctx.beginPath(); ctx.ellipse(cx, headY + 4*s, 3*s, 2*s, 0, 0, Math.PI * 2); ctx.fill()
  // Mouth
  ctx.strokeStyle = '#5a3020'; ctx.lineWidth = 2*s; ctx.beginPath(); ctx.arc(cx, headY + 12*s, 6*s, Math.PI + 0.5, -0.5); ctx.stroke()
  // Beard
  olShape(ctx, () => { ctx.beginPath(); ctx.ellipse(cx, headY + 16*s, 10*s, 6*s, 0, 0, Math.PI) }, '#8a6a40', OL)

  // Helmet
  ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.arc(cx, headY, headS + OL, Math.PI, 0); ctx.fill()
  ctx.fillStyle = '#a09888'; ctx.beginPath(); ctx.arc(cx, headY, headS - 1*s, Math.PI + 0.1, -0.1); ctx.fill()
  ctx.fillStyle = '#c8c0b0'; ctx.beginPath(); ctx.arc(cx - 5*s, headY - 8*s, headS*0.4, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = '#706050'; ctx.lineWidth = 3*s; ctx.beginPath(); ctx.arc(cx, headY, headS + 1*s, Math.PI - 0.1, 0.1); ctx.stroke()
  ctx.fillStyle = '#1a1008'; ctx.fillRect(cx - headS - 2*s, headY - 2*s, 8*s, 16*s); ctx.fillRect(cx + headS - 6*s, headY - 2*s, 8*s, 16*s)
  ctx.fillStyle = '#908878'; ctx.fillRect(cx - headS, headY, 5*s, 12*s); ctx.fillRect(cx + headS - 5*s, headY, 5*s, 12*s)

  // Plume
  const pH = 22*s, pW = 8*s
  ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.ellipse(cx, headY - headS - pH*0.3, pW + OL, pH*0.6, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#cc2222'; ctx.beginPath(); ctx.ellipse(cx, headY - headS - pH*0.3, pW, pH*0.55, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ee5544'; ctx.beginPath(); ctx.ellipse(cx - 2*s, headY - headS - pH*0.4, pW*0.5, pH*0.3, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#d4a030'; ctx.fillRect(cx - 3*s, headY - headS, 6*s, 4*s)

  return c
}

export function createBeastCanvas(size = 256) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const s = size / 200
  const OL = 2.5 * s
  const cx = size / 2, cy = size * 0.55
  const color = '#5a4a3a'

  function lighten(hex, amt) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})` }
  function darken(hex, amt) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return `rgb(${Math.max(0, r - amt)},${Math.max(0, g - amt)},${Math.max(0, b - amt)})` }

  // Tail
  ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 7*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx, cy + 20*s); ctx.quadraticCurveTo(cx - 10*s, cy + 35*s, cx - 5*s, cy + 48*s); ctx.stroke()
  ctx.strokeStyle = color; ctx.lineWidth = 4.5*s
  ctx.beginPath(); ctx.moveTo(cx, cy + 20*s); ctx.quadraticCurveTo(cx - 10*s, cy + 35*s, cx - 5*s, cy + 48*s); ctx.stroke()

  // Hind legs
  olLine(ctx, cx - 15*s, cy + 18*s, cx - 20*s, cy + 42*s, 8*s, '#6a5545', OL)
  olCircle(ctx, cx - 20*s, cy + 44*s, 5*s, darken(color, 15), OL)
  olLine(ctx, cx + 15*s, cy + 18*s, cx + 20*s, cy + 42*s, 8*s, '#6a5545', OL)
  olCircle(ctx, cx + 20*s, cy + 44*s, 5*s, darken(color, 15), OL)
  // Front legs
  olLine(ctx, cx - 22*s, cy + 5*s, cx - 28*s, cy + 32*s, 7*s, '#7a6a55', OL)
  olCircle(ctx, cx - 28*s, cy + 34*s, 5*s, darken(color, 15), OL)
  olLine(ctx, cx + 22*s, cy + 5*s, cx + 28*s, cy + 32*s, 7*s, '#7a6a55', OL)
  olCircle(ctx, cx + 28*s, cy + 34*s, 5*s, darken(color, 15), OL)
  // Claws
  ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1.5*s
  for (let ci = -1; ci <= 1; ci++) {
    ctx.beginPath(); ctx.moveTo(cx - 28*s + ci*2.5*s, cy + 36*s); ctx.lineTo(cx - 28*s + ci*3.5*s, cy + 40*s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 28*s + ci*2.5*s, cy + 36*s); ctx.lineTo(cx + 28*s + ci*3.5*s, cy + 40*s); ctx.stroke()
  }

  // Body
  olShape(ctx, () => { ctx.beginPath(); ctx.ellipse(cx, cy + 8*s, 28*s, 22*s, 0, 0, Math.PI * 2) }, color, OL)
  ctx.fillStyle = lighten(color, 30); ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.ellipse(cx + 2*s, cy + 12*s, 16*s, 12*s, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1
  // Spine
  ctx.fillStyle = darken(color, 30)
  for (let si = 0; si < 5; si++) { const sx = cx - 10*s + si*5*s, sH = 6*s; ctx.beginPath(); ctx.moveTo(sx - 2*s, cy - 10*s); ctx.lineTo(sx, cy - 10*s - sH); ctx.lineTo(sx + 2*s, cy - 10*s); ctx.closePath(); ctx.fill() }

  // Fists
  olLine(ctx, cx - 24*s, cy, cx - 34*s, cy - 8*s, 7*s, lighten(color, 15), OL)
  olCircle(ctx, cx - 35*s, cy - 10*s, 7*s, lighten(color, 15), OL)
  olLine(ctx, cx + 24*s, cy, cx + 34*s, cy - 8*s, 7*s, lighten(color, 15), OL)
  olCircle(ctx, cx + 35*s, cy - 10*s, 7*s, lighten(color, 15), OL)
  // Fist claws
  ctx.strokeStyle = '#eee'; ctx.lineWidth = 2*s
  for (let ci = -1; ci <= 1; ci++) {
    ctx.beginPath(); ctx.moveTo(cx - 38*s, cy - 10*s + ci*4*s); ctx.lineTo(cx - 44*s, cy - 12*s + ci*6*s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 38*s, cy - 10*s + ci*4*s); ctx.lineTo(cx + 44*s, cy - 12*s + ci*6*s); ctx.stroke()
  }

  // Head
  const hR = 32*s, hY = cy - 28*s
  olCircle(ctx, cx, hY, hR, color, OL)

  // Mane spikes
  ctx.fillStyle = darken(color, 30)
  for (let mi = 0; mi < 10; mi++) { const mA = (mi / 10) * Math.PI * 2 - Math.PI / 2, sL = hR * 0.4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(mA - 0.25) * hR * 0.75, hY + Math.sin(mA - 0.25) * hR * 0.75); ctx.lineTo(cx + Math.cos(mA) * (hR + sL), hY + Math.sin(mA) * (hR + sL)); ctx.lineTo(cx + Math.cos(mA + 0.25) * hR * 0.75, hY + Math.sin(mA + 0.25) * hR * 0.75); ctx.closePath(); ctx.fill() }

  // Snout
  olShape(ctx, () => { ctx.beginPath(); ctx.ellipse(cx, hY + 12*s, 14*s, 10*s, 0, 0, Math.PI * 2) }, darken(color, 15), OL)
  ctx.fillStyle = '#1a0a05'; ctx.beginPath(); ctx.ellipse(cx, hY + 6*s, 5*s, 3.5*s, 0, 0, Math.PI * 2); ctx.fill()

  // Mouth + fangs
  ctx.fillStyle = '#1a0505'; ctx.beginPath(); ctx.moveTo(cx - 12*s, hY + 14*s); ctx.quadraticCurveTo(cx, hY + 26*s, cx + 12*s, hY + 14*s); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#8B2020'; ctx.beginPath(); ctx.ellipse(cx, hY + 18*s, 7*s, 4*s, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  for (let ti = -2; ti <= 2; ti++) { ctx.beginPath(); ctx.moveTo(cx + ti*4.5*s - 2*s, hY + 14*s); ctx.lineTo(cx + ti*4.5*s, hY + 18*s); ctx.lineTo(cx + ti*4.5*s + 2*s, hY + 14*s); ctx.closePath(); ctx.fill() }
  ctx.beginPath(); ctx.moveTo(cx - 10*s, hY + 13*s); ctx.lineTo(cx - 8*s, hY + 22*s); ctx.lineTo(cx - 6*s, hY + 13*s); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(cx + 10*s, hY + 13*s); ctx.lineTo(cx + 8*s, hY + 22*s); ctx.lineTo(cx + 6*s, hY + 13*s); ctx.closePath(); ctx.fill()

  // Eyes
  ctx.fillStyle = '#1a1008'; ctx.beginPath(); ctx.ellipse(cx - 12*s, hY - 4*s, 9*s, 7*s, -0.15, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + 12*s, hY - 4*s, 9*s, 7*s, 0.15, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ffee33'; ctx.beginPath(); ctx.ellipse(cx - 12*s, hY - 4*s, 7*s, 5.5*s, -0.15, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + 12*s, hY - 4*s, 7*s, 5.5*s, 0.15, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0000'; ctx.beginPath(); ctx.ellipse(cx - 11*s, hY - 4*s, 2*s, 4.5*s, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + 11*s, hY - 4*s, 2*s, 4.5*s, 0, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - 14*s, hY - 6*s, 2*s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 10*s, hY - 6*s, 2*s, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = 'rgba(255,220,0,0.15)'; ctx.beginPath(); ctx.arc(cx - 12*s, hY - 4*s, 12*s, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + 12*s, hY - 4*s, 12*s, 0, Math.PI * 2); ctx.fill()
  // Brows
  ctx.strokeStyle = '#1a1008'; ctx.lineWidth = 4*s; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(cx - 20*s, hY - 14*s); ctx.lineTo(cx - 6*s, hY - 9*s); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx + 20*s, hY - 14*s); ctx.lineTo(cx + 6*s, hY - 9*s); ctx.stroke()

  // Ears
  olShape(ctx, () => { ctx.beginPath(); ctx.moveTo(cx - 18*s, hY - 18*s); ctx.lineTo(cx - 24*s, hY - 42*s); ctx.lineTo(cx - 8*s, hY - 22*s); ctx.closePath() }, color, OL)
  ctx.fillStyle = lighten(color, 35); ctx.beginPath(); ctx.moveTo(cx - 17*s, hY - 20*s); ctx.lineTo(cx - 22*s, hY - 36*s); ctx.lineTo(cx - 10*s, hY - 22*s); ctx.closePath(); ctx.fill()
  olShape(ctx, () => { ctx.beginPath(); ctx.moveTo(cx + 18*s, hY - 18*s); ctx.lineTo(cx + 24*s, hY - 42*s); ctx.lineTo(cx + 8*s, hY - 22*s); ctx.closePath() }, color, OL)
  ctx.fillStyle = lighten(color, 35); ctx.beginPath(); ctx.moveTo(cx + 17*s, hY - 20*s); ctx.lineTo(cx + 22*s, hY - 36*s); ctx.lineTo(cx + 10*s, hY - 22*s); ctx.closePath(); ctx.fill()

  return c
}
