import hashlib
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

HERE = Path(__file__).resolve().parent

def module(name):
    spec=importlib.util.spec_from_file_location(name,HERE/f'{name}.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

run=module('run');report=module('report')

class HistoryTests(unittest.TestCase):
    def test_semantic_tags_and_duplicate_versions(self):
        self.assertEqual(run.stable_tags(['v0.1.9','0.1.10','v0.1.8','0.1.7','0.2.0-rc1','v0.1.10'],4),['0.1.7','v0.1.8','v0.1.9','v0.1.10'])
        with self.assertRaises(ValueError):run.stable_tags(['0.1.1'],4)

    def test_docs_only_main_reuses_tag_but_source_change_adds_point(self):
        with tempfile.TemporaryDirectory() as directory:
            tree=Path(directory)/'tree';tree.mkdir()
            def git(*args):return subprocess.check_output(['git','-C',str(tree),*args],text=True).strip()
            git('init','-b','main');git('config','user.email','history@example.test');git('config','user.name','History test')
            (tree/'src').mkdir();(tree/'src/engine').write_text('code');git('add','.');git('commit','-m','source');git('tag','-a','0.1.0','-m','tag')
            (tree/'README.md').write_text('docs');git('add','.');git('commit','-m','docs')
            mirror=tree/'.git';revisions,alias=run.select_revisions(mirror,'js',1)
            self.assertEqual(len(revisions),1);self.assertEqual(alias['same_source_as'],'0.1.0')
            (tree/'src/engine').write_text('changed');git('add','.');git('commit','-m','change')
            revisions,alias=run.select_revisions(mirror,'js',1);self.assertEqual(len(revisions),2);self.assertIsNone(alias)
            git('tag','v0.1.0')
            with self.assertRaisesRegex(ValueError,'Conflicting tags'):run.select_revisions(mirror,'js',1)

    def test_changed_output_breaks_graph_and_csv_reports_it(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'engine-history.json'
            rows=[dict(revision=label,case='verse_equivalent',n=128,median_ms=ms,min_ms=ms,max_ms=ms,output_sha256=hash) for label,ms,hash in [('0.1.0',1,'a'),('0.1.1',2,'b'),('PR-2',1.5,'b')]]
            data={'schema':1,'generated_at':'test','rounds':3,'samples_per_round':7,'engines':{'js':{'runtime':'node','main_alias':None,'revisions':[{'label':r['revision'],'sha':r['revision'],**({'kind':'candidate'} if r['revision']=='PR-2' else {})} for r in rows],'rows':rows}}}
            data['measurement_signature']=run.measurement_signature((HERE/'run.py').read_text());data['harness_sha256']={'worker.mjs':hashlib.sha256((HERE/'worker.mjs').read_bytes()).hexdigest()}
            for row in rows:
                row['fixture_sha256']=hashlib.sha256(run.fixture(row['case'],row['n']).encode()).hexdigest()
                row['samples']=[{'samples_ms':[row['median_ms']]*7,'hash':row['output_sha256']} for _ in range(3)]
            path.write_text(json.dumps(data));report.build(path)
            svg=path.with_name('engine-history-js.svg').read_text()
            self.assertEqual(svg.count('stroke-width="2"/>'),1)
            self.assertIn('False',path.with_suffix('.csv').read_text())
            viewer=path.with_suffix('.html').read_text();self.assertNotIn('HISTORY_DATA',viewer);self.assertIn('"schema": 1',viewer)

    def test_signature_tracks_timing_and_fixtures_but_ignores_metadata(self):
        source=(HERE/'run.py').read_text()
        signature=run.measurement_signature(source)
        self.assertNotEqual(signature,run.measurement_signature(source.replace("return 'plain paragraph\\n\\n' * n", "return 'other paragraph\\n\\n' * n")))
        self.assertEqual(signature,run.measurement_signature(source.replace("'finished_at'", "'completion_time'")))

    def test_validation_rejects_changed_worker_fixture_and_session_signature(self):
        signature=run.measurement_signature((HERE/'run.py').read_text())
        session={'measurement_signature':signature,'harness_sha256':{'worker.mjs':hashlib.sha256((HERE/'worker.mjs').read_bytes()).hexdigest()}}
        row={'case':'paragraphs','n':128,'fixture_sha256':hashlib.sha256(run.fixture('paragraphs',128).encode()).hexdigest(),'samples':[{'samples_ms':[1.0],'hash':'same'}],'output_sha256':'same','median_ms':1.0,'min_ms':1.0,'max_ms':1.0}
        data={'rounds':1,'samples_per_round':1,'measurement_signature':signature,'engines':{'js':{'measurement_session':session,'rows':[row]}}}
        report.validate_measurements(data)
        for field in ('worker','fixture','session','missing','summary','sample_count','output'):
            changed=copy.deepcopy(data)
            if field=='worker':changed['engines']['js']['measurement_session']['harness_sha256']['worker.mjs']='wrong'
            elif field=='fixture':changed['engines']['js']['rows'][0]['fixture_sha256']='wrong'
            elif field=='session':changed['engines']['js']['measurement_session']['measurement_signature']='wrong'
            elif field=='summary':changed['engines']['js']['rows'][0]['median_ms']=2.0
            elif field=='sample_count':changed['engines']['js']['rows'][0]['samples']=[]
            elif field=='output':changed['engines']['js']['rows'][0]['samples'][0]['hash']='different'
            else:del changed['measurement_signature']
            with self.assertRaises(ValueError):report.validate_measurements(changed)

    def test_candidate_aliases_identical_source_and_adds_changed_source(self):
        with tempfile.TemporaryDirectory() as directory:
            tree=Path(directory);subprocess.run(['git','init','-b','main',str(tree)],check=True,capture_output=True)
            def git(*args):return subprocess.check_output(['git','-C',str(tree),*args],text=True).strip()
            git('config','user.email','history@example.test');git('config','user.name','History test')
            (tree/'src').mkdir();(tree/'src/engine').write_text('code');git('add','.');git('commit','-m','source');git('tag','0.1.0')
            sha=git('rev-parse','HEAD');revisions,alias=run.select_revisions(tree/'.git','js',1)
            candidate=run.add_candidate(tree/'.git','js',revisions,'PR-1',sha)
            self.assertEqual(candidate['same_source_as'],'0.1.0');self.assertEqual(len(revisions),1)
            (tree/'src/engine').write_text('changed');git('add','.');git('commit','-m','candidate')
            self.assertIsNone(run.add_candidate(tree/'.git','js',revisions,'PR-2',git('rev-parse','HEAD')))
            self.assertEqual(revisions[-1]['kind'],'candidate')
            with self.assertRaisesRegex(ValueError,'Duplicate candidate'):run.add_candidate(tree/'.git','js',revisions,'PR-2',sha)

    def test_equivalent_verse_fixture_does_not_define_a_reference(self):
        text=run.fixture('verse_equivalent',128)
        self.assertEqual(text.count('[r]: /hidden extra'),128);self.assertIn('[t][missing]',text)

if __name__=='__main__':unittest.main()
