import React, { Component } from 'react';
import {
    AppRegistry,
    FlatList,
    StyleSheet,
    Text,
    View,
    Button,
    ListView,
    TouchableOpacity,
    Dimensions
} from '../../src';

// export class App extends Component {
//     constructor(props) {
//         super(props);
//         var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
//         this.state = {
//             dataSource: ds.cloneWithRows(['row 1', 'row 2']),
//         };
//     }
//     render() {
//         return (
//             <ListView
//                 dataSource={this.state.dataSource}
//                 renderRow={(rowData) => <Text>{rowData}</Text>}
//             />
//         );
//     }
// }
const { height, width } = Dimensions.get('window');
var ITEM_HEIGHT = 100;


export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            refreshing: false
        };
    }
    _renderItem = (item) => {
        let item1 = item;
        var txt = '第' + item1.index + '个' + ' title=' + item1.item.title;
        var bgColor = item1.index % 2 == 0 ? 'red' : 'blue';
        return (
            <TouchableOpacity onPress={() => {
                alert(txt);
            } }>
                <Text style={[{ flex: 1, height: ITEM_HEIGHT, backgroundColor: bgColor, width: width / 2 }, styles.txt]}>{txt}</Text>
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
    onRefresh = () => {
        console.log("开始刷新！");
        const _this = this;
        this.setState({refreshing: true});
        setTimeout(() => {
            console.log('刷新完成');
            _this.setState({refreshing: false});
            // // 准备下拉刷新的5条数据
            // const rowData = Array.from(new Array(5))
            //     .map((val, i) => ({
            //         text: '刷新行 ' + (+this.state.loaded + i)
            //     }))
            //     .concat(this.state.rowData);
            //
            // this.setState({
            //     loaded: this.state.loaded + 5,
            //     refreshing: false,
            // });
        }, 900);
    }

    componentDidUpdate(){

    }
    render() {
        var data = [];
        for (var i = 0; i < 31; i++) {
            data.push({ key: i, title: i + '' });
        }
        return (
            <View style={{ flex: 1 }}>
                <Button title='滚动到指定位置' onPress={() => {
                    //this._flatList.scrollToEnd();
                    //this._flatList.scrollToIndex({viewPosition:0,index:8});
                    this._flatList.scrollToOffset({ animated: true, offset: 2000 });
                } }/>
                <View style={{ flex: 1 }}>
                    <FlatList
                        ref={(flatList) => this._flatList = flatList}
                        ListHeaderComponent={this._header}
                        ListFooterComponent={this._footer}
                        ItemSeparatorComponent={this._separator}
                        renderItem={this._renderItem}


                        numColumns ={2}
                        columnWrapperStyle={{ borderWidth: 2, borderColor: 'black' }}
                        refreshing={this.state.refreshing}
                        getItemLayout={(data, index) => (
                            { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 2) * index, index }
                        ) }
                        onRefresh={this.onRefresh}
                        onEndReachedThreshold={0.1}
                        onEndReached={(info) => {
                            alert('滑动到底部！')
                        } }

                        onViewableItemsChanged={(info) => {
                            //    alert("可见不可见触发");
                        } }
                        data={data}>
                    </FlatList>
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