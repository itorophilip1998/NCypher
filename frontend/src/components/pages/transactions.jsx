import React, { useState, useEffect } from "react";
import Navbar from "../common/Navbar";
import axios from "axios";

const Transactions = () => {
  const [interval, setIntervalState] = useState(1); // Interval in minutes
  const [refreshTime, setRefreshTime] = useState(0); // Refresh countdown in seconds
  const [transactions, setTransactions] = useState([]); // Store transactions
  const [isCronActivated, setIsCronActivated] = useState(false); // Track if cron job is activated
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

  // Function to fetch live transactions from the backend
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/cron/transactions`);
      console.debug(response);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions: ", error);
    }
  };

  useEffect(() => {
    let intervalId;

    if (isCronActivated && refreshTime > 0) {
      intervalId = setInterval(() => {
        setRefreshTime((prev) => {
          if (prev === 1) {
            fetchTransactions();
            return interval * 60; // Reset countdown to the selected interval in seconds
          }
          return prev - 1; // Decrease countdown by 1 second
        });
      }, 1000); // Runs every second
    }

    return () => clearInterval(intervalId);
  }, [isCronActivated, refreshTime, interval]); // Dependencies include interval and refreshTime

  // Function to call backend and set the cron job interval
  const setCronJobInterval = async () => {
    try {
      await axios.post(`${apiUrl}/api/cron/set-cron-interval`, { interval }); // Backend route to set cron job
      setIsCronActivated(true); // Activate the cron job
      setRefreshTime(interval * 60); // Set countdown based on the input interval (converted to seconds)
      console.log("Cron job interval set successfully");
    } catch (error) {
      console.error("Error setting cron job interval: ", error);
    }
  };

  // Convert refreshTime to display minutes and seconds
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `0${minutes}:${seconds}s`;
  };
const truncateString = (str, frontChars = 18, backChars = 6) => {
  if (!str) return ""; // Handle empty string or null
  return `${str.slice(0, frontChars)}...${str.slice(-backChars)}`;
};
  return (
    <React.Fragment>
      <Navbar />
      <div className="bg-gray-900 flex flex-col items-center justify-center pt-[4rem]">
        {/* Heading */}
        <h1 className="text-white text-4xl font-bold mb-4 font-[Nippo]">
          Transactions
        </h1>

        {/* Input and Button Section */}
        <div className="my-[4rem]">
          <p className="text-gray-400 mb-4 font-[Nippo] text-1xl">
            Enter the interval in minutes
          </p>
          <input
            type="number"
            value={interval}
            onChange={(e) => setIntervalState(parseInt(e.target.value))}
            className="p-3 w-[400px] font-[Nippo] text-center text-2xl rounded bg-gray-100 text-gray-800 border-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={setCronJobInterval}
            className="clipButton font-[Nippo] w-[130px] flex mt-4"
          >
            Set interval
          </button>

          {/* Refresh Info (only show if cron is activated) */}
          {isCronActivated && refreshTime ? (
            <p className="text-gray-400 mb-8 mt-5 flex items-center ">
              Your transactions will be refreshed in{" "}
              <p className="text-green-500 border-gray-800 rounded-lg border text-2xl text-center ml-2 p-2 w-[6rem] text-bold font-[Nippo]">
                {formatTime(refreshTime)}
              </p>
            </p>
          ) : null}
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto w-full h-screen">
          <table className="min-w-full bg-gray-800 text-white rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left">HASH</th>
                <th className="p-3 text-left">AMOUNT</th>
                <th className="p-3 text-left">SENDER</th>
                <th className="p-3 text-left">RECEIVER</th>
                <th className="p-3 text-left">BLOCK HEIGHT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-3 text-sm">
                      {truncateString(transaction?.Transaction?.Hash)}
                    </td>
                    <td className="p-3 text-sm">
                      {transaction?.Transfer?.Amount}{" "}
                      {transaction?.Transfer?.Currency?.Symbol}
                    </td>
                    <td className="p-3 text-sm">
                      {truncateString(transaction?.Transfer?.Sender)}
                    </td>
                    <td className="p-3 text-sm">
                      {truncateString(transaction?.Transfer?.Receiver)}
                    </td>
                    <td className="p-3 text-sm">{transaction.blockHeight?? "16538"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Transactions;
