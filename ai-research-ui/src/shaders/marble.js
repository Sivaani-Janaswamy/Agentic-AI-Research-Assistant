export const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

// Simple procedural noise
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 uv = vUv * 3.0;
  float n = noise(uv + uTime * 0.1);

  // Neon green glow
  float glow = smoothstep(0.4, 0.8, sin(n * 6.2831 + uTime * 0.5));
  vec3 col = mix(vec3(0.01, 0.01, 0.02), vec3(0.64, 0.78, 0.22), glow); // dark bg to neon green
  gl_FragColor = vec4(col, 1.0);
}
`;