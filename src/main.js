import * as THREE from 'three'

function _p(mesh, x, y, z) { mesh.position.set(x||0, y||0, z||0); return mesh }
function _ps(mesh, x, y, z, sx, sy, sz) { mesh.position.set(x||0, y||0, z||0); mesh.scale.set(sx, sy, sz); return mesh }
function _pr(mesh, x, y, z, rx, ry, rz) { mesh.position.set(x||0, y||0, z||0); mesh.rotation.set(rx||0, ry||0, rz||0); return mesh }
function _psr(mesh, x, y, z, sx, sy, sz, rx, ry, rz) { mesh.position.set(x||0, y||0, z||0); mesh.scale.set(sx, sy, sz); mesh.rotation.set(rx||0, ry||0, rz||0); return mesh }


// ======================== RENDERER ========================
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 0.9
document.body.appendChild(renderer.domElement)

// ======================== SCENE ========================
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02)

// ======================== CAMERA (orbitable) ========================
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200)
let camAngle = 0       // horizontal orbit angle
let camPitch = 0.35    // vertical pitch (radians)
let camDist = 16       // distance from target
const camTarget = new THREE.Vector3(0, 1.5, 0)

function updateCamera() {
  const x = camTarget.x + Math.sin(camAngle) * camDist * Math.cos(camPitch)
  const y = camTarget.y + Math.sin(camPitch) * camDist
  const z = camTarget.z + Math.cos(camAngle) * camDist * Math.cos(camPitch)
  camera.position.set(x, y, z)
  camera.lookAt(camTarget)
}
updateCamera()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ======================== CAMERA CONTROLS ========================
// Desktop: right-click drag
let camDragging = false, camLastX = 0, camLastY = 0
renderer.domElement.addEventListener('contextmenu', e => e.preventDefault())
renderer.domElement.addEventListener('mousedown', e => { if (e.button === 2) { camDragging = true; camLastX = e.clientX; camLastY = e.clientY } })
window.addEventListener('mousemove', e => {
  if (!camDragging) return
  camAngle -= (e.clientX - camLastX) * 0.005
  camPitch = Math.max(0.1, Math.min(1.2, camPitch + (e.clientY - camLastY) * 0.005))
  camLastX = e.clientX; camLastY = e.clientY
})
window.addEventListener('mouseup', () => { camDragging = false })
// Scroll zoom
renderer.domElement.addEventListener('wheel', e => { camDist = Math.max(8, Math.min(30, camDist + e.deltaY * 0.01)) }, { passive: true })

// Mobile: two-finger drag to orbit
let camTouches = []
renderer.domElement.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    camTouches = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }, { x: e.touches[1].clientX, y: e.touches[1].clientY }]
    document.getElementById('cam-hint').classList.add('hidden')
  }
}, { passive: true })
renderer.domElement.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && camTouches.length === 2) {
    const dx = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - ((camTouches[0].x + camTouches[1].x) / 2)
    const dy = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - ((camTouches[0].y + camTouches[1].y) / 2)
    camAngle -= dx * 0.006
    camPitch = Math.max(0.1, Math.min(1.2, camPitch + dy * 0.006))
    camTouches = [{ x: e.touches[0].clientX, y: e.touches[0].clientY }, { x: e.touches[1].clientX, y: e.touches[1].clientY }]
  }
}, { passive: true })

// ======================== AUDIO ========================
let soundOn = true
let actx = null
function getACtx() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); return actx }

// Music is handled by inline HTML script (window.GAME.musicOn)

function playBeep(freq, dur, type, vol) {
  if (!isSoundOn()) return
  try { const a = getACtx(), o = a.createOscillator(), g = a.createGain(); o.type = type || 'square'; o.frequency.value = freq; g.gain.value = vol || 0.06; g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur); o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur) } catch (e) {}
}
function sndAttack() { playBeep(800, 0.1, 'sawtooth', 0.08) }
function sndHit() { playBeep(200, 0.15, 'square', 0.1) }
function sndBeastHit() { playBeep(150, 0.2, 'sawtooth', 0.08) }
function sndSwitch() { playBeep(1200, 0.05, 'sine', 0.06) }
function sndWave() { playBeep(600, 0.3, 'triangle', 0.07); setTimeout(() => playBeep(800, 0.2, 'triangle', 0.07), 150) }

// Sound effects follow GAME.musicOn flag
function isSoundOn() { return window.GAME ? window.GAME.musicOn : true }

// ======================== LIGHTING ========================
scene.add(new THREE.AmbientLight(0x303050, 0.6))
const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2)
dirLight.position.set(5, 12, 8); dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024); dirLight.shadow.camera.near = 1; dirLight.shadow.camera.far = 40
dirLight.shadow.camera.left = -15; dirLight.shadow.camera.right = 15; dirLight.shadow.camera.top = 10; dirLight.shadow.camera.bottom = -5
scene.add(dirLight)
scene.add(new THREE.PointLight(0xaabbff, 0.8, 50).translateX(10).translateY(15).translateZ(-8))
const bounceLight = new THREE.PointLight(0xff6633, 0.3, 20); bounceLight.position.set(0, 0.5, 5); scene.add(bounceLight)

// ======================== ENVIRONMENT ========================
scene.add(new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ color: 0x080818, side: THREE.BackSide })))

const starGeo = new THREE.BufferGeometry(); const sv = []
for (let i = 0; i < 400; i++) { const t = Math.random() * Math.PI * 2, p = Math.acos(Math.random() * 2 - 1), r = 60 + Math.random() * 15; sv.push(r * Math.sin(p) * Math.cos(t), r * Math.cos(p), r * Math.sin(p) * Math.sin(t)) }
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3))
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true })))

const moon = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffdd })); moon.position.set(15, 20, -30); scene.add(moon)
scene.add(new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffdd, transparent: true, opacity: 0.06 })).translateX(15).translateY(20).translateZ(-30))

// Ground
const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.9, metalness: 0.1 }))
groundMesh.rotation.x = -Math.PI / 2; groundMesh.receiveShadow = true; scene.add(groundMesh)
const sandMesh = new THREE.Mesh(new THREE.CircleGeometry(13, 48), new THREE.MeshStandardMaterial({ color: 0x8a7a58, roughness: 0.95 }))
sandMesh.rotation.x = -Math.PI / 2; sandMesh.position.y = 0.01; sandMesh.receiveShadow = true; scene.add(sandMesh)
scene.add(new THREE.Mesh(new THREE.TorusGeometry(13, 0.15, 8, 64), new THREE.MeshStandardMaterial({ color: 0x5a4a30, roughness: 0.7 })).rotateX(-Math.PI / 2).translateZ(0.05))

for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2, px = Math.cos(a) * 15, pz = Math.sin(a) * 15
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 6, 12), new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 0.6 }))
  p.position.set(px, 3, pz); p.castShadow = true; scene.add(p)
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 0.4, 12), new THREE.MeshStandardMaterial({ color: 0xb0a080 }))
  c.position.set(px, 6.2, pz); scene.add(c)
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x7a6a50 }))
  b.position.set(px, 0.15, pz); scene.add(b)
}

// ======================== SOLDIER (3D) ========================
function createSoldier() {
  const g = new THREE.Group()
  const skin = new THREE.MeshStandardMaterial({ color: 0xe8b878, roughness: 0.7 })
  const armor = new THREE.MeshStandardMaterial({ color: 0x999088, roughness: 0.4, metalness: 0.5 })
  const red = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.6 })
  const brown = new THREE.MeshStandardMaterial({ color: 0x6B3513, roughness: 0.8 })
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4a030, roughness: 0.3, metalness: 0.7 })
  const blade = new THREE.MeshStandardMaterial({ color: 0xddddee, roughness: 0.2, metalness: 0.8 })

  // Torso
  g.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.0, 10), armor), 0, 1.5, 0))
  g.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 0.5, 10), red), 0, 0.85, 0))
  g.add(_pr(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 20), brown), 0, 1.1, 0, Math.PI / 2, 0, 0))
  g.add(_p(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.1), gold), 0, 1.1, 0.42))

  // Shoulders
  for (const s of [-1, 1]) {
    g.add(_ps(new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), armor), s * 0.55, 1.9, 0, 1, 0.6, 1))
    g.add(_p(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), gold), s * 0.55, 1.92, 0.12))
  }

  // Head + Face
  g.add(_p(new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), skin), 0, 2.35, 0))
  for (const s of [-0.1, 0.1]) {
    g.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));_m.position.set(s, 2.38, 0.27);return _m})())
    g.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0x1a1008 }));_m.position.set(s, 2.38, 0.3);return _m})())
  }

  // Helmet + plume
  g.add(_p(new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), armor), 0, 2.4, 0))
  const plume = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.35), red)
  plume.position.set(0, 2.9, -0.05); g.add(plume)
  g.add(_ps(new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), red), 0, 3.2, -0.05, 0.6, 1, 1.5))
  for (const s of [-1, 1]) g.add(_p(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.16), armor), s * 0.34, 2.25, 0.08))

  // Arms
  const lArm = new THREE.Group()
  lArm.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skin), 0, -0.25, 0))
  lArm.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skin), 0, -0.6, 0))
  lArm.position.set(-0.65, 1.85, 0); g.add(lArm)

  const rArm = new THREE.Group()
  rArm.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skin), 0, -0.25, 0))
  rArm.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skin), 0, -0.6, 0))
  rArm.position.set(0.65, 1.85, 0); g.add(rArm)

  // Legs
  const lLeg = new THREE.Group()
  lLeg.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), skin), 0, -0.25, 0))
  lLeg.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.45, 8), skin), 0, -0.6, 0))
  lLeg.add(_p(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.24), brown), 0, -0.85, 0.04))
  lLeg.position.set(-0.2, 0.6, 0); g.add(lLeg)

  const rLeg = new THREE.Group()
  rLeg.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), skin), 0, -0.25, 0))
  rLeg.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.45, 8), skin), 0, -0.6, 0))
  rLeg.add(_p(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.24), brown), 0, -0.85, 0.04))
  rLeg.position.set(0.2, 0.6, 0); g.add(rLeg)

  // SPEAR (BIGGER, more visible)
  const spear = new THREE.Group()
  spear.add(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 3.5, 8), brown))
  spear.add(_p(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 8), blade), 0, 1.95, 0))
  // Spear glow
  spear.add((function(){var _m=new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0xccddff, transparent: true, opacity: 0.2 }));_m.position.set(0, 1.85, 0);return _m})())
  spear.position.set(-0.65, 1.3, 0.4); spear.rotation.x = -0.15; g.add(spear)

  // SHIELD (BIGGER)
  const shield = new THREE.Group()
  shield.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.65), new THREE.MeshStandardMaterial({ color: 0xcc9922, roughness: 0.4, metalness: 0.3 })))
  shield.add(_p(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), gold), 0.06, 0, 0))
  shield.add((function(){var _m=new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.65, 0.45), new THREE.MeshStandardMaterial({ color: 0x882222 }));_m.position.set(0.06, 0, 0);return _m})())
  // Shield rim glow
  shield.add(_pr(new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.03, 6, 20), gold), 0.06, 0, 0, 0, Math.PI / 2, 0))
  shield.position.set(0.7, 1.3, 0.3); g.add(shield)

  g.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
  return { group: g, lArm, rArm, lLeg, rLeg, spear, shield, plume }
}

// ======================== BEAST (3D) ========================
function createBeast() {
  const g = new THREE.Group()
  const bMat = new THREE.MeshStandardMaterial({ color: 0x3a3035, roughness: 0.7 })
  const dMat = new THREE.MeshStandardMaterial({ color: 0x2a2025, roughness: 0.8 })
  const claw = new THREE.MeshStandardMaterial({ color: 0xccccaa, roughness: 0.5 })

  const body = new THREE.Mesh(new THREE.SphereGeometry(0.85, 12, 10), bMat)
  body.scale.set(1.2, 0.9, 1.0); body.position.y = 1.2; g.add(body)
  g.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.8 }));_m.position.set(0, 1.0, 0.3);_m.scale.set(0.8, 0.7, 0.6);return _m})())

  const head = new THREE.Group()
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.58, 12, 10), bMat))
  head.add(_ps(new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), dMat), 0, -0.1, 0.42, 0.9, 0.7, 1.2))
  head.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), new THREE.MeshBasicMaterial({ color: 0x0a0505 }));_m.position.set(0, -0.02, 0.62);return _m})())

  const jaw = new THREE.Group()
  jaw.add(_ps(new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, Math.PI * 0.5), dMat), 0, 0, 0.3, 0.8, 0.5, 1))
  for (const s of [-0.08, 0.08]) jaw.add(_pr(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.18, 4), claw), s, -0.14, 0.36, 0.2, 0, 0))
  jaw.position.y = -0.15; head.add(jaw)
  for (const s of [-0.1, 0.1]) head.add(_p(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 4), claw), s, -0.22, 0.47))

  // EYES (bigger, brighter glow)
  for (const s of [-0.22, 0.22]) {
    head.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0x1a1008 }));_m.position.set(s, 0.1, 0.42);return _m})())
    head.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffee22, emissive: 0xffcc00, emissiveIntensity: 3 }));_m.position.set(s, 0.1, 0.45);return _m})())
    head.add((function(){var _m=new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), new THREE.MeshBasicMaterial({ color: 0x0a0000 }));_m.position.set(s, 0.1, 0.5);_m.scale.set(0.5, 1, 1);return _m})())
    const el = new THREE.PointLight(0xffcc00, 0.5, 4); el.position.set(s, 0.1, 0.55); head.add(el)
  }
  for (const s of [-1, 1]) head.add(_pr(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.28, 4), bMat), s * 0.32, 0.48, 0.1, 0, 0, s * -0.4))
  for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.3, 4), dMat); const a = (i / 6) * Math.PI - Math.PI * 0.5; sp.position.set(Math.sin(a) * 0.38, 0.42 + Math.cos(a) * 0.15, -0.1); sp.rotation.set(-0.3, 0, a * 0.5); head.add(sp) }
  head.position.set(0, 1.95, 0.3); g.add(head)

  // Wings (bigger)
  const wMat = new THREE.MeshStandardMaterial({ color: 0x2a2530, roughness: 0.7, side: THREE.DoubleSide })
  const lw = new THREE.Group()
  const ls = new THREE.Shape(); ls.moveTo(0, 0); ls.lineTo(-0.4, 1.0); ls.lineTo(-1.5, 0.7); ls.lineTo(-1.8, 0.2); ls.lineTo(-1.4, -0.3); ls.lineTo(-0.5, -0.1); ls.lineTo(0, 0)
  lw.add(new THREE.Mesh(new THREE.ShapeGeometry(ls), wMat)); lw.position.set(-0.7, 1.5, -0.2); lw.rotation.y = -0.3; g.add(lw)
  const rw = new THREE.Group()
  const rs = new THREE.Shape(); rs.moveTo(0, 0); rs.lineTo(0.4, 1.0); rs.lineTo(1.5, 0.7); rs.lineTo(1.8, 0.2); rs.lineTo(1.4, -0.3); rs.lineTo(0.5, -0.1); rs.lineTo(0, 0)
  rw.add(new THREE.Mesh(new THREE.ShapeGeometry(rs), wMat)); rw.position.set(0.7, 1.5, -0.2); rw.rotation.y = 0.3; g.add(rw)

  // Claws
  const lC = new THREE.Group()
  lC.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 6), bMat), 0, -0.32, 0))
  for (let i = -1; i <= 1; i++) lC.add(_pr(new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 4), claw), i * 0.04, -0.7, 0, 0.3, 0, 0))
  lC.position.set(-0.75, 1.1, 0.45); lC.rotation.x = 0.5; g.add(lC)
  const rC = lC.clone(); rC.position.set(0.75, 1.1, 0.45); g.add(rC)

  for (const s of [-1, 1]) { g.add(_p(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.7, 6), bMat), s * 0.42, 0.35, -0.3)); g.add(_ps(new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), dMat), s * 0.42, 0, -0.25, 1, 0.5, 1.3)) }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.025, 1.0, 6), bMat); tail.position.set(0, 0.9, -0.85); tail.rotation.x = 0.8; g.add(tail)

  g.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
  return { group: g, head, jaw, lw, rw, lC, rC, body, tail }
}

// ======================== INSTANTIATE ========================
const soldier = createSoldier(); soldier.group.position.set(-4, 0, 0); scene.add(soldier.group)
const beast = createBeast(); beast.group.position.set(10, 0, 0); scene.add(beast.group)

// ======================== WEAPONS ========================
const WEAPONS = [{ name: '劍', dmg: 15, range: 2.8, cd: 0.3 }, { name: '矛', dmg: 20, range: 4.0, cd: 0.5 }, { name: '弓', dmg: 12, range: 12, cd: 0.6 }]
let curWpn = 0; const wpnEl = document.getElementById('weapon-display')
function switchWpn() { curWpn = (curWpn + 1) % WEAPONS.length; wpnEl.textContent = '武器：' + WEAPONS[curWpn].name; sndSwitch() }

const arrowGrp = new THREE.Group(); scene.add(arrowGrp); const arrows = []
const partGrp = new THREE.Group(); scene.add(partGrp); const parts = []
function spawnP(x, y, z, col, n) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 4, 4), new THREE.MeshBasicMaterial({ color: col, transparent: true })); m.position.set(x, y, z); partGrp.add(m); parts.push({ mesh: m, vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 1, vz: (Math.random() - 0.5) * 5, life: 0.4 + Math.random() * 0.3 }) } }

// ======================== STATE ========================
const GY = 0, GRAV = -22, JV = 9, MSPD = 6, BSPD = 4, BDMG = 8, BCSPD = 8
const st = { px: -4, py: 0, pz: 0, pvy: 0, php: 100, pmhp: 100, pFace: 0, atk: false, atkT: 0, pHitCD: 0, atkCD: 0, bx: 10, by: 0, bz: 0, bhp: 80, bmhp: 80, bFace: -1, bSt: 'approach', bT: 0, bHitCD: 0, bDir: 0, wave: 1, over: false, started: false, shake: 0, shakeI: 0, slowMo: 1 }

// ======================== INPUT ========================
const keys = {}; let swP = false, atkP = false
window.addEventListener('keydown', e => { keys[e.code] = true; if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault(); try { getACtx().resume() } catch (e2) {} })
window.addEventListener('keyup', e => { keys[e.code] = false })

const mk = { attack: false, jump: false, weapon: false }
function sBtn(id, key) { const el = document.getElementById(id); if (!el) return; function on(e) { e.preventDefault(); e.stopPropagation(); mk[key] = true; el.classList.add('pressed') } function off() { mk[key] = false; el.classList.remove('pressed') } el.addEventListener('touchstart', on, { passive: false }); el.addEventListener('touchend', e => { e.preventDefault(); off() }, { passive: false }); el.addEventListener('touchcancel', off); el.addEventListener('mousedown', on); el.addEventListener('mouseup', off); el.addEventListener('mouseleave', off) }
sBtn('btn-attack', 'attack'); sBtn('btn-jump', 'jump'); sBtn('btn-weapon', 'weapon')

// VIRTUAL JOYSTICK
const joyZone = document.getElementById('joystick-zone')
const joyBase = document.getElementById('joystick-base')
const joyKnob = document.getElementById('joystick-knob')
let joyActive = false, joyId = null, joyBX = 0, joyBY = 0, joyDX = 0, joyDY = 0
joyZone.addEventListener('touchstart', e => {
  if (joyActive) return; const t = e.changedTouches[0]; joyActive = true; joyId = t.identifier
  joyBX = t.clientX; joyBY = t.clientY; joyDX = 0; joyDY = 0
  joyBase.style.display = 'block'; joyBase.style.left = (joyBX - 60) + 'px'; joyBase.style.top = (joyBY - 60) + 'px'
  joyKnob.style.display = 'block'; joyKnob.style.left = (joyBX - 25) + 'px'; joyKnob.style.top = (joyBY - 25) + 'px'
  e.preventDefault()
}, { passive: false })
joyZone.addEventListener('touchmove', e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i]; if (t.identifier !== joyId) continue
    let dx = t.clientX - joyBX, dy = t.clientY - joyBY; const d = Math.hypot(dx, dy), mx = 55
    if (d > mx) { dx = dx / d * mx; dy = dy / d * mx }
    joyDX = dx / mx; joyDY = dy / mx
    joyKnob.style.left = (joyBX + dx - 25) + 'px'; joyKnob.style.top = (joyBY + dy - 25) + 'px'
  }
  e.preventDefault()
}, { passive: false })
function joyEnd(e) { for (let i = 0; i < e.changedTouches.length; i++) { if (e.changedTouches[i].identifier === joyId) { joyActive = false; joyDX = 0; joyDY = 0; joyBase.style.display = 'none'; joyKnob.style.display = 'none' } } }
joyZone.addEventListener('touchend', joyEnd, { passive: true })
joyZone.addEventListener('touchcancel', joyEnd, { passive: true })

function getMove() {
  let mx = 0, mz = 0
  if (keys['ArrowLeft'] || keys['KeyA']) mx -= 1
  if (keys['ArrowRight'] || keys['KeyD']) mx += 1
  if (keys['ArrowUp'] || keys['KeyW']) mz -= 1
  if (keys['ArrowDown'] || keys['KeyS']) mz += 1
  // Add joystick
  mx += joyDX; mz += joyDY
  const mag = Math.hypot(mx, mz)
  if (mag > 1) { mx /= mag; mz /= mag }
  return { mx, mz }
}

// ======================== UI ========================
const phpEl = document.getElementById('player-hp'), bhpEl = document.getElementById('beast-hp'), waveEl = document.getElementById('wave-display')
const olEl = document.getElementById('overlay'), olT = document.getElementById('overlay-title'), olS = document.getElementById('overlay-sub'), menuEl = document.getElementById('menu')
function uUI() { phpEl.style.width = Math.max(0, st.php / st.pmhp * 100) + '%'; bhpEl.style.width = Math.max(0, st.bhp / st.bmhp * 100) + '%'; waveEl.textContent = '第 ' + st.wave + ' 波' }
function showOL(t, s, w) { olEl.classList.add('show'); olT.textContent = t; olT.className = w ? 'win' : 'lose'; olS.textContent = s }

function reset() { st.px = -4; st.py = GY; st.pz = 0; st.pvy = 0; st.php = st.pmhp; st.atk = false; st.atkCD = 0; st.bx = 10; st.by = GY; st.bz = 0; st.bmhp = 80; st.bhp = st.bmhp; st.bSt = 'approach'; st.bT = 0; st.wave = 1; st.over = false; st.shake = 0; st.slowMo = 1; curWpn = 0; wpnEl.textContent = '武器：劍'; for (const a of arrows) { arrowGrp.remove(a.mesh) }; arrows.length = 0; uUI() }

// Hooks called by inline HTML script
window._onStart = function() { st.started = true; st.over = false; reset() }
window._onMenu = function() { st.started = false; st.over = false }
window._onRestart = function() { st.started = true; st.over = false; reset() }

// If user already clicked start before module loaded, catch up
if (window.GAME && window.GAME.started) { st.started = true; reset() }

// ======================== GAME LOGIC ========================
function upPlayer(dt) {
  if (st.over || !st.started) return
  const { mx, mz } = getMove()
  // Move relative to camera angle
  const moveAngle = camAngle
  const fx = mx * Math.cos(moveAngle) - mz * Math.sin(moveAngle)
  const fz = mx * Math.sin(moveAngle) + mz * Math.cos(moveAngle)
  st.px += fx * MSPD * dt; st.pz += fz * MSPD * dt
  // Clamp to arena
  const ad = Math.hypot(st.px, st.pz); if (ad > 12) { st.px = st.px / ad * 12; st.pz = st.pz / ad * 12 }
  // Face direction of movement
  if (Math.abs(fx) > 0.1 || Math.abs(fz) > 0.1) st.pFace = Math.atan2(fx, fz)

  const jump = keys['Space'] && !keys['KeyJ'] ? false : (keys['ArrowUp'] || keys['KeyW'] || mk.jump)
  // Jump only if not moving forward (W is move, so use dedicated jump)
  if (mk.jump && st.py <= GY + 0.05) st.pvy = JV
  if (keys['Space'] && st.py <= GY + 0.05 && !st.atk) {} // space is attack
  st.pvy += GRAV * dt; st.py += st.pvy * dt; if (st.py < GY) { st.py = GY; st.pvy = 0 }

  if ((mk.weapon || keys['KeyQ']) && !swP) { switchWpn(); swP = true }
  if (!mk.weapon && !keys['KeyQ']) swP = false
  if (st.atkCD > 0) st.atkCD -= dt

  const wp = WEAPONS[curWpn]
  const atkDown = keys['KeyJ'] || keys['Space'] || mk.attack
  if (atkDown && !atkP && !st.atk && st.atkCD <= 0) {
    st.atk = true; st.atkT = 0.25; st.atkCD = wp.cd; atkP = true; sndAttack()
    if (curWpn === 2) {
      const dir = new THREE.Vector3(Math.sin(st.pFace), 0, Math.cos(st.pFace))
      const am = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 4), new THREE.MeshStandardMaterial({ color: 0xccaa66 }))
      am.rotation.z = Math.PI / 2; am.rotation.y = st.pFace
      am.position.set(st.px + dir.x * 0.8, st.py + 1.5, st.pz + dir.z * 0.8)
      arrowGrp.add(am); arrows.push({ mesh: am, vx: dir.x * 20, vz: dir.z * 20, life: 2, dmg: wp.dmg + st.wave * 2 })
    } else {
      const dx = st.bx - st.px, dz = st.bz - st.pz, dy = (st.by + 1.2) - (st.py + 1.2)
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < wp.range && st.bHitCD <= 0) {
        st.bhp -= (wp.dmg + st.wave * 2); st.bHitCD = 0.25; sndHit()
        spawnP(st.bx, st.by + 1.5, st.bz, 0xffcc00, 10); st.shake = 0.12; st.shakeI = 0.08
        if (st.bhp <= 0) { spawnP(st.bx, st.by + 1.5, st.bz, 0xff4400, 20); st.slowMo = 0.2; setTimeout(() => { st.slowMo = 1 }, 600); nxtWave() }
      }
    }
    spawnP(st.px + Math.sin(st.pFace) * 1, st.py + 1.5, st.pz + Math.cos(st.pFace) * 1, 0xffffff, 4)
  }
  if (!atkDown) atkP = false
  if (st.atk) { st.atkT -= dt; if (st.atkT <= 0) st.atk = false }
  if (st.pHitCD > 0) st.pHitCD -= dt
}

function upArrows(dt) {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i]; a.mesh.position.x += a.vx * dt; a.mesh.position.z += a.vz * dt; a.life -= dt
    if (st.bhp > 0) { const dx = a.mesh.position.x - st.bx, dy = a.mesh.position.y - (st.by + 1.2), dz = a.mesh.position.z - st.bz; if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.5 && st.bHitCD <= 0) { st.bhp -= a.dmg; st.bHitCD = 0.25; sndHit(); spawnP(st.bx, st.by + 1.5, st.bz, 0xffcc00, 8); st.shake = 0.1; st.shakeI = 0.06; if (st.bhp <= 0) { spawnP(st.bx, st.by + 1.5, st.bz, 0xff4400, 20); st.slowMo = 0.2; setTimeout(() => { st.slowMo = 1 }, 600); nxtWave() }; a.life = 0 } }
    if (a.life <= 0 || Math.hypot(a.mesh.position.x, a.mesh.position.z) > 20) { arrowGrp.remove(a.mesh); arrows.splice(i, 1) }
  }
}

function upBeast(dt) {
  if (st.over || st.bhp <= 0 || !st.started) return
  st.bT -= dt; if (st.bHitCD > 0) st.bHitCD -= dt
  const dx = st.px - st.bx, dz = st.pz - st.bz, dist = Math.sqrt(dx * dx + dz * dz)
  st.bFace = Math.atan2(dx, dz)

  if (st.bSt === 'approach') {
    const spd = BSPD * dt; if (dist > 0.1) { st.bx += (dx / dist) * spd; st.bz += (dz / dist) * spd }
    st.by = GY + Math.abs(Math.sin(performance.now() / 250)) * 0.4
    if (dist < 5) { st.bSt = 'windup'; st.bT = 0.4 + Math.random() * 0.3 }
  } else if (st.bSt === 'windup') {
    st.bx += Math.sin(performance.now() / 25) * 0.02; st.by = GY + 0.2
    if (st.bT <= 0) { st.bSt = 'charge'; st.bDir = st.bFace; st.bT = 0.5 }
  } else if (st.bSt === 'charge') {
    const cs = BCSPD * (1 + st.wave * 0.1) * dt
    st.bx += Math.sin(st.bDir) * cs; st.bz += Math.cos(st.bDir) * cs
    st.by = GY + Math.abs(Math.sin(performance.now() / 80)) * 0.15
    const hd = Math.sqrt((st.px - st.bx) ** 2 + ((st.py + 1) - (st.by + 1)) ** 2 + (st.pz - st.bz) ** 2)
    if (hd < 2 && st.pHitCD <= 0) {
      st.php -= BDMG + st.wave * 1.5; st.pHitCD = 0.7; sndBeastHit()
      spawnP(st.px, st.py + 1.5, st.pz, 0xff4444, 12); st.shake = 0.2; st.shakeI = 0.15
      if (st.php <= 0) { st.php = 0; st.over = true; showOL('戰敗', '你喺第 ' + st.wave + ' 波倒下了', false) }
    }
    if (st.bT <= 0) { st.bSt = 'retreat'; st.bT = 0.8 }
  } else if (st.bSt === 'retreat') {
    st.bx -= Math.sin(st.bDir) * BSPD * 0.5 * dt; st.bz -= Math.cos(st.bDir) * BSPD * 0.5 * dt
    st.by = GY + Math.abs(Math.sin(performance.now() / 200)) * 0.4
    if (st.bT <= 0) st.bSt = 'approach'
  }
  const bd = Math.hypot(st.bx, st.bz); if (bd > 14) { st.bx = st.bx / bd * 14; st.bz = st.bz / bd * 14 }
}

function nxtWave() { st.wave++; st.bmhp = 80 + st.wave * 18; st.bhp = st.bmhp; const a = Math.random() * Math.PI * 2; st.bx = Math.sin(a) * 13; st.bz = Math.cos(a) * 13; st.by = GY + 2; st.bSt = 'approach'; st.bT = 0; st.php = Math.min(st.pmhp, st.php + 25); sndWave(); uUI() }

function upParts(dt) { for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt; p.vy -= 12 * dt; p.life -= dt; p.mesh.material.opacity = Math.max(0, p.life / 0.5); if (p.life <= 0) { partGrp.remove(p.mesh); parts.splice(i, 1) } } }

// ======================== ANIMATE ========================
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const raw = clock.getDelta(), dt = Math.min(raw * st.slowMo, 0.05), t = performance.now()

  // Sync with HTML button state
  if (window.GAME) st.started = window.GAME.started

  upPlayer(dt); upBeast(dt); upArrows(dt); upParts(dt); uUI()

  // Soldier
  soldier.group.position.set(st.px, st.py, st.pz)
  soldier.group.rotation.y = st.pFace
  const { mx, mz } = getMove(); const moving = Math.hypot(mx, mz) > 0.15
  const wk = moving ? Math.sin(t / 120) * 0.4 : 0
  soldier.lLeg.rotation.x = wk; soldier.rLeg.rotation.x = -wk; soldier.lArm.rotation.x = -wk * 0.3
  soldier.group.position.y = st.py + (moving ? Math.abs(Math.sin(t / 120)) * 0.04 : 0)
  if (st.atk) { const p = Math.sin(st.atkT * 20) * 0.8; soldier.spear.rotation.x = -0.15 - p; soldier.spear.position.z = 0.4 + p * 0.6; soldier.lArm.rotation.x = -p * 0.6 }
  else { soldier.spear.rotation.x += (-0.15 - soldier.spear.rotation.x) * 0.1; soldier.spear.position.z += (0.4 - soldier.spear.position.z) * 0.1 }
  soldier.group.traverse(c => { if (c.isMesh && c.material.emissive) c.material.emissive.setHex(st.pHitCD > 0.4 ? 0x881111 : 0x000000) })

  // Beast
  beast.group.position.set(st.bx, st.by, st.bz); beast.group.rotation.y = st.bFace; beast.group.visible = st.bhp > 0
  const bb = Math.sin(t / 300) * 0.15; beast.body.position.y = 1.2 + bb; beast.head.position.y = 1.95 + bb
  beast.lw.rotation.z = Math.sin(t / 150) * 0.4 - 0.2; beast.rw.rotation.z = -Math.sin(t / 150) * 0.4 + 0.2
  if (st.bSt === 'charge') { beast.jaw.rotation.x = Math.sin(t / 60) * 0.3; beast.group.rotation.z = -0.1; beast.lC.rotation.x = 0.5 + Math.sin(t / 80) * 0.3; beast.rC.rotation.x = 0.5 + Math.sin(t / 80 + 1) * 0.3 }
  else if (st.bSt === 'windup') { beast.jaw.rotation.x = Math.sin(t / 30) * 0.15; beast.group.rotation.z = Math.sin(t / 30) * 0.05 }
  else { beast.jaw.rotation.x *= 0.9; beast.group.rotation.z *= 0.9; beast.lC.rotation.x += (0.5 - beast.lC.rotation.x) * 0.05; beast.rC.rotation.x += (0.5 - beast.rC.rotation.x) * 0.05 }
  beast.tail.rotation.z = Math.sin(t / 200) * 0.3
  beast.group.traverse(c => { if (c.isMesh && c.material.emissive && c.material.emissiveIntensity < 1.5) c.material.emissive.setHex(st.bHitCD > 0.12 ? 0x881111 : 0x000000) })

  // Camera follow
  const mid = new THREE.Vector3((st.px + st.bx) * 0.5, 1.5, (st.pz + st.bz) * 0.5)
  camTarget.lerp(mid, 0.05)
  if (st.shake > 0) { st.shake -= raw; camera.position.x += (Math.random() - 0.5) * st.shakeI; camera.position.y += (Math.random() - 0.5) * st.shakeI }
  updateCamera()
  bounceLight.position.set(mid.x, 0.5, mid.z + 3)

  renderer.render(scene, camera)
}
animate()
