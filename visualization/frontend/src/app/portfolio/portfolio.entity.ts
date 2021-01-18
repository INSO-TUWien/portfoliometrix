
export interface PortfolioDto {
    id: string;
    name: string;
    description: string;
}

export interface PortfolioEntity extends Readonly<Pick<PortfolioDto, 'id'|'name'>> {}
export function portfolioFactory(dto: PortfolioDto): PortfolioEntity { return dto; }
