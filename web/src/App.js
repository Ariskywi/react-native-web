import React, { Component } from 'react';
import {
    AppRegistry,
    IFOPRNList,
    StyleSheet,
    Text,
    View,
    Button,
    ListView,
    TouchableOpacity,
    RefreshControl,
    Dimensions
} from '../../src';

const { height, width } = Dimensions.get('window');
var ITEM_HEIGHT = 100;

var _gCounter = 1;
function newItem() {
    return {
        id: _gCounter++,
        counter: 0
    };
}

export default class App extends Component {
    _ifoprnList
    constructor(props) {
        super(props);
        var data = Array(1000).fill().map((e,i) => newItem());
        this.state = {
            refreshing: false,
            data:data
        };
    }
    _renderItem = (item) => {
        let item1 = item;
        var txt = '第' + item1.index + '个' + ' title=' + item1.index;
        var bgColor = item1.index % 2 == 0 ? 'red' : 'blue';
        return (
            <TouchableOpacity onPress={() => {} }>
                <Text style={[{ flex: 1, height: ITEM_HEIGHT, backgroundColor: bgColor, width: width}, styles.txt]}>{txt}</Text>
            </TouchableOpacity>
        )
    }

    _header = () => {
        return <Text style={[styles.txt, { backgroundColor: 'black' }]}>这是头部</Text>;
    }

    _footer = () => {
        return <Text style={[styles.txt, { backgroundColor: 'black' }]}>这是尾部</Text>;
    }
    _separator = () => {
        return <View style={{ height: 2, backgroundColor: 'yellow' }}/>;
    }
    _onEndReached=(info) => {
        var size = 2;
        var currCount = this.state.data.length;
        var newItems = Array(size).fill().map((e,i)=>newItem());
        this.state.data.splice(currCount, 0, ...newItems);
    }
    onRefresh = () => {
        console.log("开始刷新！");
        const _this = this;
        this.setState({refreshing: true});
        setTimeout(() => {
            console.log('刷新完成');
            _this.setState({refreshing: false});

            //_gCounter = 1;
            var data = Array(4000).fill().map((e,i) => newItem());
            this.setState({
                data: data
            });


        }, 500);
    }

    componentDidUpdate(){

    }
    render() {

        return (
            <View style={{ flex: 1 }}>
                <Button title='滚动到指定位置' onPress={() => {
                    //console.log(this._ifoprnList)
                    this._ifoprnList.scrollToEnd();
                    //this._ifoprnList.scrollToIndex({viewPosition:1,index:30});
                   // this._ifoprnList.scrollToOffset({ animated: true, offset: 1062 });
                    //this._ifoprnList.scrollToItem({ animated: true, item: {id:7,counter:0},viewPosition:0 })

                }}/>
                <View style={{ flex: 1 }}>
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.onRefresh}
                        style={{ flex: 1 }}
                    >
                        <IFOPRNList
                            ref={(ifoprnList) => this._ifoprnList = ifoprnList}
                            ListHeaderComponent={this._header}
                            ListFooterComponent={this._footer}
                            ItemSeparatorComponent={this._separator}
                            renderItem={this._renderItem}
                            initialNumToRender={5}
                            windowSize={2}
                            //numColumns={2}
                            //    getItemLayout={(data, index) => (
                            //        { length: ITEM_HEIGHT, offset: ITEM_HEIGHT  * index, index }
                            //   ) }

                            data={this.state.data}>
                        </IFOPRNList>
                    </RefreshControl>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    txt: {
        textAlign: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontSize: 30,
    }
});