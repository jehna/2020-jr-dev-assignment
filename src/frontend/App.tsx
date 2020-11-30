import React from 'react';
import { Alert, Container, Dropdown, DropdownButton, Pagination } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Item } from '../shared/types';
import ItemsTable from './ItemsTable';
import { RootState } from './store';

interface AppProps {
  items: Item[];
  isLoading: boolean;
}

interface AppState {
  perPage: number;
  pageNum: number;
}

function mapStateToProps(state: RootState) {
  const { items, isLoading } = state.data;
  return { items, isLoading } as AppProps;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      perPage: 25,
      pageNum: 1
    }
  }

  itemsToRender() {
    // If no items loaded
    if(!this.props.items) return [];
    const items = [];
    const len = this.props.items.length;
    const [n, per] = [this.state.pageNum, this.state.perPage];
    const start = (n - 1) * per;
    const end = Math.min(start + per, len);
    for (let i = start; i < end; ++i) {
      items.push(this.props.items[i]);
    }
    return items;
  }

  maxPages() {
    const len = this.props.items.length;
    const per = this.state.perPage;
    return Math.ceil(len/per);
  }

  setPage(n: number) {
    this.setState({pageNum: n});
  }

  setPer(n: number) {
    this.setState({perPage: n});
  }

  render() {
    const items = this.itemsToRender();
    const options = [10, 25, 50];
    const pageN = this.state.pageNum;
    const maxN = this.maxPages();
    const c1 = pageN === 1;
    const c2 = pageN === maxN;
    return (
      <Container>
        <h1>Reaktor Warehouse</h1>
        <Alert show={this.props.isLoading}>Loading...</Alert>
        <ItemsTable items={items} />
        <Pagination>
          <DropdownButton title={`${this.state.perPage} per page`}>
            {
              options.map(n => 
                <Dropdown.Item
                  onClick={() => this.setPer(n)}
                >
                  {n}
                </Dropdown.Item>
              )
            }
          </DropdownButton>
          <Pagination.First
            disabled={c1}
            onClick={() => this.setPage(1)}
          />
          <Pagination.Prev 
            disabled={c1}
            onClick={() => this.setPage(pageN - 1)}
          />
          <Pagination.Item disabled>
            {`${pageN} / ${maxN}`}
          </Pagination.Item>
          <Pagination.Next 
            disabled={c2}
            onClick={() => this.setPage(pageN + 1)}
          />
          <Pagination.Last
            disabled={c2}
            onClick={() => this.setPage(maxN)}
          />
        </Pagination>
      </Container>
    );
  }
}

export default connect(mapStateToProps)(App);