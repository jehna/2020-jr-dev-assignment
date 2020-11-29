import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { Product, ManufacturerAvailabilities } from '../shared/types';

const BASE_URL = 'https://bad-api-assignment.reaktor.com';

export async function getProductsFor(type: string) {
  const response = await fetch(`${BASE_URL}/products/${type}`);
  let result;
  try {
    result = await response.json() as Product[];
  } catch (e) {
    throw new Error(`Error parsing ${type}: ${e}`);
  }
  return result;
}

export function getManufacturers(products: Product[]) {
  const manufacturers = products.map(product => product.manufacturer);
  const unique = new Set(manufacturers);
  const asArr = [...unique];
  return asArr;
}

export async function getAvailabilitiesFor(manufacturer: string) {
  const response = await fetch(`${BASE_URL}/availability/${manufacturer}`);
  let result;
  try {
    result = await response.json() as ManufacturerAvailabilities;
  } catch (e) {
    throw new Error(`Unable to parse ${manufacturer}'s availabilities: ${e}`);
  }
  if (result.code !== 200) {
    throw new Error(`Unable to fetch ${manufacturer}'s availabilities: bad status code ${response.status}`);
  }
  const ret = result.response.map(({ id, DATAPAYLOAD }) => {
    const idLowerCase = id.toLowerCase();
    const availability = getAvailability(DATAPAYLOAD);
    return { id: idLowerCase, stock: availability };
  });
  return ret;
}

function getAvailability(payload: string) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(payload, 'application/xml');
  const element = dom.getElementsByTagName('INSTOCKVALUE').item(0);
  if (!element)
    throw new Error('No INSTOCKVALUE-tag found');
  const value = element.textContent;
  if (value) {
    switch (value) {
      case 'INSTOCK':
        return 2;
      case 'LESSTHAN10':
        return 1;
      case 'OUTOFSTOCK':
        return 0;
      default:
        return -1; // unexpected value
    }
  } else {
    throw new Error(`Unexpected INSTOCKVALUE-tags: ${payload}`);
  }
}