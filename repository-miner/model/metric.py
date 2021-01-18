class Metric:
    """class that stores metadata that describes a specific metric.
    The key is used to identify the metric within the metric collection tool
    """
    def __init__(self, key, name, description):
        self.key = key
        self.name = name
        self.description = description