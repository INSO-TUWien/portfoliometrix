export interface ProjectSelectionEntity {
    id: string;
    htmlUrl: string;
    name: string;
    isSelected: boolean;
}

export interface ProjectChangeEvent {
    id: string;
    isSelected: boolean;
}
