import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

const RIPPLE_COUNT = 5;

// Coordinates stay in the camera's world space at every aspect ratio.
// The field reacts to input without intercepting the page's own controls.
export function startField(host: HTMLDivElement): () => void {
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.z = 6;
  let geometry = new THREE.BufferGeometry();
  const uniforms = {
    uTime: { value: 0 },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(10, 10) },
    uHover: { value: 0 },
    uPixelRatio: { value: 1 },
    uOrigins: {
      value: Array.from({ length: RIPPLE_COUNT }, () => new THREE.Vector2()),
    },
    uStarts: { value: Array.from({ length: RIPPLE_COUNT }, () => -100) },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uViewport;
      uniform vec2 uPointer;
      uniform float uHover;
      uniform float uPixelRatio;
      uniform vec2 uOrigins[5];
      uniform float uStarts[5];
      attribute float aSeed;
      varying float vAlpha;
      varying float vLight;

      void main() {
        vec2 p = position.xy * uViewport;
        float drift = sin(p.x * 2.1 + uTime * .38) * cos(p.y * 2.4 - uTime * .24);
        p.y += drift * .045;
        p.x += sin(p.y * 3.1 + uTime * .3) * .025;

        vec2 delta = p - uPointer;
        float distanceToPointer = length(delta);
        vec2 direction = delta / max(distanceToPointer, .001);
        float hover = exp(-distanceToPointer * distanceToPointer * 5.) * uHover;
        p += direction * hover * .1;
        p += vec2(-direction.y, direction.x) * sin(uTime * .9 + distanceToPointer * 9.) * hover * .05;

        float light = hover * .65;
        for (int i = 0; i < 5; i++) {
          float age = uTime - uStarts[i];
          if (age >= 0. && age < 5.) {
            vec2 rippleDelta = p - uOrigins[i];
            float distanceToOrigin = length(rippleDelta);
            float radius = age * .75;
            float ring = exp(-pow((distanceToOrigin - radius) / .1, 2.)) * exp(-age * .55);
            p += rippleDelta / max(distanceToOrigin, .001) * ring * .065;
            light += ring * 1.4;
          }
        }

        // A moving ribbon makes the field visible even before interaction.
        float ribbonY = sin(p.x * 1.8 + uTime * .3) * .42
                      + cos(p.x * .9 - uTime * .21) * .18;
        float ribbon = exp(-pow((p.y - ribbonY) / .28, 2.));
        float shimmer = .5 + .5 * sin(uTime * .6 + aSeed * 6.283 + p.x * .8);
        float edge = mix(.48, 1., 1. - smoothstep(.5, 1.42, length(position.xy * vec2(.7, 1.))));
        vAlpha = (.34 + shimmer * .2 + ribbon * .36 + light * .65) * edge;
        vLight = light + ribbon * .42;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0., 1.);
        gl_PointSize = (2.7 + shimmer * .65 + ribbon * .9 + min(light, 1.5) * 2.) * uPixelRatio;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      varying float vLight;
      void main() {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        float glow = 1. - smoothstep(.2, .5, d);
        vec3 lavender = vec3(.76, .58, .98);
        vec3 highlight = vec3(1., .9, 1.);
        gl_FragColor = vec4(mix(lavender, highlight, clamp(vLight, 0., 1.)), min(vAlpha, .95) * glow);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);
  let composer: EffectComposer | undefined;
  let compact = false;
  let columns = 0;
  let rows = 0;
  const target = new THREE.Vector2(10, 10);
  let hovering = false;
  let rippleIndex = 0;
  let frame = 0;
  let last = 0;
  let disposed = false;

  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    compact = width < 768;
    const aspect = width / height;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
    uniforms.uViewport.value.set(aspect, 1);
    const pixelRatio = Math.min(window.devicePixelRatio, compact ? 1 : 1.5);
    uniforms.uPixelRatio.value = pixelRatio;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);

    const nextColumns = Math.max(
      14,
      Math.min(120, Math.round(width / (compact ? 21 : 18))),
    );
    const nextRows = Math.max(14, Math.min(85, Math.round(height / 18)));
    if (nextColumns !== columns || nextRows !== rows) {
      columns = nextColumns;
      rows = nextRows;
      const positions = new Float32Array(columns * rows * 3);
      const seeds = new Float32Array(columns * rows);
      for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
          const index = x * rows + y;
          positions[index * 3] = (x / (columns - 1) - 0.5) * 2.12;
          positions[index * 3 + 1] = (y / (rows - 1) - 0.5) * 2.12;
          seeds[index] = ((x * 37 + y * 91) % 113) / 113;
        }
      }
      geometry.dispose();
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      points.geometry = geometry;
    }

    if (compact && composer) {
      composer.dispose();
      composer = undefined;
    } else if (!compact && !composer) {
      try {
        composer = new EffectComposer(renderer, {
          frameBufferType: THREE.HalfFloatType,
        });
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new EffectPass(
            camera,
            new BloomEffect({
              intensity: 0.9,
              luminanceThreshold: 0.3,
              mipmapBlur: true,
            }),
          ),
        );
      } catch {
        composer?.dispose();
        composer = undefined;
      }
    }
    composer?.setSize(width, height);
  };

  const positionFromEvent = (event: PointerEvent) => {
    const bounds = host.getBoundingClientRect();
    target.set(
      (((event.clientX - bounds.left) / bounds.width) * 2 - 1) *
        uniforms.uViewport.value.x,
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    );
  };
  const move = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    positionFromEvent(event);
    hovering = true;
  };
  const leave = () => {
    hovering = false;
  };
  const click = (event: PointerEvent) => {
    if (event.button !== 0) return;
    positionFromEvent(event);
    uniforms.uOrigins.value[rippleIndex].copy(target);
    uniforms.uStarts.value[rippleIndex] = uniforms.uTime.value;
    rippleIndex = (rippleIndex + 1) % RIPPLE_COUNT;
  };

  const tick = (now: number) => {
    if (disposed || document.hidden) {
      frame = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
    if (now - last < (compact ? 40 : 30)) return;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    uniforms.uTime.value += delta;
    uniforms.uPointer.value.lerp(target, 1 - Math.exp(-delta * 9));
    uniforms.uHover.value = THREE.MathUtils.damp(
      uniforms.uHover.value,
      hovering ? 1 : 0,
      5,
      delta,
    );
    if (composer) composer.render(delta);
    else {
      // EffectComposer disables autoClear. Clear explicitly when switching
      // back to the lighter renderer so resize does not leave ghost frames.
      renderer.clear();
      renderer.render(scene, camera);
    }
  };
  const visibility = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  try {
    resize();
    host.appendChild(renderer.domElement);
  } catch (error) {
    geometry.dispose();
    material.dispose();
    composer?.dispose();
    renderer.dispose();
    throw error;
  }
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerdown", click, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  window.addEventListener("blur", leave);
  document.addEventListener("visibilitychange", visibility);
  visibility();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerdown", click);
    document.documentElement.removeEventListener("pointerleave", leave);
    window.removeEventListener("blur", leave);
    document.removeEventListener("visibilitychange", visibility);
    geometry.dispose();
    material.dispose();
    composer?.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
