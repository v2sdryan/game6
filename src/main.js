import * as THREE from 'three'

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
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.025)

// ======================== CAMERA ========================
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(0, 6, 14)
camera.lookAt(0, 1.5, 0)
const cameraTarget = new THREE.Vector3(0, 1.5, 0)
const cameraBasePos = new THREE.Vector3(0, 6, 14)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// ======================== LIGHTING ========================
const ambientLight = new THREE.AmbientLight(0x303050, 0.6)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2)
dirLight.position.set(5, 12, 8)
dirLight.castShadow = true
dirLight.shadow.mapSize.set(1024, 1024)
dirLight.shadow.camera.near = 1
dirLight.shadow.camera.far = 40
dirLight.shadow.camera.left = -15
dirLight.shadow.camera.right = 15
dirLight.shadow.camera.top = 10
dirLight.shadow.camera.bottom = -5
scene.add(dirLight)

// Moon light
const moonLight = new THREE.PointLight(0xaabbff, 0.8, 50)
moonLight.position.set(10, 15, -8)
scene.add(moonLight)

// Dramatic red/orange ground bounce
const bounceLight = new THREE.PointLight(0xff6633, 0.3, 20)
bounceLight.position.set(0, 0.5, 5)
scene.add(bounceLight)

// ======================== AUDIO ========================
let soundOn = true
let actx = null
function getAudioCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)()
  return actx
}
function playBeep(freq, dur, type, vol) {
  if (!soundOn) return
  try {
    const a = getAudioCtx()
    const o = a.createOscillator(), g = a.createGain()
    o.type = type || 'square'; o.frequency.value = freq
    g.gain.value = vol || 0.06; g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur)
    o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur)
  } catch (e) {}
}
function sndAttack() { playBeep(800, 0.1, 'sawtooth', 0.08) }
function sndHit() { playBeep(200, 0.15, 'square', 0.1) }
function sndBeastHit() { playBeep(150, 0.2, 'sawtooth', 0.08) }
function sndSwitch() { playBeep(1200, 0.05, 'sine', 0.06) }
function sndWave() { playBeep(600, 0.3, 'triangle', 0.07); setTimeout(() => playBeep(800, 0.2, 'triangle', 0.07), 150) }

window._toggleSound = function() {
  soundOn = !soundOn
  const btn = document.getElementById('btn-sound')
  btn.textContent = soundOn ? '♫' : '✕'
  btn.classList.toggle('off', !soundOn)
}

// ======================== ENVIRONMENT ========================
// Sky sphere
const skyGeo = new THREE.SphereGeometry(80, 32, 16)
const skyMat = new THREE.MeshBasicMaterial({
  color: 0x080818, side: THREE.BackSide
})
scene.add(new THREE.Mesh(skyGeo, skyMat))

// Stars
const starGeo = new THREE.BufferGeometry()
const starVerts = []
for (let i = 0; i < 400; i++) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(Math.random() * 2 - 1)
  const r = 60 + Math.random() * 15
  starVerts.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3))
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true })))

// Moon
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffdd }))
moonMesh.position.set(15, 20, -30)
scene.add(moonMesh)
const moonGlow = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffdd, transparent: true, opacity: 0.06 }))
moonGlow.position.copy(moonMesh.position)
scene.add(moonGlow)

// Ground
const groundGeo = new THREE.PlaneGeometry(60, 40)
const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.9, metalness: 0.1 })
const groundMesh = new THREE.Mesh(groundGeo, groundMat)
groundMesh.rotation.x = -Math.PI / 2
groundMesh.receiveShadow = true
scene.add(groundMesh)

// Arena sand circle
const sandGeo = new THREE.CircleGeometry(12, 48)
const sandMat = new THREE.MeshStandardMaterial({ color: 0x8a7a58, roughness: 0.95 })
const sandMesh = new THREE.Mesh(sandGeo, sandMat)
sandMesh.rotation.x = -Math.PI / 2
sandMesh.position.y = 0.01
sandMesh.receiveShadow = true
scene.add(sandMesh)

// Arena boundary ring
const ringGeo = new THREE.TorusGeometry(12, 0.15, 8, 64)
const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a4a30, roughness: 0.7 })
const ring = new THREE.Mesh(ringGeo, ringMat)
ring.rotation.x = -Math.PI / 2
ring.position.y = 0.05
scene.add(ring)

// Pillars
for (let i = 0; i < 12; i++) {
  const angle = (i / 12) * Math.PI * 2
  const px = Math.cos(angle) * 14
  const pz = Math.sin(angle) * 14
  // Pillar
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.4, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x9a8a70, roughness: 0.6 })
  )
  pillar.position.set(px, 3, pz)
  pillar.castShadow = true
  pillar.receiveShadow = true
  scene.add(pillar)
  // Pillar capital
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.35, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xb0a080, roughness: 0.5 })
  )
  cap.position.set(px, 6.2, pz)
  scene.add(cap)
  // Pillar base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: 0x7a6a50, roughness: 0.7 })
  )
  base.position.set(px, 0.15, pz)
  scene.add(base)
}

// ======================== 3D SOLDIER ========================
function createSoldier() {
  const group = new THREE.Group()
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b878, roughness: 0.7 })
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x999088, roughness: 0.4, metalness: 0.5 })
  const redMat = new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.6 })
  const darkRedMat = new THREE.MeshStandardMaterial({ color: 0x882222, roughness: 0.7 })
  const brownMat = new THREE.MeshStandardMaterial({ color: 0x6B3513, roughness: 0.8 })
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a030, roughness: 0.3, metalness: 0.7 })

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.4, 1.0, 10), armorMat)
  torso.position.y = 1.5
  torso.castShadow = true
  group.add(torso)

  // Tunic (skirt)
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 0.5, 10), redMat)
  skirt.position.y = 0.85
  skirt.castShadow = true
  group.add(skirt)

  // Belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 20), brownMat)
  belt.rotation.x = Math.PI / 2
  belt.position.y = 1.1
  group.add(belt)
  // Belt buckle
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), goldMat)
  buckle.position.set(0, 1.1, 0.42)
  group.add(buckle)

  // Shoulder pads
  for (const side of [-1, 1]) {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), armorMat)
    pad.position.set(side * 0.55, 1.9, 0)
    pad.scale.set(1, 0.6, 1)
    pad.castShadow = true
    group.add(pad)
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), goldMat)
    stud.position.set(side * 0.55, 1.92, 0.1)
    group.add(stud)
  }

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), skinMat)
  head.position.y = 2.35
  head.castShadow = true
  group.add(head)

  // Eyes
  for (const side of [-0.1, 0.1]) {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }))
    eyeWhite.position.set(side, 2.38, 0.25)
    group.add(eyeWhite)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0x1a1008 }))
    pupil.position.set(side, 2.38, 0.28)
    group.add(pupil)
  }

  // Mouth (frown)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 4, 8, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5a3020 }))
  mouth.position.set(0, 2.2, 0.27)
  mouth.rotation.z = Math.PI
  group.add(mouth)

  // Helmet
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.33, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), armorMat)
  helmet.position.y = 2.4
  helmet.castShadow = true
  group.add(helmet)
  // Helmet brim
  const brim = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 6, 20, Math.PI), armorMat)
  brim.position.set(0, 2.35, 0)
  brim.rotation.y = Math.PI / 2
  brim.rotation.x = -0.3
  group.add(brim)
  // Plume
  const plume = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.3), redMat)
  plume.position.set(0, 2.85, -0.05)
  plume.castShadow = true
  group.add(plume)
  // Plume top (rounded)
  const plumeTop = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), redMat)
  plumeTop.position.set(0, 3.1, -0.05)
  plumeTop.scale.set(0.6, 1, 1.5)
  group.add(plumeTop)
  // Cheek guards
  for (const side of [-1, 1]) {
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.25, 0.15), armorMat)
    guard.position.set(side * 0.32, 2.25, 0.08)
    group.add(guard)
  }

  // Arms
  const leftArm = new THREE.Group()
  const lUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skinMat)
  lUpperArm.position.y = -0.25
  leftArm.add(lUpperArm)
  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skinMat)
  lForearm.position.y = -0.6
  leftArm.add(lForearm)
  leftArm.position.set(-0.6, 1.85, 0)
  leftArm.castShadow = true
  group.add(leftArm)

  const rightArm = new THREE.Group()
  const rUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.5, 8), skinMat)
  rUpperArm.position.y = -0.25
  rightArm.add(rUpperArm)
  const rForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 8), skinMat)
  rForearm.position.y = -0.6
  rightArm.add(rForearm)
  rightArm.position.set(0.6, 1.85, 0)
  rightArm.castShadow = true
  group.add(rightArm)

  // Legs
  const leftLeg = new THREE.Group()
  const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), skinMat)
  lThigh.position.y = -0.25
  leftLeg.add(lThigh)
  const lShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.45, 8), skinMat)
  lShin.position.y = -0.6
  leftLeg.add(lShin)
  // Sandal
  const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.22), brownMat)
  lFoot.position.set(0, -0.85, 0.04)
  leftLeg.add(lFoot)
  leftLeg.position.set(-0.2, 0.6, 0)
  leftLeg.castShadow = true
  group.add(leftLeg)

  const rightLeg = new THREE.Group()
  const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8), skinMat)
  rThigh.position.y = -0.25
  rightLeg.add(rThigh)
  const rShin = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.45, 8), skinMat)
  rShin.position.y = -0.6
  rightLeg.add(rShin)
  const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.22), brownMat)
  rFoot.position.set(0, -0.85, 0.04)
  rightLeg.add(rFoot)
  rightLeg.position.set(0.2, 0.6, 0)
  rightLeg.castShadow = true
  group.add(rightLeg)

  // Spear (in left hand)
  const spearGroup = new THREE.Group()
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 6), brownMat)
  shaft.castShadow = true
  spearGroup.add(shaft)
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), armorMat)
  tip.position.y = 1.55
  tip.castShadow = true
  spearGroup.add(tip)
  spearGroup.position.set(-0.6, 1.2, 0.3)
  spearGroup.rotation.x = -0.15
  group.add(spearGroup)

  // Shield (in right hand)
  const shieldGroup = new THREE.Group()
  const shieldBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0xcc9922, roughness: 0.4, metalness: 0.3 }))
  shieldBody.castShadow = true
  shieldGroup.add(shieldBody)
  const shieldBoss = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), goldMat)
  shieldBoss.position.set(0.05, 0, 0)
  shieldGroup.add(shieldBoss)
  // Shield red decoration
  const shieldDeco = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.5, 0.35), darkRedMat)
  shieldDeco.position.set(0.05, 0, 0)
  shieldGroup.add(shieldDeco)
  shieldGroup.position.set(0.65, 1.3, 0.25)
  group.add(shieldGroup)

  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })

  return { group, leftArm, rightArm, leftLeg, rightLeg, spearGroup, shieldGroup, head, plume }
}

// ======================== 3D BEAST ========================
function createBeast() {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a3035, roughness: 0.7 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a2025, roughness: 0.8 })
  const clawMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, roughness: 0.5 })

  // Body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 10), bodyMat)
  body.scale.set(1.2, 0.9, 1.0)
  body.position.y = 1.2
  body.castShadow = true
  group.add(body)

  // Belly (lighter)
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshStandardMaterial({ color: 0x6a5a50, roughness: 0.8 }))
  belly.position.set(0, 1.0, 0.3)
  belly.scale.set(0.8, 0.7, 0.6)
  group.add(belly)

  // Head
  const headGroup = new THREE.Group()
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), bodyMat)
  headMesh.castShadow = true
  headGroup.add(headMesh)

  // Snout
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), darkMat)
  snout.position.set(0, -0.1, 0.4)
  snout.scale.set(0.9, 0.7, 1.2)
  headGroup.add(snout)
  // Nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0x0a0505 }))
  nose.position.set(0, -0.02, 0.6)
  headGroup.add(nose)

  // Jaw (opens when attacking)
  const jaw = new THREE.Group()
  const jawMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6, 0, Math.PI * 2, Math.PI * 0.5), darkMat)
  jawMesh.position.set(0, 0, 0.3)
  jawMesh.scale.set(0.8, 0.5, 1)
  jaw.add(jawMesh)
  // Fangs
  for (const side of [-0.08, 0.08]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.15, 4), clawMat)
    fang.position.set(side, -0.12, 0.35)
    fang.rotation.x = 0.2
    jaw.add(fang)
  }
  jaw.position.set(0, -0.15, 0)
  headGroup.add(jaw)

  // Upper fangs
  for (const side of [-0.1, 0.1]) {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 4), clawMat)
    fang.position.set(side, -0.2, 0.45)
    headGroup.add(fang)
  }

  // Eyes (glowing yellow!)
  for (const side of [-0.2, 0.2]) {
    const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0x1a1008 }))
    eyeSocket.position.set(side, 0.1, 0.4)
    headGroup.add(eyeSocket)
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffee22, emissive: 0xffcc00, emissiveIntensity: 2 }))
    eye.position.set(side, 0.1, 0.43)
    headGroup.add(eye)
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0x0a0000 }))
    pupil.position.set(side, 0.1, 0.48)
    pupil.scale.set(0.5, 1, 1)
    headGroup.add(pupil)
    // Eye glow light
    const eyeLight = new THREE.PointLight(0xffcc00, 0.3, 3)
    eyeLight.position.set(side, 0.1, 0.5)
    headGroup.add(eyeLight)
  }

  // Ears
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 4), bodyMat)
    ear.position.set(side * 0.3, 0.45, 0.1)
    ear.rotation.z = side * -0.4
    headGroup.add(ear)
  }

  // Spiky hair/mane
  for (let i = 0; i < 6; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25 + Math.random() * 0.15, 4), darkMat)
    const angle = (i / 6) * Math.PI - Math.PI * 0.5
    spike.position.set(Math.sin(angle) * 0.35, 0.4 + Math.cos(angle) * 0.15, -0.1)
    spike.rotation.z = angle * 0.5
    spike.rotation.x = -0.3
    headGroup.add(spike)
  }

  headGroup.position.set(0, 1.9, 0.3)
  group.add(headGroup)

  // Wings
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x2a2530, roughness: 0.7, side: THREE.DoubleSide })
  const leftWing = new THREE.Group()
  // Wing membrane
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0)
  wingShape.lineTo(-0.3, 0.8)
  wingShape.lineTo(-1.2, 0.6)
  wingShape.lineTo(-1.5, 0.2)
  wingShape.lineTo(-1.2, -0.2)
  wingShape.lineTo(-0.4, -0.1)
  wingShape.lineTo(0, 0)
  const wingGeo = new THREE.ShapeGeometry(wingShape)
  const lWing = new THREE.Mesh(wingGeo, wingMat)
  lWing.castShadow = true
  leftWing.add(lWing)
  leftWing.position.set(-0.6, 1.5, -0.2)
  leftWing.rotation.y = -0.3
  group.add(leftWing)

  const rightWing = new THREE.Group()
  const rWingShape = new THREE.Shape()
  rWingShape.moveTo(0, 0)
  rWingShape.lineTo(0.3, 0.8)
  rWingShape.lineTo(1.2, 0.6)
  rWingShape.lineTo(1.5, 0.2)
  rWingShape.lineTo(1.2, -0.2)
  rWingShape.lineTo(0.4, -0.1)
  rWingShape.lineTo(0, 0)
  const rWing = new THREE.Mesh(new THREE.ShapeGeometry(rWingShape), wingMat)
  rWing.castShadow = true
  rightWing.add(rWing)
  rightWing.position.set(0.6, 1.5, -0.2)
  rightWing.rotation.y = 0.3
  group.add(rightWing)

  // Front claws/arms
  const leftClaw = new THREE.Group()
  const lClawArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6), bodyMat)
  lClawArm.position.y = -0.3
  leftClaw.add(lClawArm)
  for (let i = -1; i <= 1; i++) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.15, 4), clawMat)
    claw.position.set(i * 0.04, -0.65, 0)
    claw.rotation.x = 0.3
    leftClaw.add(claw)
  }
  leftClaw.position.set(-0.7, 1.1, 0.4)
  leftClaw.rotation.x = 0.5
  group.add(leftClaw)

  const rightClaw = new THREE.Group()
  const rClawArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.6, 6), bodyMat)
  rClawArm.position.y = -0.3
  rightClaw.add(rClawArm)
  for (let i = -1; i <= 1; i++) {
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.15, 4), clawMat)
    claw.position.set(i * 0.04, -0.65, 0)
    claw.rotation.x = 0.3
    rightClaw.add(claw)
  }
  rightClaw.position.set(0.7, 1.1, 0.4)
  rightClaw.rotation.x = 0.5
  group.add(rightClaw)

  // Hind legs
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.7, 6), bodyMat)
    leg.position.set(side * 0.4, 0.35, -0.3)
    leg.castShadow = true
    group.add(leg)
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), darkMat)
    paw.position.set(side * 0.4, 0, -0.25)
    paw.scale.set(1, 0.5, 1.3)
    group.add(paw)
  }

  // Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.02, 0.8, 6), bodyMat)
  tail.position.set(0, 0.9, -0.8)
  tail.rotation.x = 0.8
  tail.castShadow = true
  group.add(tail)

  group.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })

  return { group, headGroup, jaw, leftWing, rightWing, leftClaw, rightClaw, body, tail }
}

// ======================== INSTANTIATE ========================
const soldier = createSoldier()
soldier.group.position.set(-4, 0, 0)
scene.add(soldier.group)

const beast = createBeast()
beast.group.position.set(10, 0, 0)
scene.add(beast.group)

// ======================== WEAPONS ========================
const WEAPONS = [
  { name: '劍', dmg: 15, range: 2.8, cd: 0.3 },
  { name: '矛', dmg: 20, range: 4.0, cd: 0.5 },
  { name: '弓', dmg: 12, range: 12.0, cd: 0.6 }
]
let currentWeapon = 0
const weaponEl = document.getElementById('weapon-display')
function switchWeapon() {
  currentWeapon = (currentWeapon + 1) % WEAPONS.length
  weaponEl.textContent = '武器：' + WEAPONS[currentWeapon].name
  sndSwitch()
}

// Projectiles
const arrowGroup = new THREE.Group()
scene.add(arrowGroup)
const arrows = []

// ======================== PARTICLES ========================
const particleGroup = new THREE.Group()
scene.add(particleGroup)
const particles = []
function spawnParticles3D(x, y, z, color, count) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.06 + Math.random() * 0.04, 4, 4)
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    particleGroup.add(mesh)
    particles.push({ mesh, vx: (Math.random() - 0.5) * 5, vy: Math.random() * 4 + 1, vz: (Math.random() - 0.5) * 5, life: 0.4 + Math.random() * 0.3 })
  }
}

// ======================== GAME STATE ========================
const GROUND_Y = 0
const GRAVITY = -22
const JUMP_VEL = 9
const MOVE_SPD = 6
const BEAST_SPD = 4
const BEAST_DMG = 8
const BEAST_CHARGE_SPD = 8

const state = {
  px: -4, py: GROUND_Y, pvy: 0, php: 100, pmaxhp: 100,
  pFace: 1, attacking: false, atkTimer: 0, pHitCD: 0, atkCD: 0,
  bx: 10, by: GROUND_Y, bz: 0, bhp: 80, bmaxhp: 80,
  bFace: -1, bState: 'approach', bTimer: 0, bHitCD: 0, bChargeDir: 0,
  wave: 1, gameOver: false, started: false,
  shakeTimer: 0, shakeInt: 0, slowMo: 1
}

// ======================== INPUT ========================
const keys = {}
let switchPressed = false, atkPressed = false
window.addEventListener('keydown', e => {
  keys[e.code] = true
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault()
  if (actx && actx.state === 'suspended') actx.resume()
})
window.addEventListener('keyup', e => { keys[e.code] = false })

const mk = { left: false, right: false, jump: false, attack: false, weapon: false }
function setupBtn(id, key) {
  const el = document.getElementById(id)
  if (!el) return
  function on(e) { e.preventDefault(); e.stopPropagation(); mk[key] = true; el.classList.add('pressed') }
  function off(e) { if(e) e.preventDefault(); mk[key] = false; el.classList.remove('pressed') }
  el.addEventListener('touchstart', on, { passive: false })
  el.addEventListener('touchend', off, { passive: false })
  el.addEventListener('touchcancel', off, { passive: false })
  el.addEventListener('mousedown', on)
  el.addEventListener('mouseup', off)
  el.addEventListener('mouseleave', off)
}
setupBtn('btn-left', 'left'); setupBtn('btn-right', 'right')
setupBtn('btn-jump', 'jump'); setupBtn('btn-attack', 'attack'); setupBtn('btn-weapon', 'weapon')

function isDown(a) {
  switch (a) {
    case 'left': return keys['ArrowLeft'] || keys['KeyA'] || mk.left
    case 'right': return keys['ArrowRight'] || keys['KeyD'] || mk.right
    case 'jump': return keys['ArrowUp'] || keys['KeyW'] || mk.jump
    case 'attack': return keys['Space'] || keys['KeyJ'] || mk.attack
    case 'weapon': return keys['KeyQ'] || mk.weapon
  }
}

// ======================== UI ========================
const playerHPEl = document.getElementById('player-hp')
const beastHPEl = document.getElementById('beast-hp')
const waveEl = document.getElementById('wave-display')
const overlayEl = document.getElementById('overlay')
const overlayTitle = document.getElementById('overlay-title')
const overlaySub = document.getElementById('overlay-sub')
const menuEl = document.getElementById('menu')

function updateUI() {
  playerHPEl.style.width = Math.max(0, state.php / state.pmaxhp * 100) + '%'
  beastHPEl.style.width = Math.max(0, state.bhp / state.bmaxhp * 100) + '%'
  waveEl.textContent = '第 ' + state.wave + ' 波'
}

function showOverlay(t, s, w) {
  overlayEl.classList.add('show'); overlayTitle.textContent = t
  overlayTitle.className = w ? 'win' : 'lose'; overlaySub.textContent = s
}

window._startGame = function() {
  menuEl.classList.add('hidden'); state.started = true; resetState()
  try { getAudioCtx().resume() } catch(e) {}
}
window._backToMenu = function() {
  overlayEl.classList.remove('show'); menuEl.classList.remove('hidden')
  state.started = false; state.gameOver = false
}
window._restartGame = function() { overlayEl.classList.remove('show'); resetState() }

function resetState() {
  state.px = -4; state.py = GROUND_Y; state.pvy = 0; state.php = state.pmaxhp
  state.attacking = false; state.atkCD = 0
  state.bx = 10; state.by = GROUND_Y; state.bz = 0
  state.bmaxhp = 80; state.bhp = state.bmaxhp
  state.bState = 'approach'; state.bTimer = 0; state.wave = 1
  state.gameOver = false; state.shakeTimer = 0; state.slowMo = 1
  currentWeapon = 0; weaponEl.textContent = '武器：劍'
  for (const a of arrows) { arrowGroup.remove(a.mesh); a.mesh.geometry.dispose() }
  arrows.length = 0
  updateUI()
}

// ======================== GAME LOGIC ========================
function updatePlayer(dt) {
  if (state.gameOver || !state.started) return
  let mx = 0
  if (isDown('left')) mx -= 1
  if (isDown('right')) mx += 1
  state.px += mx * MOVE_SPD * dt
  state.px = Math.max(-11, Math.min(11, state.px))
  if (mx !== 0) state.pFace = mx > 0 ? 1 : -1

  if (isDown('jump') && state.py <= GROUND_Y + 0.05) state.pvy = JUMP_VEL
  state.pvy += GRAVITY * dt
  state.py += state.pvy * dt
  if (state.py < GROUND_Y) { state.py = GROUND_Y; state.pvy = 0 }

  if (isDown('weapon') && !switchPressed) { switchWeapon(); switchPressed = true }
  if (!isDown('weapon')) switchPressed = false

  if (state.atkCD > 0) state.atkCD -= dt

  const wp = WEAPONS[currentWeapon]
  if (isDown('attack') && !atkPressed && !state.attacking && state.atkCD <= 0) {
    state.attacking = true; state.atkTimer = 0.25; state.atkCD = wp.cd; atkPressed = true; sndAttack()
    if (currentWeapon === 2) {
      // Bow: spawn arrow
      const arrowGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 4)
      const arrowMat = new THREE.MeshStandardMaterial({ color: 0xccaa66 })
      const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat)
      arrowMesh.rotation.z = Math.PI / 2
      arrowMesh.position.set(state.px + state.pFace * 0.8, state.py + 1.5, 0)
      arrowGroup.add(arrowMesh)
      arrows.push({ mesh: arrowMesh, vx: state.pFace * 18, life: 2, dmg: wp.dmg + state.wave * 2 })
    } else {
      const dx = state.bx - state.px, dz = state.bz, dy = (state.by + 1.2) - (state.py + 1.2)
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
      if (dist < wp.range && state.bHitCD <= 0) {
        state.bhp -= (wp.dmg + state.wave * 2); state.bHitCD = 0.25; sndHit()
        spawnParticles3D(state.bx, state.by + 1.5, state.bz, 0xffcc00, 10)
        state.shakeTimer = 0.12; state.shakeInt = 0.08
        if (state.bhp <= 0) { spawnParticles3D(state.bx, state.by + 1.5, state.bz, 0xff4400, 20); state.slowMo = 0.2; setTimeout(() => { state.slowMo = 1 }, 600); nextWave() }
      }
    }
    spawnParticles3D(state.px + state.pFace * 1, state.py + 1.5, 0, 0xffffff, 4)
  }
  if (!isDown('attack')) atkPressed = false
  if (state.attacking) { state.atkTimer -= dt; if (state.atkTimer <= 0) state.attacking = false }
  if (state.pHitCD > 0) state.pHitCD -= dt
}

function updateArrows(dt) {
  for (let i = arrows.length - 1; i >= 0; i--) {
    const a = arrows[i]
    a.mesh.position.x += a.vx * dt; a.life -= dt
    if (state.bhp > 0) {
      const dx = a.mesh.position.x - state.bx, dy = a.mesh.position.y - (state.by + 1.2), dz = a.mesh.position.z - state.bz
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 1.5 && state.bHitCD <= 0) {
        state.bhp -= a.dmg; state.bHitCD = 0.25; sndHit()
        spawnParticles3D(state.bx, state.by + 1.5, state.bz, 0xffcc00, 8)
        state.shakeTimer = 0.1; state.shakeInt = 0.06
        if (state.bhp <= 0) { spawnParticles3D(state.bx, state.by + 1.5, state.bz, 0xff4400, 20); state.slowMo = 0.2; setTimeout(() => { state.slowMo = 1 }, 600); nextWave() }
        a.life = 0
      }
    }
    if (a.life <= 0 || Math.abs(a.mesh.position.x) > 20) { arrowGroup.remove(a.mesh); a.mesh.geometry.dispose(); arrows.splice(i, 1) }
  }
}

function updateBeast(dt) {
  if (state.gameOver || state.bhp <= 0 || !state.started) return
  state.bTimer -= dt
  if (state.bHitCD > 0) state.bHitCD -= dt
  const dx = state.px - state.bx, dist = Math.abs(dx)
  state.bFace = dx > 0 ? 1 : -1

  if (state.bState === 'approach') {
    state.bx += state.bFace * BEAST_SPD * dt
    state.by = GROUND_Y + Math.abs(Math.sin(performance.now() / 250)) * 0.4
    state.bz += (0 - state.bz) * 2 * dt
    if (dist < 5) { state.bState = 'windup'; state.bTimer = 0.4 + Math.random() * 0.3 }
  } else if (state.bState === 'windup') {
    state.bx += Math.sin(performance.now() / 25) * 0.03
    state.by = GROUND_Y + 0.2
    if (state.bTimer <= 0) { state.bState = 'charge'; state.bChargeDir = state.bFace; state.bTimer = 0.5 }
  } else if (state.bState === 'charge') {
    state.bx += state.bChargeDir * BEAST_CHARGE_SPD * (1 + state.wave * 0.1) * dt
    state.by = GROUND_Y + Math.abs(Math.sin(performance.now() / 80)) * 0.15
    const hDx = state.px - state.bx, hDy = (state.py + 1) - (state.by + 1), hDz = 0 - state.bz
    if (Math.sqrt(hDx * hDx + hDy * hDy + hDz * hDz) < 2 && state.pHitCD <= 0) {
      state.php -= BEAST_DMG + state.wave * 1.5; state.pHitCD = 0.7; sndBeastHit()
      spawnParticles3D(state.px, state.py + 1.5, 0, 0xff4444, 12)
      state.shakeTimer = 0.2; state.shakeInt = 0.15
      if (state.php <= 0) { state.php = 0; state.gameOver = true; showOverlay('戰敗', '你喺第 ' + state.wave + ' 波倒下了', false) }
    }
    if (state.bTimer <= 0) { state.bState = 'retreat'; state.bTimer = 0.8 }
  } else if (state.bState === 'retreat') {
    state.bx -= state.bChargeDir * BEAST_SPD * 0.5 * dt
    state.by = GROUND_Y + Math.abs(Math.sin(performance.now() / 200)) * 0.4
    state.bz += ((Math.random() - 0.5) * 3 - state.bz) * dt
    if (state.bTimer <= 0) state.bState = 'approach'
  }
  state.bx = Math.max(-12, Math.min(15, state.bx))
  state.bz = Math.max(-4, Math.min(4, state.bz))
}

function nextWave() {
  state.wave++; state.bmaxhp = 80 + state.wave * 18; state.bhp = state.bmaxhp
  state.bx = 14; state.by = GROUND_Y + 2; state.bz = (Math.random() - 0.5) * 4
  state.bState = 'approach'; state.bTimer = 0
  state.php = Math.min(state.pmaxhp, state.php + 25); sndWave(); updateUI()
}

function updateParticles3D(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.mesh.position.x += p.vx * dt; p.mesh.position.y += p.vy * dt; p.mesh.position.z += p.vz * dt
    p.vy -= 12 * dt; p.life -= dt
    p.mesh.material.opacity = Math.max(0, p.life / 0.5)
    if (p.life <= 0) { particleGroup.remove(p.mesh); p.mesh.geometry.dispose(); p.mesh.material.dispose(); particles.splice(i, 1) }
  }
}

// ======================== ANIMATION ========================
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const rawDt = clock.getDelta()
  const dt = Math.min(rawDt * state.slowMo, 0.05)
  const t = performance.now()

  updatePlayer(dt)
  updateBeast(dt)
  updateArrows(dt)
  updateParticles3D(dt)
  updateUI()

  // === SOLDIER ANIMATION ===
  soldier.group.position.set(state.px, state.py, 0)
  soldier.group.rotation.y = state.pFace > 0 ? 0 : Math.PI

  // Walk cycle
  const isMoving = isDown('left') || isDown('right')
  const walkT = isMoving ? Math.sin(t / 120) * 0.4 : 0
  soldier.leftLeg.rotation.x = walkT
  soldier.rightLeg.rotation.x = -walkT
  soldier.leftArm.rotation.x = -walkT * 0.3
  // Body bob
  soldier.group.position.y = state.py + (isMoving ? Math.abs(Math.sin(t / 120)) * 0.05 : 0)

  // Attack animation
  if (state.attacking) {
    const prog = Math.sin(state.atkTimer * 20) * 0.8
    soldier.spearGroup.rotation.x = -0.15 - prog
    soldier.spearGroup.position.z = 0.3 + prog * 0.5
    soldier.leftArm.rotation.x = -prog * 0.6
  } else {
    soldier.spearGroup.rotation.x += (-0.15 - soldier.spearGroup.rotation.x) * 0.1
    soldier.spearGroup.position.z += (0.3 - soldier.spearGroup.position.z) * 0.1
  }

  // Hit flash
  soldier.group.traverse(c => {
    if (c.isMesh && c.material.emissive) {
      c.material.emissive.setHex(state.pHitCD > 0.4 ? 0x881111 : 0x000000)
    }
  })

  // === BEAST ANIMATION ===
  beast.group.position.set(state.bx, state.by, state.bz)
  beast.group.rotation.y = state.bFace > 0 ? -Math.PI / 2 : Math.PI / 2
  beast.group.visible = state.bhp > 0

  // Idle bob
  const bBob = Math.sin(t / 300) * 0.15
  beast.body.position.y = 1.2 + bBob
  beast.headGroup.position.y = 1.9 + bBob

  // Wing flap
  const wingFlap = Math.sin(t / 150) * 0.4
  beast.leftWing.rotation.z = wingFlap - 0.2
  beast.rightWing.rotation.z = -wingFlap + 0.2

  // Jaw animation when charging
  if (state.bState === 'charge') {
    beast.jaw.rotation.x = Math.sin(t / 60) * 0.3
    beast.group.rotation.z = state.bChargeDir * -0.1
    beast.leftClaw.rotation.x = 0.5 + Math.sin(t / 80) * 0.3
    beast.rightClaw.rotation.x = 0.5 + Math.sin(t / 80 + 1) * 0.3
  } else if (state.bState === 'windup') {
    beast.jaw.rotation.x = Math.sin(t / 30) * 0.15
    beast.group.rotation.z = Math.sin(t / 30) * 0.05
  } else {
    beast.jaw.rotation.x *= 0.9
    beast.group.rotation.z *= 0.9
    beast.leftClaw.rotation.x += (0.5 - beast.leftClaw.rotation.x) * 0.05
    beast.rightClaw.rotation.x += (0.5 - beast.rightClaw.rotation.x) * 0.05
  }
  // Tail wag
  beast.tail.rotation.z = Math.sin(t / 200) * 0.3

  // Hit flash
  beast.group.traverse(c => {
    if (c.isMesh && c.material.emissive && c.material.emissiveIntensity < 1.5) {
      c.material.emissive.setHex(state.bHitCD > 0.12 ? 0x881111 : 0x000000)
    }
  })

  // === CAMERA ===
  const midX = (state.px + state.bx) * 0.5
  const camTargetX = midX * 0.4
  cameraTarget.set(camTargetX, 1.5, 0)
  cameraBasePos.set(camTargetX, 5.5, 13)

  if (state.shakeTimer > 0) {
    state.shakeTimer -= rawDt
    camera.position.set(
      cameraBasePos.x + (Math.random() - 0.5) * state.shakeInt,
      cameraBasePos.y + (Math.random() - 0.5) * state.shakeInt,
      cameraBasePos.z
    )
  } else {
    camera.position.lerp(cameraBasePos, 0.05)
  }
  camera.lookAt(cameraTarget)

  // Bounce light follows action
  bounceLight.position.set(midX, 0.5, 4)

  renderer.render(scene, camera)
}

animate()
