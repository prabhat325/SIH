/**
 * RAAHI - Atmospheric WebGL Mist & Golden Shimmer Shader
 * Provides the ambient luxury visual backdrop for the hero section
 */

function initRaahiHeroShader(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  function syncSize() {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : (canvas.clientWidth || window.innerWidth);
    const h = parent ? parent.clientHeight : (canvas.clientHeight || 720);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(syncSize).observe(canvas.parentElement || canvas);
  }
  syncSize();

  const gl = canvas.getContext('webgl', { alpha: true, antialias: true }) || 
             canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported on this device, defaulting to CSS backdrop.');
    return;
  }

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = v_texCoord;
      
      // Multi-layered slow moving atmospheric mist
      float noise1 = sin(uv.x * 2.5 + u_time * 0.18) * cos(uv.y * 2.0 + u_time * 0.12);
      float noise2 = sin(uv.x * 4.2 - u_time * 0.08) * cos(uv.y * 3.5 + u_time * 0.22);
      float noise = (noise1 + noise2) * 0.5;
      
      // Interactive mouse subtle ripple
      vec2 normMouse = u_mouse / max(u_resolution, vec2(1.0));
      float distToMouse = distance(uv, normMouse);
      float mouseInfluence = smoothstep(0.4, 0.0, distToMouse) * 0.08;
      
      // Deep earthy green and warm ivory tones
      vec3 colorGreen = vec3(0.082, 0.258, 0.070); // #154212 (Primary Green)
      vec3 colorContainer = vec3(0.176, 0.353, 0.153); // #2D5A27
      vec3 colorIvory = vec3(0.980, 0.976, 0.960); // #FAF9F5
      
      vec3 baseGradient = mix(colorGreen, colorContainer, uv.y + noise * 0.06 + mouseInfluence);
      
      // Golden shimmer highlight
      float shimmerWave = pow(max(0.0, sin(uv.x * 8.0 + uv.y * 4.0 + u_time * 0.4)), 16.0);
      vec3 gold = vec3(0.914, 0.765, 0.286); // #e9c349 (Warm Gold)
      
      vec3 finalColor = mix(baseGradient, gold, shimmerWave * 0.15);
      
      gl_FragColor = vec4(finalColor, 0.45 + mouseInfluence * 0.5);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );

  const posLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLocation);
  gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouse = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1.0 - (e.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  let animationFrameId;
  function render(time) {
    if (typeof ResizeObserver === 'undefined') syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, time * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animationFrameId = requestAnimationFrame(render);
  }

  render(0);
}
