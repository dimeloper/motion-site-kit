struct Params { progress: f32, aspect: f32 }
@group(0) @binding(0) var<uniform> params: Params;

fn roundedBox(p: vec2f, b: vec2f, r: f32) -> f32 {
  let q = abs(p) - b + r;
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - r;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let t = clamp(params.progress, 0.0, 1.0);
  let p = (uv - 0.5) * vec2f(params.aspect, 1.0) * 2.15;
  let bend = 0.17 * sin(p.y * 4.2 + t * 3.14159);
  let x = p.x - bend;
  let silhouette = roundedBox(vec2f(x, p.y), vec2f(0.38 + 0.06 * t, 0.75), 0.055);
  let mask = 1.0 - smoothstep(-0.002, 0.003, silhouette);
  let phase = x * (20.0 - 7.0 * t) + p.y * 2.8 - t * 3.0;
  let amplitude = 0.14 - t * 0.08;
  let normal = normalize(vec3f(-amplitude * (20.0 - 7.0 * t) * cos(phase),
    -amplitude * 2.8 * cos(phase), 1.0));
  let key = normalize(vec3f(-0.5, -0.07, 1.0));
  let fill = normalize(vec3f(0.8, 0.11, 0.65));
  let diffuse = max(dot(normal, key), 0.0);
  let gloss = pow(max(dot(normal, key), 0.0), 42.0);
  let edgeLight = pow(max(dot(normal, fill), 0.0), 18.0);
  let metal = mix(vec3f(0.34, 0.38, 0.41), vec3f(0.64, 0.49, 0.29), t * 0.75);
  let material = metal * (0.17 + diffuse * 0.7) + vec3f(0.83, 0.88, 0.92) * gloss * 0.85
    + vec3f(0.64, 0.74, 0.81) * edgeLight * 0.35;
  let backdrop = vec3f(0.045, 0.058, 0.065) + (1.0 - length(p * 0.48)) * 0.018;
  let shadow = exp(-max(roundedBox(p - vec2f(0.11, -0.05), vec2f(0.39, 0.73), 0.1), 0.0) * 12.0);
  let color = mix(backdrop * (1.0 - 0.55 * shadow), material, mask);
  return vec4f(color, 1.0);
}
