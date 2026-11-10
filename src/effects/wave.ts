import * as THREE from "three";

// A sparse folded surface, rather than a screen-wide particle pattern.
export function startWave(host: HTMLDivElement): () => void {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.z = 6;
  const uniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uDpr: { value: 1 },
    uPointer: { value: new THREE.Vector2(10, 10) },
    uHover: { value: 0 },
    uOrigins: { value: Array.from({ length: 3 }, () => new THREE.Vector2()) },
    uStarts: { value: [-100, -100, -100] },
  };
  const vertexShader = `
    uniform float uTime, uAspect, uDpr, uHover;
    uniform vec2 uPointer, uOrigins[3];
    uniform float uStarts[3];
    varying float vAlpha, vLight;
    void main() {
      float across = position.x;
      float row = position.y;
      float wx = across * uAspect;
      float phase = wx * 1.65 - uTime * .25;
      float fold = sin(phase + row * 1.5);
      vec2 p = vec2(wx, -.5 + sin(phase) * .38
        + smoothstep(-.2, 1.6, wx) * .62
        + row * (.32 + cos(phase) * .08));
      p.y += sin(wx * 2.6 + row * 2.2 + uTime * .32) * .1;
      p.x += cos(phase + row * 1.8) * .07;
      vec2 delta = p - uPointer;
      float distanceToPointer = length(delta);
      float hover = exp(-distanceToPointer * distanceToPointer * 7.) * uHover;
      p += delta / max(distanceToPointer, .001) * hover * .17;
      float light = hover * .8;
      for(int i = 0; i < 3; i++) {
        float age = uTime - uStarts[i];
        if(age >= 0. && age < 4.) {
          vec2 d = p - uOrigins[i];
          float distanceToOrigin = length(d);
          float ring = exp(-pow((distanceToOrigin - age * .65) / .11, 2.)) * exp(-age * .65);
          p.y += ring * .11;
          light += ring * 1.5;
        }
      }
      float edge = (1. - smoothstep(.7, 1.12, abs(across)))
        * (1. - smoothstep(.65, 1.05, abs(row)));
      float crest = pow(.5 + .5 * fold, 3.);
      vAlpha = edge * (.38 + crest * .5 + light * .65);
      vLight = crest * .6 + light;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, fold * .25, 1.);
      gl_PointSize = (4.6 + crest * 1.8 + min(light, 1.5) * 2.) * uDpr;
    }
  `;
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    fragmentShader: `
      varying float vAlpha, vLight;
      void main() {
        float radius = length(gl_PointCoord - .5);
        float soft = 1. - smoothstep(.12, .5, radius);
        vec3 colour = mix(vec3(.55,.32,1.), vec3(.95,.84,1.), clamp(vLight,0.,1.));
        gl_FragColor = vec4(colour, vAlpha * soft);
      }
    `,
  });
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms, vertexShader, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    fragmentShader: `
      varying float vAlpha, vLight;
      void main() { gl_FragColor = vec4(.65,.43,1., vAlpha * (.19 + min(vLight,1.) * .18)); }
    `,
  });
  let geometry = new THREE.BufferGeometry();
  let lineGeometry = new THREE.BufferGeometry();
  const points = new THREE.Points(geometry, material);
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  points.frustumCulled = lines.frustumCulled = false;
  scene.add(points, lines);
  let compact = false;
  let frame = 0;
  let last = 0;
  let disposed = false;
  let hovering = false;
  let rippleIndex = 0;
  const target = new THREE.Vector2(10, 10);
  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    compact = width < 768;
    const aspect = width / height;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    uniforms.uAspect.value = aspect;
    uniforms.uDpr.value = Math.min(window.devicePixelRatio, compact ? 1 : 1.5);
    renderer.setPixelRatio(uniforms.uDpr.value);
    renderer.setSize(width, height);
    const columns = compact ? 42 : 88;
    const rows = compact ? 10 : 16;
    const positions: number[] = [];
    const segments: number[] = [];
    for(let row = 0; row < rows; row++) {
      const y = row / (rows - 1) * 2 - 1;
      for(let col = 0; col < columns; col++) {
        const x = (col / (columns - 1) * 2 - 1) * 1.12;
        positions.push(x, y, 0);
        if(col < columns - 1 && row % 3 === 0)
          segments.push(x, y, 0, ((col + 1) / (columns - 1) * 2 - 1) * 1.12, y, 0);
      }
    }
    geometry.dispose();
    lineGeometry.dispose();
    geometry = new THREE.BufferGeometry();
    lineGeometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segments, 3));
    points.geometry = geometry;
    lines.geometry = lineGeometry;
  };
  const locate = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    target.set(((event.clientX - rect.left) / rect.width * 2 - 1) * uniforms.uAspect.value,
      1 - (event.clientY - rect.top) / rect.height * 2);
  };
  const move = (event: PointerEvent) => {
    if(event.pointerType === "touch") return;
    locate(event);
    hovering = true;
  };
  const leave = () => { hovering = false; };
  const press = (event: PointerEvent) => {
    if(event.button !== 0) return;
    locate(event);
    uniforms.uOrigins.value[rippleIndex].copy(target);
    uniforms.uStarts.value[rippleIndex] = uniforms.uTime.value;
    rippleIndex = (rippleIndex + 1) % 3;
  };
  const tick = (now: number) => {
    if(disposed || document.hidden) { frame = 0; return; }
    frame = requestAnimationFrame(tick);
    if(now - last < (compact ? 50 : 32)) return;
    const delta = Math.min((now - last) / 1000, .1);
    last = now;
    uniforms.uTime.value += delta;
    uniforms.uPointer.value.lerp(target, 1 - Math.exp(-delta * 8));
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hovering ? 1 : 0, 5, delta);
    renderer.render(scene, camera);
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    if(!document.hidden && !disposed) { last = performance.now(); frame = requestAnimationFrame(tick); }
  };
  const contextLost = (event: Event) => { event.preventDefault(); dispose(); };
  const dispose = () => {
    if(disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", press);
    window.removeEventListener("blur", leave);
    document.documentElement.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    renderer.domElement.removeEventListener("webglcontextlost", contextLost);
    geometry.dispose(); lineGeometry.dispose(); material.dispose(); lineMaterial.dispose();
    renderer.dispose(); renderer.domElement.remove();
  };
  try { resize(); host.appendChild(renderer.domElement); }
  catch(error) { dispose(); throw error; }
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", press, { passive: true });
  window.addEventListener("blur", leave);
  document.documentElement.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  visibility();
  return dispose;
}
