import time


class ProfilingPhase:
    def __enter__(self):
        self.start = time.time()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end = time.time()
        self.duration = self.end - self.start


class Profiler:
    CHECKOUT = 'checkout'
    ANALYSIS = 'analysis'
    STORAGE = 'storage'

    def __init__(self, file_name: str):
        self.file_name = file_name
        self.phases = {}
        with open(self.file_name, 'w+') as time_file:
            time_file.write('SEP=,\n')
            time_file.write(f'repository,commit,{",".join([Profiler.CHECKOUT, Profiler.ANALYSIS])}\n')

    def save(self, repository, snapshot):
        with open(self.file_name, 'a+') as time_file:
            time_file.write(f'{repository},{snapshot},{",".join([str(value.duration) for (key, value) in self.phases.items()])}\n')

    def save_storage(self, repository):
        with open(self.file_name, 'a+') as time_file:
            time_file.write(f'{repository}-storage,{self.phases[Profiler.STORAGE].duration}\n')

    def start(self, phase: str) -> ProfilingPhase:
        profiling_phase = ProfilingPhase()
        self.phases[phase] = profiling_phase
        return profiling_phase
