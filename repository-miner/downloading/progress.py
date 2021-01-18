import git
import sys


class GitCloneProgress(git.remote.RemoteProgress):
    """ prints the progress during a git clone operation.
    Part of the GitPython interface. the class has one 'update'
    method that will be called during a git clone command and will
    receive progress information
    """

    def __init__(self, repository_name, index):
        super().__init__()
        self.repository_name = repository_name
        self.index = index

    def op_code_to_string(self, code):
        """
        converts the operation code of the current clone operation
        to a string
        :param code: the code of the current clone operation, consists of
        a bit mask describing whether the operation has started/ended and the code
        of the operation itself
        :return: a string representation of the operation code
        """
        op_code = code & self.OP_MASK
        if op_code == self.COUNTING:
            return 'counting'
        if op_code == self.WRITING:
            return 'writing'
        if op_code == self.COMPRESSING:
            return 'compressing'
        if op_code == self.RECEIVING:
            return 'receiving'
        if op_code == self.RESOLVING:
            return 'resolving'
        if op_code == self.CHECKING_OUT:
            return 'checking out'
        return str(op_code)

    def update(self, op_code, cur_count, max_count=None, message=''):
        """
        updates the progress bar while cloning the repository
        :param op_code:
        :param cur_count:
        :param max_count:
        :param message:
        :return:
        """
        code_string = self.op_code_to_string(op_code)
        is_end = op_code & self.END == self.END
        percentage = int(round(100.0 / max_count * cur_count))
        sys.stdout.write('\n' * self.index)
        sys.stdout.write(f'\033[2K\033[1G{self.repository_name}: {percentage} % {code_string}, {message}')
        if is_end and (op_code & self.OP_MASK == self.RESOLVING) or (op_code & self.OP_MASK == self.CHECKING_OUT):
            sys.stdout.write(f'\033[2K\033[1G{self.repository_name} done.')
        sys.stdout.write('\033[F' * self.index)
        sys.stdout.write('\r')
