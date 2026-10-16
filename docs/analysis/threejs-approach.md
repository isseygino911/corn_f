# Three.js approach — glass-gem corn charm landing hero

Owner: three-scout · Researched 2026-10-14 · Versions verified with `npm view` that day.
Sources: context7 docs (drei ScrollControls / PerformanceMonitor / AdaptiveDpr, Lenis + GSAP integration), npm registry, 2026 pricing aggregators for photo-to-3D tools (re-check prices on vendor pages). Product facts come from `docs/analysis/products.md` (photo-curator).

**Product recap (drives every 3D decision):**
- Real dried glass-gem corn cob, 6–9 cm long, **resin-coated**, so kernels read as glossy, semi-translucent jade or opal.
- Multi-tone kernels per colorway. Peach and amber colorways have **radial starburst streaks** inside each kernel.
- Gold or silver **filigree cap** with a **lobster clasp** and a beaded strap. It is sold as a bag charm.
- There is also a **sphere variant**.
- **No husk.** Nothing in the scene may suggest one.

---

## TL;DR

- **Stack:** Vite + React 19 + `@react-three/fiber` + `@react-three/drei`. **GSAP ScrollTrigger + Lenis** drive scroll. Do not use drei `ScrollControls`.
- **Model:** a **procedural** cob, about 280 instanced rondelle kernels. It gets a lathe-built filigree cap with an instanced jump ring and a clasp, and a beaded strap. The same kernels can re-lay themselves onto a sphere for the sphere variant. A **GLB slot** stays open in case a photoreal clasp or scan is wanted later.
- **Look:** resin kernels use `MeshPhysicalMaterial` with clearcoat, slight transmission/thickness and per-instance colour, with an optional **starburst shader**. The metal cap is a gold or silver physical material. Lighting is a `<Lightformer>` studio environment with ACES/AgX tone mapping.
- **Perf:** DPR capped at [1, 1.75], the cob is one kernel draw call, transmission and bloom run only on high tier, and a static poster is shown when WebGL is missing or reduced motion is set.

---

## 1. Stack: R3F vs vanilla Three.js

| | Vite + React + R3F/drei | Vite + vanilla Three.js |
|---|---|---|
| Fit with later shop/checkout | **Same React app.** The hero is one lazy-loaded `<Hero3D/>`. The colorway picker, cart and Stripe UI share components and state. The same `<Charm colorway=…/>` component can power a 3D product viewer on PDPs. | You need a second framework for the shop, or the hero becomes a bolted-on island. |
| Bundle | three is the bulk either way (~150–180 KB gz, tree-shaken). R3F adds about 40 KB gz. drei is tree-shakeable. | Smallest: three only. |
| Runtime perf | Same render loop. R3F overhead is negligible if you mutate refs in `useFrame` and never set React state per frame. | Equal. |
| Dev speed | High: drei gives `Environment`, `Lightformer`, `useGLTF`, `PerformanceMonitor`, `AdaptiveDpr`, `useProgress`, `ContactShadows`. | You hand-roll each of these. |
| Risk | Version coupling: drei 10 needs R3F 9 and React 19. | Fewer moving parts. |

**Recommendation: R3F + drei.** The user's default is React and the shop will be React. Code-split the canvas with `React.lazy` so non-hero routes never download three. Ship it as a static Vite build served by Caddy (or by Express) on the existing PM2 + Caddy VPS. No SSR is needed.

## 2. Getting the charm in 3D

### (a) Procedural (recommended for v1)

| Part | Build | Notes |
|---|---|---|
| Cob core | `LatheGeometry`, ~12-pt tapered spindle profile | Mostly hidden. Dark, dull material so gaps between kernels read as depth. |
| Kernels | **One `InstancedMesh`, about 280 instances** (e.g. 14 rows × 20) | Rondelle/cushion shape: a squashed sphere or rounded box with ~200–400 tris, bulging outward, slightly faceted. 280 × 300 ≈ 85k tris, still one draw call. |
| Filigree cap | `LatheGeometry` dome/crown profile at the top end | Filigree is a small tileable **alpha + normal map**, generated or hand-drawn (~50–100 KB WebP), with `alphaTest` so the openwork lets kernels show through. One material swaps gold ↔ silver. |
| Jump ring | `TorusGeometry` | Metal material. |
| Lobster clasp | A simplified body (`CapsuleGeometry` bent via a lathe profile) + `TorusGeometry` ring + tiny lever box | This is the hardest part to make convincing procedurally. If it looks toy-like, swap in a **tiny GLB** (stock or commissioned, under 100 KB with meshopt). |
| Beaded strap | `InstancedMesh` of spheres along a `CatmullRomCurve3` | Mostly cropped out of frame. It sways with the pendulum. |
| Sphere variant | The same kernel `InstancedMesh`, with targets on a **Fibonacci sphere** | See §5. Enables a cob → sphere morph beat. |

- **Pros:** about 0 KB of mesh assets, and colorways are pure data. Kernels can animate individually (explode, morph, colour shift). Mobile perf is excellent.
- **Cons:** it needs art-direction time (~2–3 days) to match the resin-gem look in the photos, especially the starburst and the clasp.

### (b) GLB model
- **Photogrammetry** (Polycam: free tier, Basic about $30/mo). Glossy resin is **the worst case for photogrammetry**: speculars and translucency break feature matching. A scan needs a matte scanning spray, which ruins the look, so you would re-texture anyway. Not recommended for the kernels.
- **AI image-to-3D** (Meshy Pro about $20/mo, Tripo about $12–20/mo). Rows of kernels and the filigree come out mushy. Fine as a reference, not as the hero.
- **Commissioned Blender model** (about $150–600). This is the realistic photoreal route if the user wants it later. Even then, keep kernels as instances so colorways stay data-driven, and use a GLB only for the cap and clasp.

### (c) 2.5D photo tricks
- Background-removed product photo on a plane, with an optional depth-map parallax shader. It is exact to the product but breaks beyond about 15° of rotation.
- **Use for:** shop grid cards, colorway swatches and the **fallback poster**.

**Recommendation:** procedural hero, with a `<Charm/>` component taking `{ shape: 'cob' | 'sphere', colorway, metal: 'gold' | 'silver' }`. Keep a GLB slot for the clasp only. Use photos for the cards and the fallback.

## 3. Materials, look, scroll, loader

### Resin kernel material
```
MeshPhysicalMaterial({
  vertexColors / instanceColor  → per-kernel colour from the colorway palette
  roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05,   // resin coat
  transmission: 0.25–0.4, thickness: 0.35, ior: 1.5,          // jade/opal translucency
  attenuationColor: colorway.deep, attenuationDistance: 0.6,
  sheen: 0, metalness: 0,
  iridescence: 0.1–0.2 (optional, opal shimmer)
})
```
- `instanceColor` only tints the base colour, while `attenuationColor` is one value per material. To make the translucency follow each kernel's colour, inject `vInstanceColor` into the attenuation via `onBeforeCompile`. Alternatively, accept a single per-colorway attenuation colour, which is usually good enough.
- **Transmission cost:** it adds an extra render of the opaque scene to a texture. Keep it on **high tier only**. On mid/low tier, set `transmission: 0` and fake translucency with a Fresnel-weighted emissive rim plus a slightly lighter centre (a few lines in `onBeforeCompile`).

### Optional starburst shader (peach and amber colorways)
Inject this via `onBeforeCompile` into the kernel material's `diffuseColor`.
- **Vertex:** pass the kernel-local position (before `instanceMatrix`) as `vLocal`, plus per-instance `aRand`.
- **Fragment:**
  ```
  vec2 p = vLocal.xy / kernelRadius;            // kernel front face plane
  float r = length(p), a = atan(p.y, p.x);
  float rays = pow(abs(sin(a * (7.0 + floor(aRand*5.0)) + aRand*6.28)), 12.0);
  float burst = rays * smoothstep(1.0, 0.15, r) * uStarburst;     // fades toward rim
  diffuseColor.rgb = mix(diffuseColor.rgb, uStreakColor, burst);
  // optional: emissive += burst * 0.15 so streaks glow under transmission
  ```
- `uStarburst` is 0 for colorways without streaks. It can also be a scroll-driven reveal during the macro beat.

### Filigree cap / clasp metal
- **Gold:** `MeshPhysicalMaterial({ metalness: 1, roughness: 0.22, color: '#d8b25a' })`.
- **Silver:** `{ color: '#cfd3d8', roughness: 0.18 }`.
- Add `normalMap` plus `alphaMap` for the filigree, with `alphaTest: 0.5` and `side: DoubleSide`.
- Metals need an environment to look like metal, so the Lightformers below are essential.

### Lighting / renderer
- **Renderer:** `toneMapping: ACESFilmic` (or `AgX`), sRGB output, exposure about 1.1.
- **Environment:** drei `<Environment resolution={256}>` with `<Lightformer>` panels: warm rect key, cool rim strip (gives the long specular streak along the resin) and a soft top. This needs **no network fetch**. drei `preset=…` downloads HDRs from a third-party CDN, so if you want an HDR, self-host a 1K Poly Haven (CC0) file.
- **Extras:** one warm `DirectionalLight` for crisp kernel glints. `<ContactShadows frames={1}>` for a baked shadow, if the charm is shown resting.
- **Bloom (optional):** `@react-three/postprocessing` `<Bloom mipmapBlur luminanceThreshold={0.9} intensity={0.4}/>` catches clearcoat glints. High tier only.

### Scroll-driven animation
- **Use GSAP ScrollTrigger + Lenis, not drei `ScrollControls`.** `ScrollControls` adds its own scroll container over the canvas. That fights native scroll, the later shop sections, anchors, accessibility and SEO. With this pattern, the canvas is `position: fixed` behind normal DOM sections.
- **Wiring** (from the Lenis docs):
  - `<ReactLenis root options={{ autoRaf: false }} ref={lenisRef}/>`
  - `gsap.ticker.add(t => lenis.raf(t * 1000))`
  - `lenis.on('scroll', ScrollTrigger.update)`
  - `gsap.ticker.lagSmoothing(0)`
- **Timeline:** one master `gsap.timeline({ scrollTrigger: { trigger: '#story', start: 'top top', end: 'bottom bottom', scrub: 1 } })`. It tweens a **plain JS state object** `{ camPos, camTarget, swing, capRotY, spread, colorMix, starburst, sphereMix }`. `useFrame` damps the uniforms and transforms toward it, and React never re-renders per frame. Use `useGSAP()` from `@gsap/react` for cleanup. GSAP and ScrollTrigger are free under the standard license.

**Scroll beats (husk-free):**

| # | Section | 3D action | Driven by |
|---|---|---|---|
| 1 | Hero | Charm hangs from the clasp with a gentle pendulum sway (pivot at the jump ring) and a slow idle turn. Glints sweep across the resin. | idle time + pointer |
| 2 | "Real corn, sealed in resin" | Camera dives macro along the kernel rows. Translucency and the starburst fade in (`uStarburst` 0→1). | `camPos`, `starburst` |
| 3 | "Every kernel unique" | **Kernel explode/reassemble.** Kernels drift outward along their normals with slight rotation, hang as a constellation of gems, then snap back. | `spread` uniform (vertex shader) |
| 4 | Colorways | **Colorway morph.** Kernels cross-fade from one palette to the next in a wave running up the cob (`smoothstep(t-0.1, t+0.1, kernelY)`). Swatches in the DOM sync to it. | `colorMix`, palette index |
| 5 | Craftsmanship | **Cap rotation** and close-up on the filigree. The cap turns about 180° and the clasp lever catches the key light. Gold ↔ silver swap on a click. | `capRotY`, camera |
| 6 | Sphere variant | **Cob → sphere morph.** Each kernel lerps from its cob slot to its Fibonacci-sphere slot, and the cap repositions. | `sphereMix` |
| 7 | CTA / shop | Charm settles to one side, and the shop grid scrolls in over it. | camera |

### Mouse parallax
- The pointer (-1..1) adds `±0.15 rad` to the charm's yaw and tilts the pendulum. This reads as the charm being nudged. Damp it with `THREE.MathUtils.damp`.
- Touch devices: off, or `DeviceOrientation` only after a user gesture.

### Loader
- The procedural scene only waits on shader compilation and the small filigree texture. A short branded intro (wordmark plus a thin progress line from drei `useProgress()`) covers it, then fades out with GSAP.
- The DOM hero text renders immediately, so LCP never waits on WebGL. Call `gl.compile(scene, camera)` behind the intro to avoid a first-frame stutter from the physical-material shaders.

## 4. Performance & mobile

- **DPR:** `<Canvas dpr={[1, 1.75]}>` (mobile `[1, 1.5]`) plus `<PerformanceMonitor onDecline/onIncline>` to step DPR and tier. Optionally `<AdaptiveDpr/>`.
- **Instancing:**
  - About 280 kernels is one draw call and ~85k tris.
  - About 300 instanced strap beads is one more.
  - The whole scene is roughly 6–8 draw calls.
  - Animate the explode/colour/sphere effects **in the vertex/fragment shader** with uniforms and per-instance attributes (`aDir`, `aRand`, `aColorA`, `aColorB`, `aSpherePos`). Never rewrite 280 matrices on the CPU per frame.
- **Transmission** is the main GPU cost, so use it on high tier only. Bloom is high tier only.
- **Pause** rendering when the hero is off-screen (`frameloop="demand"` + ScrollTrigger `onLeave`, or `IntersectionObserver`) and on `visibilitychange`.
- **Tiers:**

  | Tier | Settings |
  |---|---|
  | High | Transmission + bloom + starburst, DPR 1.75. |
  | Mid | No transmission (Fresnel fake), no bloom, starburst on, DPR 1.25. |
  | Low or no WebGL | **Static poster**: a hero render or the curated product photo, plus CSS parallax. |

  Detect with a WebGL2 check plus `PerformanceMonitor`. drei already bundles `detect-gpu` for an up-front guess.
- **`prefers-reduced-motion: reduce`:**
  - No Lenis (native scroll), no scrub, no sway or idle spin, no parallax.
  - Beats become discrete states that crossfade at section boundaries, or show the poster.
  - The colorway picker still works on click.
- **Bundle hygiene:**
  - `React.lazy(() => import('./Hero3D'))` and named drei imports.
  - In `manualChunks`, give three its own long-cache chunk.
  - Caddy: `encode zstd gzip` plus immutable cache on `/assets/*`.

## 5. Sketch: scene graph & kernel math (pseudo-code)

```
<App>                                       // DOM sections: #hero #resin #unique #colorways #craft #sphere #shop
  <ReactLenis root autoRaf=false/>
  <Suspense fallback={<Poster/>}>
    <Canvas fixed dpr=[1,1.75] gl={{toneMapping: ACES}} camera={{fov:30}}>
      <PerformanceMonitor/>
      <Environment resolution=256> <Lightformer key warm/> <Lightformer rim strip/> <Lightformer top/> </Environment>
      <directionalLight warm/>
      <ScrollRig state=sceneState>          // useFrame: damp camera + uniforms toward sceneState
        <ParallaxGroup>                     // pointer yaw/tilt
          <Pendulum pivot=[jumpRing]>       // swing angle (idle + pointer)
            <Strap instancedMesh beads curve/>
            <Charm shape colorway metal>
              <group cap rotationY=capRotY>
                <mesh lathe filigreeCap material=metal(alphaMap,normalMap)/>
                <mesh torus jumpRing/>
                <Clasp/>                    // procedural or tiny GLB
              </group>
              <mesh lathe core dark/>        // fades out as sphereMix→1
              <instancedMesh kernels count=280 material=resin(+starburst, +explode, +morph)/>
            </Charm>
          </Pendulum>
        </ParallaxGroup>
      </ScrollRig>
      {tier==='high' && <EffectComposer><Bloom/></EffectComposer>}
    </Canvas>
  </Suspense>
</App>
useGSAP: scrubbed timeline tweens sceneState {camPos, camTarget, starburst, spread, colorMix, capRotY, sphereMix}
```

**Kernel placement on the cob (staggered rows, real glass-gem corn has 12–16 rows):**
```
H = cob length (scene units ≈ 7.5 cm scaled), ROWS = 14, PER_ROW = 20  → 280
radius(t) = R * (0.8 + 0.2*sin(pi*clamp(t*1.15,0,1)))       // t∈[0,1] cap→tip, tapers at tip
k = 0
for i in 0..PER_ROW-1:                       // along axis
  t = i/(PER_ROW-1); y = (t-0.5)*H; r = radius(t)
  for j in 0..ROWS-1:                        // around axis
    θ = 2π*j/ROWS + (i odd ? π/ROWS : 0) + rand(k)*0.05      // stagger + jitter
    pos = (r cosθ, y, r sinθ)
    n   = normalize(cosθ, -dr/dy, sinθ)                      // outward, follows taper
    q   = fromUnitVectors(+Z, n) * rotZ(rand(k)*0.3)         // face outward, small twist
    w   = 2π r / ROWS * 0.92                                  // rondelle fills its slot
    s   = (w, H/PER_ROW*0.92, w*0.55) * lerp(1, 0.65, smoothstep(0.85,1,t))
    setMatrixAt(k, compose(pos,q,s))
    aColorA[k] = paletteA[weighted(rand(k))]; aColorB[k] = paletteB[...]   // colorway morph pair
    aDir[k] = n; aRand[k] = rand(k)
    aSpherePos[k] = fibSphere(k, 280) * Rs                    // sphere-variant target
    k++
```
**Sphere variant (Fibonacci sphere / phyllotaxis):**
```
fibSphere(k, N): y = 1 - 2(k+0.5)/N; r = sqrt(1-y²); φ = k * 2.39996323 (golden angle, rad)
                 return (r cosφ, y, r sinφ)            // normal = same vector
```
Use 280 kernels for both shapes, so the morph is a 1:1 lerp. If the real sphere product has a different count, scale the kernels or hide extras with `scale → 0`.

**Vertex-shader morph and explode (per instance):**
```
vec3 cobPos   = instanceMatrix[3].xyz;
vec3 target   = mix(cobPos, aSpherePos, uSphereMix);
vec3 offset   = aDir * uSpread * (0.6 + aRand) + curlNoise(aRand) * uSpread * 0.3;
// rebuild the instance transform with translation = target + offset, plus extra spin ∝ uSpread*aRand
// colour: vColor = mix(aColorA, aColorB, smoothstep(uColorMix-0.1, uColorMix+0.1, normalizedY))
```

## Recommended dependencies (need user approval; versions current on 2026-10-14)

| Package | Version | Why |
|---|---|---|
| react / react-dom | 19.3.0 | UI, and the shop later |
| vite | 8.3.4 (dev) | build/dev server |
| @vitejs/plugin-react | 6.1.2 (dev) | JSX/HMR |
| three | 0.186.1 | renderer |
| @react-three/fiber | 9.8.1 | React renderer for three (needs React 19) |
| @react-three/drei | 10.7.9 | Environment, Lightformer, PerformanceMonitor, AdaptiveDpr, useProgress, ContactShadows, useGLTF |
| gsap | 3.15.0 | ScrollTrigger timeline (free standard license) |
| @gsap/react | 2.1.2 | `useGSAP` cleanup hook |
| lenis | 1.3.26 | smooth scroll (`lenis/react`) |
| *optional* @react-three/postprocessing | 3.2.0 | Bloom, needs R3F ≥ 9.7 |
| *optional* postprocessing | 6.39.5 | peer of the above |

There is no modelling dependency. `@gltf-transform/cli` / `gltfjsx` are run once via `npx` only if a clasp GLB is used.
Minimal-dependency variant: drop GSAP and drive progress from `lenis.on('scroll', ({progress}) => …)` with hand-written section ranges. That saves 2 deps but loses timeline ergonomics.
