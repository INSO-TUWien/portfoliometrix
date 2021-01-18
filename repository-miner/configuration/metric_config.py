# stores metric meta data extracted from Understand (https://scitools.com/)
from model.metric import Metric


class METRICS:
    """
    list of available metrics.
    Every metric has a unique key that is used to identify it
    """
    ITEMS = [
        Metric(
            'CountLineCode',
            'Source Lines of Code',
            'The number of lines that contain source code. Note that a line can contain source and a comment and thus count towards multiple metrics. For Classes this is the sum of the CountLineCode for the member functions of the class.'
        ),
        Metric(
            'RatioCommentToCode',
            'Comment to Code Ratio',
            'Ratio of number of comment lines to number of code lines. Note that because some lines are both code and comment, this could easily yield percentages higher than 100'
        ),
        Metric(
            'MaxCyclomatic',
            'Max Cyclomatic Complexity',
            'Maximum cyclomatic complexity of all nested functions or methods.'
        ),
        Metric(
            'PercentLackOfCohesion',
            'Lack of cohesion (in percent)',
            '100% minus average cohesion for class data members. Calculates what percentage of class methods use a given class instance variable. To calculate, average percentages for all of that classes instance variables and subtract from 100%. A lower percentage means higher cohesion between class data and methods.'
        ),
        Metric(
            'CountClassCoupled',
            'Coupling between classes',
            'Number of other classes coupled to. Coupling means using a type, data, or member from that class. Any number of couplings to a given class counts as 1'
        ),
        Metric(
            'MaxInheritanceTree',
            'Depth of inheritance tree',
            'The depth of a class within the inheritance hierarchy is the maximum number of nodes from the class node to the root of the inheritance tree. The root node has a DIT of 0. The deeper within the hierarchy, the more methods the class can inherit, increasing its complexity.'
        )
    ]
