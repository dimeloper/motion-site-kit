"""Run extract, optimize and the budget gate end to end on a tiny synthetic clip.

Skips when ffmpeg or Pillow is unavailable so a fresh clone stays green. CI sets
REQUIRE_PIPELINE=1, which turns those skips into failures.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1] / 'skills/motion-website/scripts'
REQUIRED = os.environ.get('REQUIRE_PIPELINE') == '1'


def missing_dependency():
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        return 'ffmpeg and ffprobe must be on PATH'
    probe = subprocess.run([sys.executable, '-c', 'import PIL.features as f; print(f.check("avif"), f.check("webp"))'],
                           capture_output=True, text=True)
    if probe.returncode != 0:
        return 'Pillow is not installed for this interpreter'
    return None


MISSING = missing_dependency()


def run(script, *args):
    return subprocess.run([sys.executable, str(SCRIPTS / script), *map(str, args)], capture_output=True, text=True)


@unittest.skipIf(MISSING and not REQUIRED, MISSING or '')
class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if MISSING:
            raise AssertionError(f'REQUIRE_PIPELINE=1 but {MISSING}')
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.clip = cls.root / 'clip.mp4'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi',
                        '-i', 'testsrc2=size=480x270:rate=30:duration=2', '-pix_fmt', 'yuv420p', str(cls.clip)],
                       check=True)
        avif = subprocess.run([sys.executable, '-c', 'import PIL.features as f; print(f.check("avif"))'],
                              capture_output=True, text=True).stdout.strip() == 'True'
        cls.formats = ['avif', 'webp'] if avif else ['webp']
        cls.config = cls.root / 'motion.config.json'
        # 640 is wider than the 480px source, so optimize must drop it.
        cls.config.write_text(json.dumps({
            'frames': {'widths': [240, 360, 640]},
            'formats': cls.formats,
            'budget': {'frameCountMin': 2, 'phoneRungWidth': 360},
        }))

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def build(self, count):
        raw, frames = self.root / 'raw', self.root / 'frames'
        result = run('extract_frames.py', self.clip, '--out', raw, '--count', count, '--width', 480)
        self.assertEqual(result.returncode, 0, result.stderr)
        result = run('optimize_frames.py', raw, '--out', frames, '--config', self.config, '--jobs', 2)
        self.assertEqual(result.returncode, 0, result.stderr)
        return raw, frames, result

    def gate(self, frames):
        return run('check_budget.py', '--config', self.config, '--frames', frames, '--strict')

    def test_a_first_build_passes_with_posters_and_no_upscaled_rung(self):
        _, frames, result = self.build(60)
        self.assertIn('skipping rungs [640]', result.stderr)
        manifest = json.loads((frames / 'manifest.json').read_text())
        self.assertEqual(manifest['count'], 60)
        self.assertEqual(manifest['widths'], [240, 360])
        self.assertEqual(manifest['poster']['frame'], round(59 * 0.33))
        for width, name in manifest['poster']['files'].items():
            self.assertTrue((frames / name).is_file(), name)
        self.assertEqual(len(list((frames / '240' / self.formats[0]).iterdir())), 60)
        gate = self.gate(frames)
        self.assertEqual(gate.returncode, 0, gate.stdout + gate.stderr)

    def test_b_a_smaller_rebuild_leaves_no_stale_frames(self):
        _, frames, _ = self.build(40)
        self.assertEqual(len(list((frames / '240' / self.formats[0]).iterdir())), 40)
        self.assertFalse((frames / '640').exists())
        gate = self.gate(frames)
        self.assertEqual(gate.returncode, 0, gate.stdout + gate.stderr)

    def test_c_extract_refuses_to_delete_foreign_images(self):
        raw = self.root / 'raw'
        raw.mkdir(exist_ok=True)
        (raw / 'holiday.png').write_bytes(b'not ours')
        result = run('extract_frames.py', self.clip, '--out', raw, '--count', 60, '--width', 480)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('holiday.png', result.stderr)
        self.assertTrue((raw / 'holiday.png').exists())
        result = run('extract_frames.py', self.clip, '--out', raw, '--count', 60, '--width', 480, '--force')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertFalse((raw / 'holiday.png').exists())


if __name__ == '__main__':
    unittest.main()
