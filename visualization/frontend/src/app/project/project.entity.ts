export interface ProjectDto {
    id: string;
    name: string;
    description: string;
    language: string;
    homePage: string;
    htmlUrl: string;
}

export interface ProjectEntity extends Readonly<ProjectDto> {}
export function projectFactory(dto: ProjectDto): ProjectEntity { return dto; }
