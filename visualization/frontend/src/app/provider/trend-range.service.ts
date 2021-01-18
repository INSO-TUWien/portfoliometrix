import { ApiService } from './api.service';
import { TrendSeriesRangeDto, TrendSeriesRange } from '../trend-visualization/trend-visualization-series.entity';
import { TrendVisualizationControl } from '../trend-visualization/trend-visualization-control/trend-visualization-control';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

/**
 * responsible for providing the min/max range
 * for drawing the trends of the given projects
 */
@Injectable({providedIn: 'root'})
export class TrendRangeService {

    constructor(private readonly _apiService: ApiService) { }

    public getScaling(
        projectIds: string[],
        metricIds: string[],
        controls: TrendVisualizationControl): Observable<TrendSeriesRange> {
        const range$ = this._apiService.get<TrendSeriesRangeDto>('range', {
            projects: projectIds,
            metrics: metricIds,
            use_total_values: controls.showMinMax.toString()
        }).pipe(
            map(range => {
                // depending on the aggregate that is used (median, average, sum  or more than one)
                // different min, max values have to be chosen.
                // In case sum is combined with another aggregate, min and max values have to be
                // taken from different aggregates.
                let min: number;
                let max: number;
                if (controls.showSum) {
                    max = range.sum.max;
                } else {
                    max = controls.aggregate === 'median' ? range.median.max : range.average.max;
                }
                switch (controls.aggregate) {
                    case 'average':
                        min = range.average.min;
                        break;
                    case 'median':
                        min = range.median.min;
                        break;
                    case 'none':
                        min = range.sum.min;
                }
                return { min, max };
            })
        );
        return range$;
    }
}
