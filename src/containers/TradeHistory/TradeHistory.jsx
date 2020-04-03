import React, { useState, useEffect } from 'react';

import Button from '../../components/Button/Button';
import './TradeHistory.css';
import AddTradeModal from '../../components/AddTradeModal/AddTradeModal';

const { getTrades } = require('../../utils/get-trades');

const TradeHistory = ({ token, user }) => {
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState(0);
  const [showTrades, setShowTrades] = useState(true);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [updateTrades, setUpdateTrades] = useState(false);

  useEffect(() => {
    const fetchTrades = async () => {
      const { trades } = await getTrades(token);

      trades.sort((a, b) => new Date(a.dateOpened) - new Date(b.dateOpened));

      setTrades(trades);
      balanceCalc(trades);
    };
    fetchTrades();
  }, [token, updateTrades]);

  const balanceCalc = trades => {
    let balance = user.accountBalance;

    trades.forEach(trade => {
      trade.outcome === 'Winner'
        ? (balance += trade.profitLoss)
        : (balance -= trade.profitLoss);
    });

    setBalance(balance);
  };

  const dateFormatter = date => {
    return date
      .toString()
      .replace(/-/g, '/')
      .slice(2, 10)
      .split('/')
      .reverse()
      .join('/');
  };

  const listToggler = event => {
    event.preventDefault();
    setShowTrades(!showTrades);
  };

  const modalToggle = event => {
    event.preventDefault();

    setShowAddTradeModal(!showAddTradeModal);
  };

  let list;

  if (showTrades) {
    list = (
      <ul>
        {trades.map((trade, index) => (
          <li key={index} className="trade-list">
            <div className={trade.outcome.toLowerCase()}>
              <p>{trade.currencyPair}</p>
              <p>{trade.outcome} </p>
            </div>

            <div className={trade.outcome.toLowerCase()}>
              <p> Opened: {dateFormatter(trade.dateOpened)} </p>
              <p> Closed: {dateFormatter(trade.dateClosed)} </p>
            </div>

            <div className={trade.outcome.toLowerCase()}>
              <p>
                {trade.outcome === 'Winner' ? 'Profit' : 'Loss'}:{' '}
                {trade.profitLoss || 'N/A'}
              </p>
              <p className="view-trade">View Trade</p>
            </div>
          </li>
        ))}
      </ul>
    );
  } else {
    list = null;
  }

  return (
    <div className="TradeHistory">
      <div className="history-head">
        <h2 className="m-1">
          Trade Hi<span className="span-green">$</span>tory
        </h2>
        <Button toggle={modalToggle} styling="button-add m-1">
          Add Trade
        </Button>
      </div>

      <div className="history-balance ml-1 mr-1">
        <p>Running Balance: {balance} </p>
        <Button toggle={listToggler} styling="hide-list">
          {showTrades ? 'Hide' : 'Show'} Trade List
        </Button>
      </div>
      {list}

      {showAddTradeModal && (
        <AddTradeModal
          updateTrades={updateTrades}
          setUpdateTrades={setUpdateTrades}
          toggle={modalToggle}
        />
      )}
    </div>
  );
};

export default TradeHistory;
