import { Injectable } from '@angular/core';
import { MetricStore } from './metric.store';
import { ApiService } from '../provider/api.service';
import { MetricDto, metricFactory } from './metric.entity';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class MetricService {
    constructor(
        private readonly _metricStore: MetricStore,
        private readonly _apiService: ApiService) {}

    public loadMetrics() {
        const loadMetrics$ = this._apiService.get<MetricDto[]>('metrics').pipe(
            map(dtos => dtos.map(dto => metricFactory(dto)))
        );
        loadMetrics$.subscribe(metrics => {
                this._metricStore.add(metrics);
            }
        );
    }
}
