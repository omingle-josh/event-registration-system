export type EventStatus = "OPEN" | "CLOSED";

export interface EventDto {
  id: number;
  name: string;
  description: string;
  venue: string;
  date: string;
  fee: number;
  capacity: number;
  availableSeats: number;
  status: EventStatus;
  organizerEmail?: string;
  imageUrl?: string;
}

export interface EventFilters {
  name?: string;
  venue?: string;
  minFee?: number;
  maxFee?: number;
}

export interface EventCreateRequestDto {
  name: string;
  description: string;
  venue: string;
  date: string;
  fee: number;
  capacity: number;
  imageUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
