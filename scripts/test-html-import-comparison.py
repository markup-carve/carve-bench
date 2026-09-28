import copy
import importlib.util
from pathlib import Path
import unittest
import sys

spec = importlib.util.spec_from_file_location('comparison', Path(__file__).with_name('html-import-comparison.py'))
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)


class CompletionGuard(unittest.TestCase):
    def setUp(self):
        self.run = {'reps': 3, 'tools': {'engine': {}}, 'pages': {
            str(i): {'tools': {'engine': {'error': None, 'output_sha256': 'verified',
                'samples_ms': [1.0, 2.0, 3.0]}}} for i in range(10)}}

    def test_accepts_complete_timing_and_untimed_fidelity(self):
        comparison.require_complete(self.run, False)
        for page in self.run['pages'].values():
            page['tools']['engine']['samples_ms'] = []
        comparison.require_complete(self.run, True)
        with self.assertRaises(RuntimeError):
            comparison.require_complete(self.run, False)

    def test_rejects_failure_after_successful_samples(self):
        self.run['pages']['9']['tools']['engine']['error'] = 'last repetition failed'
        with self.assertRaises(RuntimeError):
            comparison.require_complete(self.run, False)

    def test_rejects_missing_pages_tools_outputs_and_samples(self):
        for mutation in [
            lambda run: run['pages'].pop('9'),
            lambda run: run['pages']['9']['tools'].clear(),
            lambda run: run['pages']['9']['tools']['engine'].pop('output_sha256'),
            lambda run: run['pages']['9']['tools']['engine']['samples_ms'].pop(),
            lambda run: run['pages']['9']['tools']['engine']['samples_ms'].__setitem__(0, float('nan')),
        ]:
            run = copy.deepcopy(self.run)
            mutation(run)
            with self.subTest(run=run), self.assertRaises(RuntimeError):
                comparison.require_complete(run, False)


class WorkerProtocol(unittest.TestCase):
    def worker(self, body):
        return comparison.Worker([sys.executable, '-u', '-c', 'import sys,json,time; request=json.loads(sys.stdin.readline()); ' + body])

    def test_rejects_wrong_id_and_reported_failure(self):
        for body in [
            'print(json.dumps({"id":999,"ok":True,"markdown":"wrong"}))',
            'print(json.dumps({"id":request["id"],"ok":False,"error":"failed"}))',
        ]:
            worker = self.worker(body)
            try:
                with self.assertRaises(RuntimeError):
                    worker.convert('input', '')
            finally:
                worker.close()

    def test_partial_line_cannot_evade_timeout(self):
        worker = self.worker('sys.stdout.write("{\\"id\\":"); sys.stdout.flush(); time.sleep(5)')
        try:
            with self.assertRaises(TimeoutError):
                worker.request({"html": "input"}, timeout=.1)
        finally:
            worker.close()


if __name__ == '__main__':
    unittest.main()
