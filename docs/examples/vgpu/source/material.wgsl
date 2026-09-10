struct Params { progress: f32, aspect: f32, finish: f32 }
@group(0) @binding(0) var<uniform> params: Params;

fn rotate(p: vec2f, angle: f32) -> vec2f {
  let c = cos(angle); let s = sin(angle);
  return vec2f(c * p.x - s * p.y, s * p.x + c * p.y);
}

// A finite, thin sheet with a broad bend and smaller longitudinal pleats.
// The distance is conservative so the ray does not step through a steep fold.
fn sheet(point: vec3f) -> f32 {
  var p = point;
  p = vec3f(rotate(p.xy, -0.32 + params.progress * 0.12), p.z);
  let xz = rotate(p.xz, -0.36 + params.progress * 0.8);
  p = vec3f(xz.x, p.y, xz.y);
  let bend = 0.46 * sin(p.y * 2.6 + params.progress * 1.5);
  let pleat = (0.075 - params.progress * 0.025) * cos(p.x * 10.0 + p.y * 0.6);
  let q = abs(p.xy) - vec2f(0.82, 1.14) + 0.075;
  let edge = length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - 0.075;
  return max(edge, (abs(p.z - bend - pleat) - 0.012) / 2.2);
}

fn normalAt(p: vec3f) -> vec3f {
  let e = 0.0015;
  return normalize(vec3f(sheet(p + vec3f(e,0,0)) - sheet(p - vec3f(e,0,0)),
    sheet(p + vec3f(0,e,0)) - sheet(p - vec3f(0,e,0)),
    sheet(p + vec3f(0,0,e)) - sheet(p - vec3f(0,0,e))));
}

fn studio(direction: vec3f) -> vec3f {
  let sky = smoothstep(-0.3, 0.85, direction.y);
  var light = mix(vec3f(0.11,0.12,0.13), vec3f(0.77,0.81,0.85), sky);
  let softbox = exp(-pow(abs(direction.x + 0.48) * 5.5, 4.0)) * smoothstep(-0.5, 0.15, direction.y);
  let strip = exp(-pow(abs(direction.x - 0.57) * 16.0, 4.0));
  light += vec3f(1.0,0.98,0.94) * softbox * 1.7 + vec3f(0.86,0.91,1.0) * strip * 0.9;
  light *= 1.0 - 0.7 * exp(-pow(abs(direction.y - 0.12) * 12.0, 4.0));
  return light;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let screen = (uv - 0.5) * vec2f(params.aspect, 1.0);
  let ro = vec3f(0.0, 0.03, 5.0);
  // Preserve the whole sculpture on narrow screens, without a width cutoff.
  let zoom = mix(2.1, 3.0, smoothstep(0.7, 1.3, params.aspect));
  let rd = normalize(vec3f(screen.x * 2.0, -screen.y * 2.0, -zoom));
  var travel = 2.8;
  var hit = false;
  for (var i = 0; i < 64; i++) {
    let distance = sheet(ro + rd * travel);
    if (distance < 0.0012) { hit = true; break; }
    travel += max(distance * 0.85, 0.0005);
    if (travel > 7.0) { break; }
  }
  if (!hit) {
    let shadow = exp(-pow(screen.x * 5.3, 2.0) - pow((screen.y - 0.37) * 30.0, 2.0)) * 0.12;
    return vec4f(vec3f(0.0), shadow);
  }
  let p = ro + rd * travel;
  let surfaceNormal = normalAt(p);
  let n = faceForward(surfaceNormal, rd, surfaceNormal);
  let reflection = studio(reflect(rd, n));
  let fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
  var tint = vec3f(0.88,0.91,0.94);
  if (params.finish > 0.5 && params.finish < 1.5) { tint = vec3f(0.93,0.68,0.39); }
  if (params.finish > 1.5) { tint = vec3f(0.28,0.32,0.36); }
  let color = reflection * mix(tint, vec3f(1.0), fresnel * 0.6);
  return vec4f(pow(color / (color + 0.55), vec3f(0.85)), 1.0);
}
