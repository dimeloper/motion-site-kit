"""Exercise the gate through its CLI with independent on-disk fixtures."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'skills/motion-website/scripts/check_budget.py'


class BudgetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.config = self.root / 'config.json'
        self.write_config({'frameCountMin': 2, 'phoneRungBytes': 100})
        self.frames = self.root / 'frames'
        self.frames.mkdir()
        self.manifest = {'count': 2, 'padding': 4, 'widths': [640], 'formats': ['avif', 'webp'],
                         'bytes': {'640': {'avif': 20, 'webp': 20}}}
        for fmt in self.manifest['formats']:
            folder = self.frames / '640' / fmt
            folder.mkdir(parents=True)
            for i in range(2):
                (folder / f'{i:04d}.{fmt}').write_bytes(b'x' * 10)
        self.save()

    def write_config(self, budget):
        self.config.write_text(json.dumps({'budget': budget}))

    def add_rung(self, width, size):
        self.manifest['widths'].append(width)
        self.manifest['bytes'][str(width)] = {}
        for fmt in self.manifest['formats']:
            folder = self.frames / str(width) / fmt
            folder.mkdir(parents=True)
            for i in range(2):
                (folder / f'{i:04d}.{fmt}').write_bytes(b'x' * size)
            self.manifest['bytes'][str(width)][fmt] = 2 * size
        self.save()

    def add_posters(self):
        (self.frames / 'poster').mkdir()
        files = {}
        for width in self.manifest['widths']:
            (self.frames / 'poster' / f'{width}.webp').write_bytes(b'p' * 5)
            files[str(width)] = f'poster/{width}.webp'
        self.manifest['poster'] = {'frame': 0, 'files': files}
        self.save()

    def save(self):
        (self.frames / 'manifest.json').write_text(json.dumps(self.manifest))

    def run_gate(self, *args):
        return subprocess.run([sys.executable, str(SCRIPT), '--config', str(self.config),
                               '--frames', str(self.frames), *args], capture_output=True, text=True)

    def test_valid_ladder(self):
        self.assertEqual(self.run_gate('--strict').returncode, 0)

    def test_missing_manifest_is_optional_only(self):
        (self.frames / 'manifest.json').unlink()
        self.assertEqual(self.run_gate().returncode, 0)
        self.assertEqual(self.run_gate('--strict').returncode, 1)

    def test_manifest_without_frames_fails(self):
        for p in self.frames.rglob('*'):
            if p.suffix in ('.avif', '.webp'):
                p.unlink()
        result = self.run_gate('--strict')
        self.assertEqual(result.returncode, 1)
        self.assertIn('missing frames', result.stdout)

    def test_stale_manifest_fails(self):
        (self.frames / '640/avif/0000.avif').write_bytes(b'x' * 11)
        self.assertEqual(self.run_gate().returncode, 1)

    def test_webp_budget_is_enforced(self):
        for p in (self.frames / '640/webp').iterdir():
            p.write_bytes(b'x' * 60)
        self.manifest['bytes']['640']['webp'] = 120
        self.save()
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('webp sequence', result.stdout)

    def test_extra_frame_fails(self):
        (self.frames / '640/avif/0002.avif').write_bytes(b'x')
        self.assertEqual(self.run_gate().returncode, 1)

    def test_empty_frame_fails_even_with_matching_total(self):
        (self.frames / '640/avif/0000.avif').write_bytes(b'')
        self.manifest['bytes']['640']['avif'] = 10
        self.save()
        self.assertEqual(self.run_gate().returncode, 1)

    def test_invalid_manifest_is_input_error(self):
        self.manifest['widths'] = []
        self.save()
        self.assertEqual(self.run_gate().returncode, 2)

    def test_phone_ceiling_covers_the_960_rung(self):
        # Phones at 2x select 960, so it must get the tight ceiling, not 8 MiB.
        self.add_rung(960, 60)
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('960px avif sequence', result.stdout)

    def test_rungs_above_the_phone_width_use_the_sequence_ceiling(self):
        self.add_rung(1600, 60)
        self.assertEqual(self.run_gate().returncode, 0)

    def test_ladder_without_a_phone_rung_fails(self):
        self.write_config({'frameCountMin': 2, 'phoneRungWidth': 320})
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('no rung at or below 320px', result.stdout)

    def test_legacy_narrow_rung_keys_still_apply(self):
        self.write_config({'frameCountMin': 2, 'narrowRungBytes': 15, 'narrowRungWidth': 640})
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('640px avif sequence', result.stdout)

    def test_listed_posters_are_not_stray_files(self):
        self.add_posters()
        self.assertEqual(self.run_gate('--strict').returncode, 0)

    def test_missing_poster_fails(self):
        self.add_posters()
        (self.frames / 'poster/640.webp').unlink()
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('poster poster/640.webp', result.stdout)

    def test_unlisted_poster_is_a_stray_file(self):
        (self.frames / 'poster').mkdir()
        (self.frames / 'poster/640.webp').write_bytes(b'p')
        result = self.run_gate()
        self.assertEqual(result.returncode, 1)
        self.assertIn('unadvertised', result.stdout)

    def test_poster_outside_the_poster_folder_is_invalid(self):
        self.manifest['poster'] = {'frame': 0, 'files': {'640': '../escape.webp'}}
        self.save()
        self.assertEqual(self.run_gate().returncode, 2)


if __name__ == '__main__':
    unittest.main()
