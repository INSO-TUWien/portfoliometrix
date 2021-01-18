import { MetricSelection, SLOC } from 'src/app/metric/metric.entity';

export type value = 'absolute' | 'change';
export type aggregate = 'average' | 'median' | 'none'; // none in case only 'sum' is active

export class TrendVisualizationControl {
    constructor(
        public value: value,
        public aggregate: aggregate,
        public canHaveSum: boolean, // sum only possible by SLOC
        public showSum: boolean,
        public showMinMax: boolean,
        public uniformScale: boolean,
        public normalize: boolean,
        public showThresholds: boolean) { }

    public get isAbsolute() { return this.value === 'absolute'; }
    public get isRelative() { return this.value === 'change'; }
    public get isAverage() { return this.aggregate === 'average'; }
    public get isMedian() { return this.aggregate === 'median'; }

    public toggleMinMax(): TrendVisualizationControl {
        const copy = this.clone();
        copy.showMinMax = !this.showMinMax;
        return copy;
    }

    public toggleUniformScale(): TrendVisualizationControl {
        const copy = this.clone();
        copy.uniformScale = !this.uniformScale;
        return copy;
    }

    public toggleThresholds(): TrendVisualizationControl {
        const copy = this.clone();
        copy.showThresholds = !this.showThresholds;
        return copy;
    }

    public toggleAverage(): TrendVisualizationControl {
        const copy = this.clone();
        if (copy.isAverage) {
            // if value can be summed, show sum by default
            if (copy.canHaveSum) {
                copy.aggregate = 'none';
                copy.showSum = true;
            } else {
                copy.aggregate = 'median';
                copy.showSum = false;
            }
        } else {
            copy.aggregate = 'average';
            copy.showSum = false;
        }
        return copy;
    }

    public toggleMedian(): TrendVisualizationControl {
        const copy = this.clone();
        if (copy.isMedian) {
            // if value can be summed, show sum by default
            if (copy.canHaveSum) {
                copy.aggregate = 'none';
                copy.showSum = true;
            } else {
                copy.aggregate = 'average';
                copy.showSum = false;
            }
        } else {
            copy.aggregate = 'median';
            copy.showSum = false;
        }
        return copy;
    }

    public toggleSum(): TrendVisualizationControl {
        const copy = this.clone();
        if (copy.canHaveSum) {
            copy.showSum = true;
            copy.aggregate = 'none';
        } // if sum not possible, ignore setting
        return copy;
    }

    public toggleValue(): TrendVisualizationControl {
        const copy = this.clone();
        if (copy.isAbsolute) {
            copy.value = 'change';
        } else {
            copy.value = 'absolute';
        }
        return copy;
    }

    public clone(): TrendVisualizationControl {
        return new TrendVisualizationControl(
            this.value,
            this.aggregate,
            this.canHaveSum,
            this.showSum,
            this.showMinMax,
            this.uniformScale,
            this.normalize,
            this.showThresholds);
    }

    public updateByMetrics(metricSelection: MetricSelection[]): TrendVisualizationControl {
        const controls = this.clone();
        // if no SLOC, skip sum
        if (!metricSelection.some(x => x.id === SLOC && x.isSelected)) {
            controls.canHaveSum = false;
            controls.showSum = false;
            if (controls.aggregate === 'none') {
                controls.aggregate = 'median';
            }
        } else {
            // SLOC is selected, are there also other metrics?
            controls.canHaveSum = true;
            controls.showSum = true;
            if (metricSelection.filter(x => x.isSelected).length > 1) {
                if (controls.aggregate === 'none') {
                    controls.aggregate = 'median';
                }
            } else { // only SLOC selected
                controls.aggregate = 'none';
            }
        }
        return controls;
    }
}

export function defaultTrendVisualizationControlFactory(): TrendVisualizationControl {
    const control = new TrendVisualizationControl('absolute', 'median', false, false, true, false, false, false);
    return control;
}

export function trendVisualizationControlFactory(metricSelection: MetricSelection[]): TrendVisualizationControl {
    const control = defaultTrendVisualizationControlFactory();
    // in case LOC is an active metric, we can have a sum, otherwise only medians by default
    if (metricSelection.filter(x => x.isSelected && x.id === SLOC).length > 0) {
        control.canHaveSum = true;
        control.showSum = true;
        // if we have SLOC, we should also check if we have another metric, if yes, aggregates are possible
        if (metricSelection.filter(x => x.isSelected).length === 1) {
            control.aggregate = 'none'; // only SLOC, so no other aggregates
        }
    }
    return control;
}
