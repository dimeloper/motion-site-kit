import contextlib
import io
import json
from pathlib import Path
import struct
import tempfile
import unittest

from scripts.check_example_budget import check, MODEL_LIMIT


class ExampleBudgetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ('local', 'saas', 'commerce'):
            folder = self.root / 'docs/examples' / name
            (folder / 'models').mkdir(parents=True)
            (folder / 'config.js').write_text('export const CONFIG = {};')
            self.write_model(name, {'asset': {'version': '2.0'}})

    def write_model(self, name, doc):
        chunk = json.dumps(doc).encode()
        chunk += b' ' * (-len(chunk) % 4)
        data = struct.pack('<4sIIII', b'glTF', 2, len(chunk) + 20, len(chunk), 0x4e4f534a) + chunk
        path = self.root / 'docs/examples' / name / 'models/model.glb'
        path.write_bytes(data)
        return path

    def errors(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return check(self.root)

    def test_valid_self_contained_models(self):
        self.assertEqual(self.errors(), [])

    def test_external_texture_cannot_bypass_budget(self):
        self.write_model('local', {'images': [{'uri': 'outside.png'}]})
        self.assertTrue(any('URI' in error for error in self.errors()))

    def test_oversized_model_fails(self):
        path = self.write_model('local', {})
        path.write_bytes(b'x' * (MODEL_LIMIT + 1))
        self.assertTrue(any('exceeds' in error for error in self.errors()))

    def test_missing_model_fails(self):
        (self.root / 'docs/examples/local/models/model.glb').unlink()
        self.assertTrue(any('no model' in error for error in self.errors()))
