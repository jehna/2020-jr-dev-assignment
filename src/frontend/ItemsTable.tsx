import React from 'react';
import { Badge, Table } from 'react-bootstrap';
import { Item } from '../shared/types';

interface ItemsTableProps {
  items: Item[];
}

export default function ItemsTable(props: ItemsTableProps) {
  return (
    <Table striped hover responsive='sm'>
      <thead className='thead-dark' >
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Manufacturer</th>
          <th>Price</th>
          <th>Availability</th>
        </tr>
      </thead>
      <tbody>
        { props.items.map(renderItem) }
      </tbody>
    </Table>
  );
}

function renderItem(item: Item) {
  const {id, type, name, /*color,*/ price, manufacturer, stock} = item;
  return (
    <tr key={id}>
      <th>{name}</th>
      <th>{type}</th>
      <th>{manufacturer}</th>
      <th>{price}</th>
      <th>{renderStock(stock)}</th>
    </tr>
  );
}

function renderStock(n: number | undefined) {
  let [text, variant] = ['N/A', 'info'];
  if (n !== undefined) {
    switch(n) {
      case 2: 
        text = 'In stock';
        variant = 'success';
        break;
      case 1:
        text = 'Less than 10';
        variant = 'warning';
        break;
      case 0:
        text = 'Out of stock';
        variant = 'danger';
        break;
    }
  }
  return (
    <Badge variant={variant} >
      {text}
    </Badge>
  );
}