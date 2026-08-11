import { Customer } from "@prisma/client";

export interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CustomerWithRelations extends Customer {
  _count?: {
    challans: number;
  };
}
