import express from 'express'
import bodyParser from 'body-parser';
import path from 'path';
import apicache from 'apicache';
import { Item } from '../shared/types';
import { getProductsFor, getManufacturers, getAvailabilitiesFor } from './reaktorApi';

const buildDir = path.join(process.cwd() + '/build');
const app = express();
const cache = apicache.middleware;

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

// WITH CACHING NOW
app.get('/api', cache('5 minutes'), async function(req, res, next) {
  const items = new Map<string, Item>();
  const categories = ['shirts', 'jackets', 'accessories'];

  // Fetch all products
  try {
    const products = await Promise.all(categories.map(getProductsFor))
      .then(allProducts => allProducts.flat());
    products.forEach(product => items.set(product.id, product));
  } catch (e) {
    console.log(`Error fetching products: ${e}`);
    return res.json(500).json('Internal server error');
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
    res.json(500).json('Internal server error');
  }

  // Finally, send all items as a list
  res.json([...items.values()]);
});

const port = process.env.PORT || 3001;
console.log('checking port', port);
app.listen(port, () => {
  console.log(`Server now listening on port: ${port}`);
});