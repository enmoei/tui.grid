import { h, Component } from 'preact';
import { SortState, SortingType } from '../store/types';
import { cls, hasClass, findParent } from '../helper/dom';
import { connect } from './hoc';
import { getDataProvider } from '../instance';
import { DispatchProps } from '../dispatch/create';
import { DataProvider } from '../dataSource/types';
import { findPropIndex } from '../helper/common';

interface OwnProps {
  columnName: string;
  sortingType?: SortingType;
}
interface StoreProps {
  sortState: SortState;
  dataProvider: DataProvider;
  ascending: boolean;
  defaultAscending: boolean;
  active: boolean;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SortingButtonComp extends Component<Props> {
  private handleClick = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const withCtrl = ev.ctrlKey || ev.metaKey;

    if (!hasClass(target, 'btn-sorting')) {
      return;
    }

    const { dispatch, sortState, dataProvider, defaultAscending } = this.props;
    const { columns } = sortState;
    const th = findParent(target, 'cell');
    const columnName = th!.getAttribute('data-column-name')!;
    const index = findPropIndex('columnName', columnName, columns);
    const ascending = index !== -1 ? !columns[index].ascending : defaultAscending;

    if (sortState.useClient) {
      dispatch('sort', columnName, ascending, withCtrl);
    } else {
      // @TODO: apply multi sort to dataSource
      const data =
        ascending === defaultAscending && index !== -1
          ? {}
          : {
              sortColumn: columnName,
              sortAscending: ascending
            };
      dataProvider.readData(1, data, true);
    }
  };

  public render() {
    const { active, ascending } = this.props;

    return (
      <a
        class={cls('btn-sorting', [active, ascending ? 'btn-sorting-up' : 'btn-sorting-down'])}
        onClick={this.handleClick}
      />
    );
  }
}

export const SortingButton = connect<StoreProps, OwnProps>((store, props) => {
  const {
    data: { sortState },
    id
  } = store;
  const { columnName, sortingType = 'asc' } = props;
  const { columns } = sortState;

  const index = findPropIndex('columnName', columnName, columns);
  const ascending = index !== -1 ? columns[index].ascending : true;

  return {
    sortState,
    ascending,
    dataProvider: getDataProvider(id),
    defaultAscending: sortingType === 'asc',
    active: index !== -1
  };
})(SortingButtonComp);
