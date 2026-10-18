"""Exact sensitivity analysis of existing evaluation labels, without generating test inputs."""
import argparse
from fractions import Fraction
import json
from pathlib import Path

RUNS = ('confirm_arson', 'confirm_arson_discipline', 'confirm_arson_water')

def analyze(summary):
    runs = {r['run']: r for r in summary['stats']}
    def coefficients(name):
        row = runs[name]
        n = row['statuses']['completed']
        return Fraction(row['levels'].get('full', 0), n), Fraction(row['levels'].get('partial', 0), n)
    def describe(name):
        row = runs[name]
        a, b = coefficients(name)
        return dict(run=name, completed=row['statuses']['completed'], mean_reward=row['mean_reward'],
            full=row['levels'].get('full', 0), partial=row['levels'].get('partial', 0),
            none=row['levels'].get('none', 0), lower=float(a), upper=float(a+b),
            at_half=float(a+b/2), interval_type='deterministic label-policy sensitivity; not a confidence interval')
    pairs = []
    for i, left in enumerate(RUNS):
        for right in RUNS[i+1:]:
            a, b = coefficients(left)
            c, d = coefficients(right)
            crossing = (c-a)/(b-d) if b != d else None
            pairs.append(dict(left=left, right=right,
                crossing_exact=str(crossing) if crossing is not None and 0 <= crossing <= 1 else None,
                crossing=float(crossing) if crossing is not None and 0 <= crossing <= 1 else None,
                left_difference_at_zero=float(a-c), left_difference_at_one=float(a+b-c-d),
                left_dominates_for_all_lambda=a>c and a+b>c+d,
                right_dominates_for_all_lambda=c>a and c+d>a+b,
                left_interval_strictly_above_right=a>c+d,
                right_interval_strictly_above_left=c>a+b))
    sweep=[]
    for step in range(101):
        weight=Fraction(step,100)
        sweep.append(dict(weight=float(weight), values={name:float(coefficients(name)[0]+weight*coefficients(name)[1]) for name in RUNS}))
    return dict(method='R(lambda)=(full+lambda*partial)/completed, lambda in [0,1]',
        source='data/audit/summary.json', scope='three existing runs with the same arson task; descriptive, not causal',
        assumptions=['Original full/partial/none labels are held fixed; not independently validated.',
            'The same partial credit lambda is applied to all groups.',
            'No inference to a broader task population; no statistical significance claim.'],
        groups=[describe(n) for n in RUNS], pairs=pairs, sweep=sweep)

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input',type=Path,default=Path('data/audit/summary.json'))
    p.add_argument('--output',type=Path,default=Path('data/audit/ranking_sensitivity.json'))
    args=p.parse_args()
    result=analyze(json.loads(args.input.read_text()))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ('groups','pairs')},ensure_ascii=False,indent=2))
