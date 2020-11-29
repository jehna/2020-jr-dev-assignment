export interface Item extends Product {
  stock?: number;
}

export interface Product {
  id: string;
  type: string;
  name: string;
  color: string[];
  price: number;
  manufacturer: string;
}

export interface ManufacturerAvailabilities {
  code: number;
  response: Availability[];
}

interface Availability {
  id: string;
  DATAPAYLOAD: string;
}
