import App from './src/App';
import React from 'react';
import { AppRegistry } from '../src';

// App registration and rendering
AppRegistry.registerComponent('App', () => App)
AppRegistry.runApplication('App', {
    rootTag: document.getElementById('app')
})