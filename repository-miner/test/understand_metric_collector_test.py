import unittest
from analysis import UnderstandMetricCollector
import os


class UnderstandMetricCollectorTest(unittest.TestCase):

    def test_rootPath(self):
        metric_collector = UnderstandMetricCollector("repository", "/folder", [])
        expected = os.path.join("/folder", "repository")
        self.assertEqual(expected, metric_collector.root_path)