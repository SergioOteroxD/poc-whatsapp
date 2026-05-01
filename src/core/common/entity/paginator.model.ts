import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface Ipaginator {
  readonly previousPageIndex?: number;
  readonly nextPageIndex?: number;
  readonly totalPages: number;
  readonly totalItems: number;
  readonly pageIndex: number;
  readonly pageSize: number;
}

/**
 * Clase que contiene la información de paginación para listados
 */
export class Paginator {
  @ApiPropertyOptional({
    description:
      'Índice de la página anterior (undefined si es la primera página)',
    example: 1,
    required: false,
  })
  readonly previousPageIndex: number | undefined;

  @ApiPropertyOptional({
    description:
      'Índice de la siguiente página (undefined si es la última página)',
    example: 3,
    required: false,
  })
  readonly nextPageIndex: number | undefined;

  @ApiProperty({
    description: 'Número total de páginas disponibles',
    example: 5,
    type: Number,
  })
  readonly totalPages: number;

  @ApiProperty({
    description: 'Número total de elementos en toda la colección',
    example: 50,
    type: Number,
  })
  readonly totalItems: number;

  @ApiProperty({
    description: 'Índice de la página actual (base 1)',
    example: 2,
    type: Number,
  })
  readonly pageIndex: number;

  @ApiProperty({
    description: 'Tamaño de la página (número de elementos por página)',
    example: 10,
    type: Number,
  })
  readonly pageSize: number;

  constructor(_totalItems: number, _pageIndex: number, _pageSize: number) {
    this.totalItems = _totalItems;
    this.pageIndex = _pageIndex;
    this.pageSize = _pageSize;
    const tp = Math.trunc(_totalItems / this.pageSize);
    this.totalPages = _totalItems % this.pageSize > 0 ? tp + 1 : tp;
    this.previousPageIndex =
      this.pageIndex > 1 ? this.pageIndex - 1 : undefined;
    this.nextPageIndex =
      this.pageIndex < this.totalPages ? this.pageIndex + 1 : undefined;
  }
}
