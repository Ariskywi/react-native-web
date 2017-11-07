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
import Text from '../Text'

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

    _onRefresh() {
        this.props.onRefresh && this.props.onRefresh();
        // The native component will start refreshing so force an update to
        // make sure it stays in sync with the js component.
        this.forceUpdate();
    }

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
            <Text style={styles.mask}>这是一个刷新标记！</Text>
        </View>
    );
  }
}
const styles = StyleSheet.create({
    mask: {
        flex: 1,
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 50,
        borderColor: '#d6d7da'
    }
});

export default RefreshControl;
