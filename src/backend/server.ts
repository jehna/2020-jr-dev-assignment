import express from 'express'
import bodyParser from 'body-parser';
import path from 'path';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

const buildDir = path.join(process.cwd() + '/build');
const app = express();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static(buildDir));
app.get('/', function (req, res) {
  res.sendFile(path.join(buildDir, 'index.html'));
});
app.get('/ping', function(req, res) {
  res.json('pong');
});

app.get('/api', async function(req, res, next) {
  const items = new Map<string, Item>();
  const categories = ['shirts', 'jackets', 'accessories'];

  // Fetch all products
  try {
    const products = await Promise.all(categories.map(getProductsFor))
      .then(allProducts => allProducts.flat());
    products.forEach(product => items.set(product.id, product));
  } catch (e) {
    console.log(`Error fetching products: ${e}`);
    next();
  }

  // Fetch all availabilities and merge
  try {
    const manufacturers = getManufacturers([...items.values()]);
    const manAvailabilities = await Promise.all(manufacturers.map(getAvailabilitiesFor))
      .then(allAvailabilities => allAvailabilities.flat());
    // Merge products and availability data:
    manAvailabilities.forEach(({id, stock}) => {
      if (items.has(id)) {
        const old = items.get(id);
        const updated = {...old, stock} as Item;
        items.set(id, updated);
      }
    });
  } catch (e) {
    console.log(`Error setting availabilities: ${e}`);
    next();
  }

  // Finally, send all items as a list
  res.json([...items.values()]);
});

const port = 3001;
console.log('checking port', port);
app.listen(port, () => {
  console.log(`Server now listening on port: ${port}`);
});

interface Item extends Product {
  stock?: number;
}

const BASE_URL = 'https://bad-api-assignment.reaktor.com';

interface Product {
  id: string;
  type: string;
  name: string;
  color: string[];
  price: number;
  manufacturer: string;
}

interface ManufacturerAvailabilities {
  code: number;
  response: Availability[];
}

interface Availability {
  id: string;
  DATAPAYLOAD: string;
}

async function getProductsFor(type: string) {
  const response = await fetch(`${BASE_URL}/products/${type}`);
  let result;
  try {
    result = await response.json() as Product[];
  } catch (e) {
    throw new Error(`Error parsing ${type}: ${e}`);
  }
  return result;
}

function getManufacturers(products: Product[]) {
  const manufacturers = products.map(product => product.manufacturer);
  const unique = new Set(manufacturers);
  const asArr = [...unique];
  return asArr;
}

async function getAvailabilitiesFor(manufacturer: string) {
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
  const ret = result.response.map(({id, DATAPAYLOAD}) => {
    const idLowerCase = id.toLowerCase();
    const availability = getAvailability(DATAPAYLOAD);
    return {id: idLowerCase, stock: availability};
  });
  return ret;
}

function getAvailability(payload: string) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(payload, 'application/xml');
  const element = dom.getElementsByTagName('INSTOCKVALUE').item(0);
  if (!element) throw new Error('No INSTOCKVALUE-tag found');
  const value = element.textContent;
  if (value) {
    switch(value) {
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