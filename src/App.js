import React, { useState, useEffect } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import './App.css';


function App() {
  const [currencyList, setCurrencyList] = useState([]);
  const [secondInput, setSecondInput] = useState(0);
  const [firstInput, setFirstInput] = useState(0);
  const [baseConvertValue, setBaseConvertValue] = useState('USD');
  const [convertValue, setConvertValue] = useState('USD');
  const [favorites, setFavorites] = useState([]);
  const [days, setDays] = useState([]);
  const [choppedDays, setChoppedDays] = useState([]);
  const [isHidden, setHidden] = useState(true);

  useEffect(() => {
    fetch('https://api.exchangeratesapi.io/latest')
      .then(response => { return response.json() })
      .then(data => setCurrencyList(Object.entries(data.rates)));
  }, []);

  const handleInput = ({target}) => {
    setFirstInput(target.value);
    setSecondInput(+(target.value/getValue(baseConvertValue)*getValue(convertValue)).toFixed(2));
  };

  const handleSecondInput = ({target}) => {
    setSecondInput(target.value);
    setFirstInput(+(target.value/getValue(convertValue)*getValue(baseConvertValue)).toFixed(2));
  };

  const handleSelect = ({target}) => {
    setBaseConvertValue(target.value);
    setSecondInput(+(firstInput/getValue(target.value)*getValue(convertValue)).toFixed(2));
  };

  const handleSecondSelect = ({target}) => {
    setConvertValue(target.value);
    setSecondInput(+(firstInput/getValue(baseConvertValue)*getValue(target.value)).toFixed(2));
  };

  const getValue = (currencyToFindValue) => {
    return currencyList.find(currency => currency[0] === currencyToFindValue)[1];
  };

  const handleClick = ({target}) => {
    if (!favorites.some(currency => currency[0] === target.value.split(',')[0])) {
      setFavorites([
        ...favorites,
        target.value.split(','),
      ]);
    };
  };

  const handleRemove = ({target}) => {
    setFavorites(
      [...favorites].filter(currency => currency[0] !== target.value)
    )
  };

  const today = new Date();

  const handleInfo = ({target}) => {
    if(currencyList.find(day => day[0] === target.value)) {
      fetch(`https://api.exchangeratesapi.io/history?start_at=${today.getFullYear() - 5}-${
        (today.getMonth() < 9 ? '0': '') + (today.getMonth() + 1)
      }-${(today.getDate() < 10 ? '0': '') + today.getDate()}&end_at=${today.getFullYear()}-${
        (today.getMonth() < 9 ? '0': '') + (today.getMonth() + 1)
      }-${(today.getDate() < 10 ? '0': '') + today.getDate()}&base=${baseConvertValue}&symbols=${target.value}`)
        .then(response => { return response.json() })
        .then(data => {
          setDays(
            Object.entries(data.rates)
              .map(entry => ({date: entry[0], rate: entry[1][target.value].toFixed(3)}))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
          );
          setChoppedDays(
            Object.entries(data.rates)
              .map(entry => ({date: entry[0], rate: entry[1][target.value].toFixed(3)}))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
            );
        });
      setHidden(false);
    } else {alert('sorry, no additional info on this currency')};
  };

  const handleDays = ({target}) => {
    if(target.innerHTML === 'Last 30 days') {
      setChoppedDays([...days].splice(days.length-25))
    }
    if(target.innerHTML === 'Last 12 months') {
      setChoppedDays([...days].splice(days.length-300))
    }
    if(target.innerHTML === 'Last 5 years') {
      setChoppedDays(days)
    }
  };

  const handleClose = () => {
    setHidden(true);
  };

  return (
    <HashRouter>
      <div className="App">
        <div
          className="blurry"
          hidden={isHidden}
        ></div>
        <a href="#/">Home</a>
        {' '}
        <a href="#/currencies">Currencies</a>
        <br />
        <div>Choose your base currency</div>
        <select className="select" value={baseConvertValue} onChange={handleSelect}>
          {currencyList.map(currency => (
            <option key={currency[0]}>{currency[0]}</option>
          ))}
        </select>
        <Switch>
          <Route path="/" exact render={() =>
            <>
              <h1>Currency Converter</h1>
              <input className="input" type="number" value={firstInput} onChange={handleInput}/>
              {baseConvertValue}
              <br/>
              <input className="input" type="number" value={secondInput} onChange={handleSecondInput}/>
              <select className="select" value={convertValue} onChange={handleSecondSelect}>
                {currencyList.map(currency => (
                  <option key={currency[0]}>{currency[0]}</option>
                ))}
              </select>
            </>
          }/>
          <Route path="/currencies" render={() =>
            <div>
              {favorites.length ? <h3>Favorite Currencies</h3> : null}
              {favorites.map(currency => (
                <div className="currencyRow" key={currency[0]}>
                  <button value={currency[0]} onClick={handleInfo}>Info</button>
                  <span>{currency[0]}</span>
                  <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
                  <button value={currency[0]} onClick={handleRemove}>&#10006;</button>
                </div>
              ))}
              <h3>Currencies</h3>
              {currencyList.map(currency => (
                <div className="currencyRow" key={currency[0]}>
                  <button value={currency[0]} onClick={handleInfo}>Info</button>
                  <span>{currency[0]}</span>
                  <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
                  <button value={currency} onClick={handleClick}>&#9733;</button>
                </div>
              ))}
              <div hidden={isHidden} className="chart">
                <LineChart
                  width={500}
                  height={300}
                  data={choppedDays}
                >
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin', 'dataMax']}/>
                  <Line dataKey="rate"/>
                </LineChart>
                <button className="chartButton" onClick={handleDays}>Last 30 days</button>
                <button className="chartButton" onClick={handleDays}>Last 12 months</button>
                <button className="chartButton" onClick={handleDays}>Last 5 years</button>
                <button className="chartButton" onClick={handleClose}>X</button>
              </div>
            </div>
          }/>
        </Switch>
      </div>
    </HashRouter>
  );
}

export default App;
