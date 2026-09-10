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
        self.config.write_text(json.dumps({'budget': {'frameCountMin': 2, 'narrowRungBytes': 100}}))
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


if __name__ == '__main__':
    unittest.main()
