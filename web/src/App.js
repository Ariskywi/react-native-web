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

var _gCounter = 1;
function newItem() {
    return {
        id: _gCounter++,
        counter: 0
    };
}

export default class App extends Component {

    constructor(props) {
        super(props);
        var data = Array(20).fill().map((e,i) => newItem());
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
    _onEndReached=(info) => {
        // alert("到底部啦！");
        var size = 2;
        var currCount = this.state.data.length;
        var newItems = Array(size).fill().map((e,i)=>newItem());
        setTimeout(() => {
            _this.state.data.splice(currCount, 0, ...newItems);

        }, 3000);
    }
    onRefresh = () => {
        console.log("开始刷新！");
        const _this = this;
        this.setState({refreshing: true});
        setTimeout(() => {
            console.log('刷新完成');
            _this.setState({refreshing: false});

            //_gCounter = 1;
            var data = Array(40).fill().map((e,i) => newItem());
            this.setState({
                data: data
            });


        }, 1000);
    }

    componentDidUpdate(){

    }
    render() {

        return (
            <View style={{ flex: 1 }}>
                <Button title='滚动到指定位置' onPress={() => {
                    //this._ifoprnList.scrollToEnd();
                    //this._ifoprnList.scrollToIndex({viewPosition:0,index:8});
                    this._IFOPRNList.scrollToOffset({ animated: true, offset: 2000 });
                } }/>
                <View style={{ flex: 1 }}>
                    <IFOPRNList
                        ref={(ifoprnList) => this._ifoprnList = ifoprnList}
                        ListHeaderComponent={this._header}
                        ListFooterComponent={this._footer}
                        ItemSeparatorComponent={this._separator}
                        renderItem={this._renderItem}
                        initialNumToRender={5}
                        numColumns ={2}
                        columnWrapperStyle={{ borderWidth: 2, borderColor: 'black' }}
                        getItemLayout={(data, index) => (
                            { length: ITEM_HEIGHT, offset: (ITEM_HEIGHT + 2) * index, index }
                        ) }
                        //onEndReached={this._onEndReached}
                        refreshing={this.state.refreshing}
                        onRefresh={this.onRefresh}
                        data={this.state.data}>
                    </IFOPRNList>
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