import React, { useState, useEffect, useContext } from 'react';

import Button from '../../components/Button/Button';
import './TradeHistory.css';
import AddEditTradeModal from '../../components/AddEditTradeModal/AddEditTradeModal';
import AppContext from '../../context/context';

const { getTrades } = require('../../utils/get-trades');
const { dateFormatter } = require('../../utils/helper-funcs');

const TradeHistory = ({ token, user }) => {
  // CONTEXT
  const context = useContext(AppContext);

  // Initial trades and running balance
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState(0);

  // Show trade list, add trade modal and refreshes trade list
  const [showTrades, setShowTrades] = useState(true);
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [updateTrades, setUpdateTrades] = useState(false);

  // Show view trade modal and sets individual trade for modal
  const [showViewTradeModal, setShowViewTradeModal] = useState(false);
  const [singleTrade, setSingleTrade] = useState({});

  // Sets whether posting or patching a trade
  const [method, setMethod] = useState('');

  useEffect(() => {
    const balanceCalc = (trades) => {
      let balance = user.accountBalance;

      trades.forEach((trade) => {
        trade.outcome === 'Winner'
          ? (balance += trade.profitLoss + trade.swap - trade.commission)
          : (balance -= trade.profitLoss - trade.swap + trade.commission);
      });

      setBalance(balance);
    };

    const fetchTrades = async () => {
      const { trades } = await getTrades(token);

      trades.sort((a, b) => new Date(a.dateOpened) - new Date(b.dateOpened));

      setTrades(trades);
      balanceCalc(trades);
    };
    fetchTrades();
  }, [token, updateTrades, user.accountBalance, context.trades]);

  const listToggler = (event) => {
    event.preventDefault();
    setShowViewTradeModal(false);
    setShowTrades(!showTrades);
  };

  const addTradeModalToggler = (event) => {
    event.preventDefault();
    setMethod('POST');
    setSingleTrade({});
    setShowTrades(true);
    setShowViewTradeModal(false);
    setShowAddTradeModal(!showAddTradeModal);
  };

  const viewTradeModalToggler = (event, trade) => {
    event.preventDefault();
    setMethod('PATCH');
    setShowAddTradeModal(false);
    setSingleTrade(trade);
    setShowViewTradeModal(!showViewTradeModal);
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
              <p
                onClick={(event) => viewTradeModalToggler(event, trade)}
                className="view-trade"
              >
                View Trade
              </p>
            </div>
          </li>
        ))}
        {showAddTradeModal && (
          <AddEditTradeModal
            updateTrades={updateTrades}
            setUpdateTrades={setUpdateTrades}
            toggle={addTradeModalToggler}
            trade={singleTrade}
            method={method}
          />
        )}
      </ul>
    );
  } else {
    list = null;
  }

  return (
    <div className="TradeHistory">
      <div className="history-head">
        <h2>
          Trade Hi<span className="span-green">$</span>tory
        </h2>
        <Button toggle={addTradeModalToggler} styling="button-add ">
          Add Trade
        </Button>
      </div>

      <div className="history-balance">
        {!balance || balance === 0 ? (
          <p className="span-trade-prompt ml-1">
            Please set balance in 'Update Profile'
          </p>
        ) : (
          <p>Running Balance: {balance} </p>
        )}
        {!balance ||
          (balance !== 0 && (
            <Button toggle={listToggler} styling="hide-list">
              {showTrades ? 'Hide' : 'Show'} Trade List
            </Button>
          ))}
      </div>

      {list}

      {showViewTradeModal && (
        <AddEditTradeModal
          method={method}
          trade={singleTrade}
          updateTrades={updateTrades}
          setUpdateTrades={setUpdateTrades}
          toggle={viewTradeModalToggler}
        />
      )}
    </div>
  );
};

export default TradeHistory;
