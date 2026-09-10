import { init, effect, surface, frame } from 'vgpu';
import shader from './material.wgsl';

export async function createStudy(canvas, onFailure) {
  const gpu = await init();
  try {
    const screen = surface(gpu, canvas, { dpr: [1, 1.5], alphaMode: 'premultiplied' });
    const material = effect(gpu, shader, { set: { params: { progress: 0, aspect: 1, finish: 0 } } });
    gpu.onError(error => onFailure(error));
    gpu.gpu.lost.then(info => { if (!gpu.disposed) onFailure(new Error(info.message || 'Device lost')); });
    return {
      draw(progress, finish = 0) {
        frame(gpu, current => {
          material.set({ params: { progress, finish, aspect: screen.size[0] / screen.size[1] } });
          current.pass(screen, material);
        });
      },
      dispose: () => gpu.dispose(),
    };
  } catch (error) { gpu.dispose(); throw error; }
}
