/**
 * @providesModule FlatList
 * @flow
 * @format
 */
import MetroListView from '../ListView/MetroListView'; // Used as a fallback legacy option
import React from 'react';
import View from '../View';
import VirtualizedList from '../VirtualizedList';

import invariant from 'fbjs/lib/invariant';

import type {StyleObj} from '../../apis/StyleSheet/StyleSheetTypes';
import type {ViewabilityConfig, ViewToken} from 'ViewabilityHelper';
import type {Props as VirtualizedListProps} from 'VirtualizedList';

type RequiredProps<ItemT> = {

    renderItem: (info: {
                     item: ItemT,
                     index: number,
                     separators: {
                         highlight: () => void,
                         unhighlight: () => void,
                         updateProps: (select: 'leading' | 'trailing', newProps: Object) => void,
                     },
                 }) => ?React.Element<any>,
    data: ?$ReadOnlyArray<ItemT>,
};
type OptionalProps<ItemT> = {
    ItemSeparatorComponent?: ?React.ComponentType<any>,
    ListEmptyComponent?: ?(React.ComponentType<any> | React.Element<any>),
    ListFooterComponent?: ?(React.ComponentType<any> | React.Element<any>),
    ListHeaderComponent?: ?(React.ComponentType<any> | React.Element<any>),
    columnWrapperStyle?: StyleObj,
    extraData?: any,
    getItemLayout?: (
        data: ?Array<ItemT>,
        index: number,
    ) => {length: number, offset: number, index: number},
    horizontal?: ?boolean,
    initialNumToRender: number,
    initialScrollIndex?: ?number,
    inverted?: ?boolean,
    keyExtractor: (item: ItemT, index: number) => string,
    numColumns: number,
    onEndReached?: ?(info: {distanceFromEnd: number}) => void,
    onEndReachedThreshold?: ?number,
    onRefresh?: ?() => void,
    onViewableItemsChanged?: ?(info: {
                                   viewableItems: Array<ViewToken>,
                                   changed: Array<ViewToken>,
                               }) => void,
    progressViewOffset?: number,
    legacyImplementation?: ?boolean,
    refreshing?: ?boolean,
    removeClippedSubviews?: boolean,
    viewabilityConfig?: ViewabilityConfig,
};
type Props<ItemT> = RequiredProps<ItemT> &
    OptionalProps<ItemT> &
    VirtualizedListProps;

const defaultProps = {
    ...VirtualizedList.defaultProps,
    numColumns: 1,
};
type DefaultProps = typeof defaultProps;

class FlatList<ItemT> extends React.PureComponent<Props<ItemT>, void> {
    static defaultProps: DefaultProps = defaultProps;
    props: Props<ItemT>;

    _scrollMetrics = {
        contentLength: 0,
        dOffset: 0,
        dt: 10,
        offset: 0,
        timestamp: 0,
        velocity: 0,
        visibleLength: 0,
    };
    /**
     * Scrolls to the end of the content. May be janky without `getItemLayout` prop.
     */
    scrollToEnd(params?: ?{animated?: ?boolean}) {
        this._listRef.scrollToEnd(params);
    }

    /**
     * Scrolls to the item at the specified index such that it is positioned in the viewable area
     * such that `viewPosition` 0 places it at the top, 1 at the bottom, and 0.5 centered in the
     * middle. `viewOffset` is a fixed number of pixels to offset the final target position.
     *
     * Note: cannot scroll to locations outside the render window without specifying the
     * `getItemLayout` prop.
     */
    scrollToIndex(params: {
        animated?: ?boolean,
            index: number,
            viewOffset?: number,
            viewPosition?: number,
    }) {
        this._listRef.scrollToIndex(params);
    }

    /**
     * Requires linear scan through data - use `scrollToIndex` instead if possible.
     *
     * Note: cannot scroll to locations outside the render window without specifying the
     * `getItemLayout` prop.
     */
    scrollToItem(params: {
        animated?: ?boolean,
            item: ItemT,
            viewPosition?: number,
    }) {
        this._listRef.scrollToItem(params);
    }

    /**
     * Scroll to a specific content pixel offset in the list.
     *
     * Check out [scrollToOffset](docs/virtualizedlist.html#scrolltooffset) of VirtualizedList
     */
    scrollToOffset(params: {animated?: ?boolean, offset: number}) {
        this._listRef.scrollToOffset(params);
    }

    /**
     * Tells the list an interaction has occured, which should trigger viewability calculations, e.g.
     * if `waitForInteractions` is true and the user has not scrolled. This is typically called by
     * taps on items or by navigation actions.
     */
    recordInteraction() {
        this._listRef.recordInteraction();
    }

    /**
     * Displays the scroll indicators momentarily.
     *
     * @platform ios
     */
    flashScrollIndicators() {
        this._listRef.flashScrollIndicators();
    }

    /**
     * Provides a handle to the underlying scroll responder.
     */
    getScrollResponder() {
        return this._listRef && this._listRef.getScrollResponder();
    }

    getScrollableNode() {
        return this._listRef && this._listRef.getScrollableNode();
    }

    setNativeProps(props) {
        return this._listRef && this._listRef.setNativeProps(props);
    }

    componentWillMount() {
        this._checkProps(this.props);
    }

    componentWillReceiveProps(nextProps: Props<ItemT>) {
        invariant(
            nextProps.numColumns === this.props.numColumns,
            'Changing numColumns on the fly is not supported. Change the key prop on FlatList when ' +
            'changing the number of columns to force a fresh render of the component.',
        );
        this._checkProps(nextProps);
    }

    _hasWarnedLegacy = false;
    _listRef: VirtualizedList;

    _captureRef = ref => {
        /* $FlowFixMe(>=0.53.0 site=react_native_fb,react_native_oss) This comment
         * suppresses an error when upgrading Flow's support for React. To see the
         * error delete this comment and run Flow. */
        this._listRef = ref;
    };

    _checkProps(props: Props<ItemT>) {
        const {
            getItem,
            getItemCount,
            horizontal,
            legacyImplementation,
            numColumns,
            columnWrapperStyle,
        } = props;
        invariant(
            !getItem && !getItemCount,
            'FlatList does not support custom data formats.',
        );
        if (numColumns > 1) {
            invariant(!horizontal, 'numColumns does not support horizontal.');
        } else {
            invariant(
                !columnWrapperStyle,
                'columnWrapperStyle not supported for single column lists',
            );
        }
        if (legacyImplementation) {
            invariant(
                numColumns === 1,
                'Legacy list does not support multiple columns.',
            );
            // Warning: may not have full feature parity and is meant more for debugging and performance
            // comparison.
            if (!this._hasWarnedLegacy) {
                console.warn(
                    'FlatList: Using legacyImplementation - some features not supported and performance ' +
                    'may suffer',
                );
                this._hasWarnedLegacy = true;
            }
        }
    }

    _getItem = (data: Array<ItemT>, index: number) => {
        const {numColumns} = this.props;
        if (numColumns > 1) {
            const ret = [];
            for (let kk = 0; kk < numColumns; kk++) {
                const item = data[index * numColumns + kk];
                item && ret.push(item);
            }
            return ret;
        } else {
            return data[index];
        }
    };

    _getItemCount = (data: ?Array<ItemT>): number => {
        return data ? Math.ceil(data.length / this.props.numColumns) : 0;
    };

    _keyExtractor = (items: ItemT | Array<ItemT>, index: number) => {
        const {keyExtractor, numColumns} = this.props;
        if (numColumns > 1) {
            invariant(
                Array.isArray(items),
                'FlatList: Encountered internal consistency error, expected each item to consist of an ' +
                'array with 1-%s columns; instead, received a single item.',
                numColumns,
            );
            return items
                .map((it, kk) => keyExtractor(it, index * numColumns + kk))
                .join(':');
        } else {
            return keyExtractor(items, index);
        }
    };

    _pushMultiColumnViewable(arr: Array<ViewToken>, v: ViewToken): void {
        const {numColumns, keyExtractor} = this.props;
        v.item.forEach((item, ii) => {
            invariant(v.index != null, 'Missing index!');
            const index = v.index * numColumns + ii;
            arr.push({...v, item, key: keyExtractor(item, index), index});
        });
    }

    _onViewableItemsChanged = info => {
        const {numColumns, onViewableItemsChanged} = this.props;
        if (!onViewableItemsChanged) {
            return;
        }
        if (numColumns > 1) {
            const changed = [];
            const viewableItems = [];
            info.viewableItems.forEach(v =>
                this._pushMultiColumnViewable(viewableItems, v),
            );
            info.changed.forEach(v => this._pushMultiColumnViewable(changed, v));
            onViewableItemsChanged({viewableItems, changed});
        } else {
            onViewableItemsChanged(info);
        }
    };

    _renderItem = (info: Object) => {
        const {renderItem, numColumns, columnWrapperStyle} = this.props;
        if (numColumns > 1) {
            const {item, index} = info;
            invariant(
                Array.isArray(item),
                'Expected array of items with numColumns > 1',
            );
            return (
                <View style={[{flexDirection: 'row'}, columnWrapperStyle]}>
                    {item.map((it, kk) => {
                        const element = renderItem({
                            item: it,
                            index: index * numColumns + kk,
                            separators: info.separators,
                        });
                        return element && React.cloneElement(element, {key: kk});
                    })}
                </View>
            );
        } else {
            return renderItem(info);
        }
    };

    render() {
        if (this.props.legacyImplementation) {
            return (
                <MetroListView
                    {...this.props}
                    items={this.props.data}
                    ref={this._captureRef}
                />
            );
        } else {
            return (
                <VirtualizedList
                    {...this.props}
                    renderItem={this._renderItem}
                    getItem={this._getItem}
                    getItemCount={this._getItemCount}
                    keyExtractor={this._keyExtractor}
                    ref={this._captureRef}
                    onViewableItemsChanged={
                        this.props.onViewableItemsChanged && this._onViewableItemsChanged
                    }
                />
            );
        }
    }
}

export default FlatList;