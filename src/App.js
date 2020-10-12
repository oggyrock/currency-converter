import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currencyList, setCurrencyList] = useState([]);
  const [currencyNames, setCurrencyNames] = useState([]);
  const [secondInput, setSecondInput] = useState(0);
  const [firstInput, setFirstInput] = useState(0);
  const [baseConvertValue, setBaseConvertValue] = useState('EUR');
  const [convertValue, setConvertValue] = useState('EUR');
  const [favorites, setFavorites] = useState([]);
  const [days, setDays] = useState([]);
  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);

  useEffect(() => {
    fetch('http://data.fixer.io/api/latest?access_key=48ae94633d08720a55c5b80edc727945')
      .then(response => { return response.json() })
      .then(data => setCurrencyList(Object.entries(data.rates)));
    fetch('http://data.fixer.io/api/symbols?access_key=48ae94633d08720a55c5b80edc727945')
      .then(response => { return response.json() })
      .then(data => setCurrencyNames(Object.entries(data.symbols)));
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
    for (let i = 0; i < 10; i++) {
      fetch(`http://data.fixer.io/api/2020-10-${(new Date().getDate()) - i}?access_key=48ae94633d08720a55c5b80edc727945&base=${baseConvertValue}&symbols=${target.value}`)
        .then(response => { return response.json() })
        .then(data => setDays([
            ...days,
            data.rates,
          ]));
    }
  };

  return (
    <div className="App">
      <h1>Currency Converter</h1>
      <input type="number" value={firstInput} onChange={handleInput}/>
      <select value={baseConvertValue} title={getName(baseConvertValue)} onChange={handleSelect}>
        {currencyList.map(currency => (
          <option key={currency[0]} title={getName(currency[0])}>{currency[0]}</option>
        ))}
      </select>
      <br/>
      <input type="number" value={secondInput} onChange={handleSecondInput}/>
      <select value={convertValue} title={getName(convertValue)} onChange={handleSecondSelect}>
        {currencyList.map(currency => (
          <option key={currency[0]} title={getName(currency[0])}>{currency[0]}</option>
        ))}
      </select>

      <div>
        {favorites.length ? <h3>Favorite Currencies</h3> : null}
        {favorites.map(currency => (
          <div key={currency[0]}>
            <span>{getName(currency[0])}</span>
            -----
            <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
            <button value={currency[0]} onClick={handleRemove}>Remove from faves</button>
            <button value={currency[0]}>Info</button>
          </div>
        ))}
        <h3>Currencies</h3>
        {currencyList.map(currency => (
          <div key={currency[0]}>
            <span>{getName(currency[0])}</span>
            -----
            <span>{(currency[1]/getValue(baseConvertValue)).toFixed(5)}</span>
            <button value={currency} onClick={handleClick}>Add to faves</button>
            <button value={currency[0]} onClick={handleInfo}>Info</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
