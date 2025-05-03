import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaXTwitter, FaGithub, FaTelegram } from 'react-icons/fa6';
import './waitlist.css';

const LoadingBar = ({ progress }) => {
  return (
    <div className="loading-bar">
      <div className="loading-bar-progress" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [solAddress, setSolAddress] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [command, setCommand] = useState('');
  const [isFormUnlocked, setIsFormUnlocked] = useState(false);
  const [isSolAddressSubmitted, setIsSolAddressSubmitted] = useState(false);
  const [isFollowVerified, setIsFollowVerified] = useState(false);
  const [commandError, setCommandError] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasStarted, setHasStarted] = useState(false);
  const [startCommand, setStartCommand] = useState('');
  const [startError, setStartError] = useState('');
  const [progress, setProgress] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [solAddressError, setSolAddressError] = useState('');
  const [xHandleError, setXHandleError] = useState('');

  const correctCommand = 'join lysa';
  const correctStartCommand = 'start';
  const waitlistUrl = 'https://lysa-dev.vercel.app';
  const shareText = 'Just joined the LYΣA waitlist! Sign up now!';
  const loadingMessages = [
    'Validating Solana address...',
    'Validating email...',
    'Connecting to server...',
    'Adding to waitlist...',
    'Processing submission...',
  ];
  const lysaXHandle = '@exe_01ySA';
  const xProfileUrl = 'https://x.com/exe_01ySA';

  const targetDate = new Date('2025-06-30T12:00:00Z').getTime();

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [targetDate]);

  useEffect(() => {
    let messageInterval;
    if (isLoading) {
      messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 1000);
    }
    return () => clearInterval(messageInterval);
  }, [isLoading, loadingMessages.length]);

  const handleStartSubmit = (e) => {
    e.preventDefault();
    if (startCommand.toLowerCase() === correctStartCommand) {
      setHasStarted(true);
      setStartError('');
      setProgress(20);
    } else {
      setStartError('Error: Invalid command. Try "start".');
      setStartCommand('');
    }
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (command.toLowerCase() === correctCommand) {
      setIsFormUnlocked(true);
      setCommandError('');
      setProgress(40);
    } else {
      setCommandError('Error: Invalid command. Try "join lysa".');
      setCommand('');
    }
  };

  const handleVerifyFollow = (e) => {
    e.preventDefault();
    const cleanXHandle = xHandle.trim().replace(/^@/, '');
    const xHandleRegex = /^[A-Za-z0-9_]{1,15}$/;
    
    if (!xHandleRegex.test(cleanXHandle)) {
      setXHandleError('Error: Invalid X handle. Must be 1-15 characters (letters, numbers, underscores).');
      return;
    }
    
    setXHandleError('');
    setIsFollowVerified(true);
    setProgress(60);
    console.log('Follow verification assumed (manual):', cleanXHandle);
  };

  const handleSolAddressSubmit = (e) => {
    e.preventDefault();
    const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{44}$/;
    if (!solAddressRegex.test(solAddress)) {
      setSolAddressError('Error: Invalid Solana address. Must be a 44-character Base58 string.');
      return;
    }
    setSolAddressError('');
    setIsSolAddressSubmitted(true);
    setProgress(80);
    console.log('Solana address submitted:', solAddress);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
      setEmailError('Error: Invalid email format.');
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/waitlist`,
        { solAddress, email, xHandle: xHandle.trim().replace(/^@/, '') },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setIsLoading(false);
      setShowPopup(true);
      setProgress(100);
      setEmail('');
      setSolAddress('');
      setXHandle('');
      setIsSolAddressSubmitted(false);
      setIsFollowVerified(false);
      console.log('Waitlist submission successful:', response.data);
    } catch (error) {
      setIsLoading(false);
      setEmailError(error.response?.data?.error || 'Failed to join waitlist. Please try again.');
      console.error('Waitlist submission error:', error);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleShareX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(
      `${shareText} ${waitlistUrl}`
    )}`;
    window.open(url, '_blank');
  };

  const handleShareWeb = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join the LYΣA Waitlist',
          text: shareText,
          url: waitlistUrl,
        });
      } catch (error) {
        console.error('Web Share API failed:', error);
      }
    } else {
      navigator.clipboard.writeText(waitlistUrl);
      alert('Link copied to clipboard! Share it manually.');
    }
  };

  return (
    <div className="waitlist-container">
      <LoadingBar progress={progress} />
      {!hasStarted ? (
        <div className="cmd-game start-prompt">
          <p className="cmd-prompt">C:\User\LYΣA> </p>
          <form onSubmit={handleStartSubmit} className="cmd-form">
            <input
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder="Type 'start' to continue"
              className="cmd-input"
              autoFocus
            />
            <button type="submit" className="cmd-submit">
              Execute
            </button>
          </form>
          {startError && <p className="cmd-error">{startError}</p>}
        </div>
      ) : (
        <>
          <h1 className="title">LYΣA Universe</h1>
          <div className="intro-text">
            <p>> LYΣA: The Future of AI Interaction</p>
            <p>> Join the waitlist for our beta release and be the first to experience a revolutionary AI platform.</p>
          </div>
          {!isFormUnlocked ? (
            <div className="cmd-game">
              <p className="cmd-prompt">C:\LYΣA> </p>
              <form onSubmit={handleCommandSubmit} className="cmd-form">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Type 'join lysa' to unlock"
                  className="cmd-input"
                  autoFocus
                />
                <button type="submit" className="cmd-submit">
                  Execute
                </button>
              </form>
              {commandError && <p className="cmd-error">{commandError}</p>}
            </div>
          ) : isLoading ? (
            <div className="cmd-loading">
              <span className="cmd-text">{loadingMessages[loadingMessageIndex]}</span>
              <span className="cmd-cursor">█</span>
              <div className="cmd-timer">
                [DAYS: {timeRemaining.days}] [HOURS: {timeRemaining.hours}] [MINUTES: {timeRemaining.minutes}] [SECONDS: {timeRemaining.seconds}]
              </div>
            </div>
          ) : !isSolAddressSubmitted ? (
            <div className="form-container">
              {!isFollowVerified ? (
                <div className="x-handle-section">
                  <label htmlFor="x-handle-display" className="x-handle-label">
                    Follow us on X to proceed:
                  </label>
                  <div className="x-handle-input-group">
                    <input
                      id="x-handle-display"
                      type="text"
                      value={lysaXHandle}
                      readOnly
                      className="x-handle-input"
                      title="LYΣA's X handle"
                    />
                    <a
                      href={xProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="follow-button"
                    >
                      Follow
                    </a>
                  </div>
                  <p className="follow-instruction">
                    Please follow {lysaXHandle} on X, then enter your X handle below to continue.
                  </p>
                  <form onSubmit={handleVerifyFollow} className="waitlist-form">
                    <input
                      id="x-handle"
                      type="text"
                      value={xHandle}
                      onChange={(e) => setXHandle(e.target.value)}
                      placeholder="Enter your X handle (e.g., @username)"
                      className="email-input"
                      required
                    />
                    <button type="submit" className="submit-button">
                      Verify Follow
                    </button>
                  </form>
                  {xHandleError && <p className="cmd-error">{xHandleError}</p>}
                </div>
              ) : (
                <div className="sol-address-section">
                  <p className="follow-verified">Thank you for following {lysaXHandle}! Enter your Solana address to continue.</p>
                  <form onSubmit={handleSolAddressSubmit} className="waitlist-form">
                    <input
                      type="text"
                      value={solAddress}
                      onChange={(e) => setSolAddress(e.target.value)}
                      placeholder="Enter your Solana address"
                      className="email-input"
                      required
                    />
                    <button type="submit" className="submit-button">
                      Submit SOL Address
                    </button>
                  </form>
                  {solAddressError && <p className="cmd-error">{solAddressError}</p>}
                </div>
              )}
              <div className="cmd-timer">
                [DAYS: {timeRemaining.days}] [HOURS: {timeRemaining.hours}] [MINUTES: {timeRemaining.minutes}] [SECONDS: {timeRemaining.seconds}]
              </div>
            </div>
          ) : (
            <div className="form-container">
              <form onSubmit={handleEmailSubmit} className="waitlist-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="email-input"
                  required
                />
                <button type="submit" className="submit-button">
                  Join Waitlist
                </button>
              </form>
              {emailError && <p className="cmd-error">{emailError}</p>}
              <div className="cmd-timer">
                [DAYS: {timeRemaining.days}] [HOURS: {timeRemaining.hours}] [MINUTES: {timeRemaining.minutes}] [SECONDS: {timeRemaining.seconds}]
              </div>
            </div>
          )}
          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h2 className="popup-title">Success!</h2>
                <p className="popup-message">Successfully joined the LYΣA waitlist!</p>
                <div className="share-buttons">
                  <button className="share-button" onClick={handleShareX}>
                    Share on X
                  </button>
                  <button className="share-button" onClick={handleShareWeb}>
                    Share
                  </button>
                </div>
                <button className="popup-button" onClick={closePopup}>
                  Close
                </button>
                <div className="cmd-timer">
                  [DAYS: {timeRemaining.days}] [HOURS: {timeRemaining.hours}] [MINUTES: {timeRemaining.minutes}] [SECONDS: {timeRemaining.seconds}]
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <footer className="footer">
        <p>> © 2025 LYΣA.</p>
        <div className="social-icons">
          <p>
            <a href="https://x.com/exe_01ySA?t=_TzMX5dPmWHwtMUcFDkmcA&s=09" target="_blank" rel="noopener noreferrer">
              <FaXTwitter />
            </a>{' '}
            |{' '}
            <a href="https://t.me/exe_01ySA" target="_blank" rel="noopener noreferrer">
              <FaTelegram />
            </a>{' '}
            |{' '}
            <a href="https://github.com/LY-S-A" target="_blank" rel="noopener noreferrer">
              <FaGithub />
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;
