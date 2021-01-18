/** stores the distribution values for a specific project */
export interface PolarChartDataForProject {
    name: string;
    series: {
        name: string; // name is the name of the metric
        value: number;
    }[];
}

/** stores the distribution for all projects for the given snapshot */
export interface PolarChartDataPerSnapshotEntity {
    id: number; // the snapshot index is the id of this distribution
    polarChartDataPerProject: PolarChartDataForProject[];
}

export interface PolarChartDataDto {
    snapshot: number;
    data: {
        project: string;
        series: {
            metric_id: string;
            absolute_value: number;
            normalized_value: number;
        }[];
    }[];
}
