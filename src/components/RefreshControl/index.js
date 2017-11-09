/**
 * Copyright (c) 2017-present, Nicolas Gallagher.
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RefreshControl
 * @flow
 */

import ColorPropType from '../../propTypes/ColorPropType';
import View from '../View';
import ViewPropTypes from '../View/ViewPropTypes';
import { arrayOf, bool, func, number, oneOf, string } from 'prop-types';
import React, { Component } from 'react';
import StyleSheet from '../../apis/StyleSheet';
import ActivityIndicator from '../ActivityIndicator';

class RefreshControl extends Component {
    static propTypes = {
        ...ViewPropTypes,
        colors: arrayOf(ColorPropType),
        enabled: bool,
        onRefresh: func,
        progressBackgroundColor: ColorPropType,
        progressViewOffset: number,
        refreshing: bool.isRequired,
        size: oneOf([0, 1]),
        tintColor: ColorPropType,
        title: string,
        titleColor: ColorPropType
    };

    render() {
        const {
            /* eslint-disable */
            colors,
            enabled,
            onRefresh,
            progressBackgroundColor,
            progressViewOffset,
            refreshing,
            size,
            tintColor,
            title,
            titleColor,
            /* eslint-enable */
            ...rest
        } = this.props;

        return (
            <View {...rest} >
                <View style={styles.refreshIndicator}>
                    <ActivityIndicator size="large" style={styles.large} />
                </View>
                {this.props.children}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    refreshIndicator: {
        height: 65
    },
    large: {
        paddingTop:10,
        transform: [{ scale: 1}]
    }
});

export default RefreshControl;