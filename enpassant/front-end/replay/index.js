import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const root = document.getElementById('root');
const my_color = JSON.parse(document.getElementById('my_color').textContent)
const me = JSON.parse(document.getElementById('me').textContent)
const opponent = JSON.parse(document.getElementById('opponent').textContent)
const pgn = JSON.parse(document.getElementById('pgn').textContent)


ReactDOM.render(
    <React.StrictMode>
        <App color={my_color} me={me} opponent={opponent} pgn={pgn}/>
    </React.StrictMode>,
    root
);

