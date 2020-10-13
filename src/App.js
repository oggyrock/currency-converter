import React, { useState, useEffect } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import './App.css';


function App() {
  const [currencyList, setCurrencyList] = useState([]);
  const [shortCurrencyList, setShortList] = useState([]);
  const [currencyNames, setCurrencyNames] = useState([]);
  const [secondInput, setSecondInput] = useState(0);
  const [firstInput, setFirstInput] = useState(0);
  const [baseConvertValue, setBaseConvertValue] = useState('EUR');
  const [convertValue, setConvertValue] = useState('EUR');
  const [favorites, setFavorites] = useState([]);
  const [days, setDays] = useState([]);
  const [choppedDays, setChoppedDays] = useState([]);
  const [isHidden, setHidden] = useState(true);

  useEffect(() => {
    fetch('http://data.fixer.io/api/latest?access_key=48ae94633d08720a55c5b80edc727945')
      .then(response => { return response.json() })
      .then(data => setCurrencyList(Object.entries(data.rates)));
    fetch('http://data.fixer.io/api/symbols?access_key=48ae94633d08720a55c5b80edc727945')
      .then(response => { return response.json() })
      .then(data => setCurrencyNames(Object.entries(data.symbols)));
    fetch('https://api.exchangeratesapi.io/latest')
      .then(response => { return response.json() })
      .then(data => setShortList(Object.entries(data.rates)));
  }, []);

  const getName = (currencyToFind) => {
    const name = currencyNames.find(currency => currency[0] === currencyToFind);
    return name ? name[1] : '';
  };

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

  const handleInfo = ({target}) => {
    if(shortCurrencyList.find(day => day[0] === target.value)) {
      fetch(`https://api.exchangeratesapi.io/history?start_at=2015-10-10&end_at=2020-10-10&symbols=${target.value}`)
        .then(response => { return response.json() })
        .then(data => {
          setDays(
            Object.entries(data.rates)
              .map(entry => ({date: entry[0], rate: entry[1][target.value]}))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
          );
          setChoppedDays(
            Object.entries(data.rates)
              .map(entry => ({date: entry[0], rate: entry[1][target.value]}))
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
        <select className="select" value={baseConvertValue} title={getName(baseConvertValue)} onChange={handleSelect}>
          {currencyList.map(currency => (
            <option key={currency[0]} title={getName(currency[0])}>{currency[0]}</option>
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
              <select className="select" value={convertValue} title={getName(convertValue)} onChange={handleSecondSelect}>
                {currencyList.map(currency => (
                  <option key={currency[0]} title={getName(currency[0])}>{currency[0]}</option>
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
                  <span>{getName(currency[0])}</span>
                  <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
                  <button value={currency[0]} onClick={handleRemove}>Remove from faves</button>
                </div>
              ))}
              <h3>Currencies</h3>
              {shortCurrencyList.map(currency => (
                <div className="currencyRow" key={currency[0]}>
                  <button value={currency[0]} onClick={handleInfo}>Info</button>
                  <span>{getName(currency[0])}</span>
                  <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
                  <button value={currency} onClick={handleClick}>Add to faves</button>
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
