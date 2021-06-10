import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'

const username = JSON.parse(document.getElementById('username').textContent)
const firstName = JSON.parse(document.getElementById('first_name').textContent)
const lastName = JSON.parse(document.getElementById('last_name').textContent)
const countryName = JSON.parse(document.getElementById('country_name').textContent)
const countryFlag = JSON.parse(document.getElementById('country_flag').textContent)
const picture = JSON.parse(document.getElementById('picture').textContent)
const elo = JSON.parse(document.getElementById('elo').textContent)
const gamesPlayed = JSON.parse(document.getElementById('games_played').textContent)
const email = JSON.parse(document.getElementById('email').textContent)
const mine = document.getElementById('mine').innerText !== 'false'
const root = document.getElementById('root')

ReactDOM.render(
    <React.StrictMode>
        <App
            username={username}
            firstName={firstName}
            lastName={lastName}
            countryName={countryName}
            countryFlag={countryFlag}
            picture={picture}
            elo={elo}
            gamesPlayed={gamesPlayed}
            email={email}
            mine={mine}
        />
    </React.StrictMode>,
    root
)

