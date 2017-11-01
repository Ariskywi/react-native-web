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
    /**
     * For simplicity, data is just a plain array. If you want to use something else, like an
     * immutable list, use the underlying `VirtualizedList` directly.
     */
    data: ?$ReadOnlyArray<ItemT>,
};
type OptionalProps<ItemT> = {
    /**
     * Rendered in between each item, but not at the top or bottom. By default, `highlighted` and
     * `leadingItem` props are provided. `renderItem` provides `separators.highlight`/`unhighlight`
     * which will update the `highlighted` prop, but you can also add custom props with
     * `separators.updateProps`.
     */
    ItemSeparatorComponent?: ?React.ComponentType<any>,
    /**
     * Rendered when the list is empty. Can be a React Component Class, a render function, or
     * a rendered element.
     */
    ListEmptyComponent?: ?(React.ComponentType<any> | React.Element<any>),
    /**
     * Rendered at the bottom of all the items. Can be a React Component Class, a render function, or
     * a rendered element.
     */
    ListFooterComponent?: ?(React.ComponentType<any> | React.Element<any>),
    /**
     * Rendered at the top of all the items. Can be a React Component Class, a render function, or
     * a rendered element.
     */
    ListHeaderComponent?: ?(React.ComponentType<any> | React.Element<any>),
    /**
     * Optional custom style for multi-item rows generated when numColumns > 1.
     */
    columnWrapperStyle?: StyleObj,
    /**
     * A marker property for telling the list to re-render (since it implements `PureComponent`). If
     * any of your `renderItem`, Header, Footer, etc. functions depend on anything outside of the
     * `data` prop, stick it here and treat it immutably.
     */
    extraData?: any,
    /**
     * `getItemLayout` is an optional optimizations that let us skip measurement of dynamic content if
     * you know the height of items a priori. `getItemLayout` is the most efficient, and is easy to
     * use if you have fixed height items, for example:
     *
     *     getItemLayout={(data, index) => (
   *       {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
   *     )}
     *
     * Adding `getItemLayout` can be a great performance boost for lists of several hundred items.
     * Remember to include separator length (height or width) in your offset calculation if you
     * specify `ItemSeparatorComponent`.
     */
    getItemLayout?: (
        data: ?Array<ItemT>,
        index: number,
    ) => {length: number, offset: number, index: number},
    /**
     * If true, renders items next to each other horizontally instead of stacked vertically.
     */
    horizontal?: ?boolean,
    /**
     * How many items to render in the initial batch. This should be enough to fill the screen but not
     * much more. Note these items will never be unmounted as part of the windowed rendering in order
     * to improve perceived performance of scroll-to-top actions.
     */
    initialNumToRender: number,
    /**
     * Instead of starting at the top with the first item, start at `initialScrollIndex`. This
     * disables the "scroll to top" optimization that keeps the first `initialNumToRender` items
     * always rendered and immediately renders the items starting at this initial index. Requires
     * `getItemLayout` to be implemented.
     */
    initialScrollIndex?: ?number,
    /**
     * Reverses the direction of scroll. Uses scale transforms of -1.
     */
    inverted?: ?boolean,
    /**
     * Used to extract a unique key for a given item at the specified index. Key is used for caching
     * and as the react key to track item re-ordering. The default extractor checks `item.key`, then
     * falls back to using the index, like React does.
     */
    keyExtractor: (item: ItemT, index: number) => string,
    /**
     * Multiple columns can only be rendered with `horizontal={false}` and will zig-zag like a
     * `flexWrap` layout. Items should all be the same height - masonry layouts are not supported.
     */
    numColumns: number,
    /**
     * Called once when the scroll position gets within `onEndReachedThreshold` of the rendered
     * content.
     */
    onEndReached?: ?(info: {distanceFromEnd: number}) => void,
    /**
     * How far from the end (in units of visible length of the list) the bottom edge of the
     * list must be from the end of the content to trigger the `onEndReached` callback.
     * Thus a value of 0.5 will trigger `onEndReached` when the end of the content is
     * within half the visible length of the list.
     */
    onEndReachedThreshold?: ?number,
    /**
     * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make
     * sure to also set the `refreshing` prop correctly.
     */
    onRefresh?: ?() => void,
    /**
     * Called when the viewability of rows changes, as defined by the `viewabilityConfig` prop.
     */
    onViewableItemsChanged?: ?(info: {
                                   viewableItems: Array<ViewToken>,
                                   changed: Array<ViewToken>,
                               }) => void,
    /**
     * Set this when offset is needed for the loading indicator to show correctly.
     * @platform android
     */
    progressViewOffset?: number,
    legacyImplementation?: ?boolean,
    /**
     * Set this true while waiting for new data from a refresh.
     */
    refreshing?: ?boolean,
    /**
     * Note: may have bugs (missing content) in some circumstances - use at your own risk.
     *
     * This may improve scroll performance for large lists.
     */
    removeClippedSubviews?: boolean,
    /**
     * See `ViewabilityHelper` for flow type and further documentation.
     */
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