/* eslint-env jasmine, jest */

import React from 'react';
import IFOPRNList from '..';
import { mount, shallow } from 'enzyme';

describe('components/IFOPRNList', () => {
    test('renders simple list', () => {
        const component = shallow(
            <FlatList
                data={[{key: 'i1'}, {key: 'i2'}, {key: 'i3'}]}
                renderItem={({item}) => <item value={item.key} />}
            />
        );
        expect(component).toMatchSnapshot();
    });
    test('renders empty list', () => {
        const component = shallow(
            <FlatList data={[]} renderItem={({item}) => <item value={item.key} />} />,
        );
        expect(component).toMatchSnapshot();
    });
    test('renders null list', () => {
        const component = shallow(
            <FlatList
                data={undefined}
                renderItem={({item}) => <item value={item.key} />}
            />,
        );
        expect(component).toMatchSnapshot();
    });
    test('renders all the bells and whistles', () => {
        const component = shallow(
            <IFOPRNList
                ItemSeparatorComponent={() => <separator />}
                ListEmptyComponent={() => <empty />}
                ListFooterComponent={() => <footer />}
                ListHeaderComponent={() => <header />}
                data={new Array(5).fill().map((_, ii) => ({id: String(ii)}))}
                keyExtractor={(item, index) => item.id}
                getItemLayout={({index}) => ({length: 50, offset: index * 50})}
                numColumns={2}
                refreshing={false}
                onRefresh={jest.fn()}
                renderItem={({item}) => <item value={item.id} />}
            />,
        );
        expect(component).toMatchSnapshot();
    });
});
