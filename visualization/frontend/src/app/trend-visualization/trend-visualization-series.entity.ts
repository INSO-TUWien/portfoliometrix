import { TrendVisualizationControl } from './trend-visualization-control/trend-visualization-control';
import { SLOC } from '../metric/metric.entity';

export interface TrendSeriesDto {
  project: string;
  series: {
    metric: string;
    index_values: {
      index: string;
      sum: number;
      average: number;
      median: number;
      min: number;
      max: number;
      id?: string;
      date?: Date;
      hash: string;
    }[]
  }[];
}

/**
 * DTO stores the value range a trend chart can have.
 * Will be the lowest min and highest max value of a given list of metrics
 * for all projects of a repository
 */
export interface TrendSeriesRangeDto {
  median: TrendSeriesRange;
  average: TrendSeriesRange;
  sum: TrendSeriesRange;
}

export interface TrendSeriesRange {
  min: number;
  max: number;
}

export interface TrendVisualizationSeries {
    metric: string;
    name: string;
    /** the series containing the trend data */
    series: {
        /** the x axis value */
        name: string|number,
        /** the value at the x position */
        value: number,
        min: number,
        max: number,
        date?: Date,
        hash: string
    }[];
}

/**
 * assigns the correct series value from the dto
 * depending on the control settings and the current
 * metric
 * @param series all available metric values for this series point
 * @param metricId id of the metric for which this series is printed
 * @param controls the visualization controls
 */
function determineSeriesValue(
  series: {
    sum: number;
    average: number;
    median: number;
  },
  metricId: string,
  controls: TrendVisualizationControl): number {
  if (metricId === SLOC && controls.showSum) {
    return series.sum;
  }
  if (controls.isMedian) {
    return series.median;
  }
  if (controls.isAverage) {
    return series.average;
  }
  // in case we do not have a value (because user has chosen "SUM", but no summable metric is chosen)
  // simply return a default value (0)
  return 0;
}

export function convertDtoToSeries(dto: TrendSeriesDto, controls: TrendVisualizationControl): TrendVisualizationSeries[] {
    const series = dto.series.map(s => ({
        metric: s.metric,
        name: s.metric,
        series: s.index_values.map(i => ({
            name: i.index,
            value: determineSeriesValue(i, s.metric, controls),
            date: i.date,
            hash: i.hash,
            min: controls.showMinMax ? i.min : undefined,
            max: controls.showMinMax ? i.max : undefined
        }))
    }));
    return series;
}


