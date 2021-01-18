export const SLOC = 'CountLineCode';


export interface MetricDto {
    id: string;
    name: string;
    description: string;
}
export interface MetricEntity extends Readonly<Pick<MetricDto, 'id'|'name'>> {}
export function metricFactory(dto: MetricDto): MetricEntity {return dto; }

export interface MetricSelection extends MetricEntity {
    isSelected: boolean;
}

export interface MetricChangeEvent {
    id: string;
    isSelected: boolean;
}
