'use client';
import { useState, useEffect, useRef } from "react";
import Image from "next/image"; // OPTIMIZED IMAGES
import { EllipsisVertical, X, RotateCcw, History, Settings, User } from "lucide-react"; //ICONS
import { Montserrat } from 'next/font/google'; //IMPORT FONT
import { ScrollArea } from "@/components/UI/scroll-area"; //SCROLL BAR
import axios from 'axios'; //REQUEST AND HANDLE RESPONSE
import ReactMarkdown from 'react-markdown';  // TEXT MARKDOWN
import remarkGfm from 'remark-gfm'; // GITHUB FLAVORED MARKDOWN
import styles from './Overlay.module.css'; //STYLING
import { AnimatePresence, motion } from "framer-motion"; //ANIMATIONS

// LOAD FONT - MONTSERRAT
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

// List of predefined actions (floating buttons)
const actions = [
  { id: 1, text: "📄 Create new project" },
  { id: 2, text: "⏰ Change duration" },
  { id: 3, text: "🗂 Create new resource" },
  { id: 4, text: "🛤 Create new route" },
  { id: 5, text: "🔄 Update project" },
  { id: 6, text: "🔍 Search resources" },
  { id: 7, text: "📆 Set deadline" },
  { id: 8, text: "📝 Add new task" },
  { id: 9, text: "🎯 Create new milestone" },
  { id: 10, text: "🚀 Start new sprint" },
];

// OVERLAY BUBBLE - CHATBOX OPEN
const Overlay = () => {
  const [messages, setMessages] = useState([{ id: 1, text: "Hello! How can I assist you today?", username: "assistant" }]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [filteredActions, setFilteredActions] = useState([]); // State for filtered actions
  const [menuOpen, setMenuOpen] = useState(false); // Toggle state menu
  const menuRef = useRef(null); // Reference for detecting clicks outside the menu
  const chatBoxRef = useRef(null); // Reference for detecting clicks outside the chatbox
  const lastMessageRef = useRef(null);

  // Scroll to the last message when messages update
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Define resetChat function to clear chat history
  const resetChat = () => {
    setMessages([{ id: 1, text: "Hello! How can I assist you today?", username: "assistant" }]);
  };

  // 3 DOT MENU TOGGLE

  const toggleMenu = () => setMenuOpen(!menuOpen);


  // Close the menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Loading 3 dot animation
  const TypingIndicator = () => (
    <div className="flex space-x-1 mb-40">
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
      <span className={styles.typingDot}></span>
    </div>
  );

  // Check for matching keywords in user input and filter actions
  useEffect(() => {
    if (inputValue) {
      const lowerInput = inputValue.toLowerCase();
      const matchingActions = actions
        .filter(action => action.text.toLowerCase().includes(lowerInput)) // Filter actions
        .slice(0, 2); // Limit to top 2 matches
      setFilteredActions(matchingActions);
    } else {
      setFilteredActions([]); // Clear the filtered actions if input is empty
    }
  }, [inputValue]);

  // Function to handle button clicks and simulate user input
  const handleButtonClick = (messageText) => {
    setInputValue(messageText); // Set the input value to the button's text
    handleSubmit(messageText); // Directly call handleSubmit with the button's text
  };

  // Update handleSubmit to accept a text argument
  const handleSubmit = async (eventOrText) => {
    if (eventOrText.preventDefault) {
      // If it's an event, prevent the form submit
      eventOrText.preventDefault();
      if (!inputValue.trim()) return;
    }

  const textToSend = typeof eventOrText === "string" ? eventOrText : inputValue;

  // Add user's message to the chat
  const newMessage = { id: messages.length + 1, username: 'user', text: textToSend };
  setMessages((prevMessages) => [...prevMessages, newMessage]);
  setInputValue(""); // Clear the input field

  setIsTyping(true); // Show typing indicator

  try {
    // Format messages for API
    const formattedMessages = [
      ...messages.map((msg) => ({
        role: msg.username === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
      { role: 'user', content: textToSend }
    ];

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: formattedMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Log the response to see if it includes Markdown
    console.log(response.data.choices[0].message.content);

    // Extract and add ChatGPT's reply to the chat
    const replyMessage = {
      id: messages.length + 2,
      username: 'assistant',
      text: response.data.choices[0].message.content,
    };
    setMessages((prevMessages) => [...prevMessages, replyMessage]);

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    } finally {
      setIsTyping(false); // Hide typing indicator when response is received
    }
  };

  return (
    <div className={montserrat.className}>
      <div ref={chatBoxRef} className="fixed inset-0 mx-4 my-4 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-96 sm:h-[500px] bg-gradient-to-br from-[#EF953F] to-[#567CDD] rounded-[24px] shadow-lg p-[2.5px] z-50 transition-all duration-500 ease-in-out flex flex-col justify-between">
        {/* Inner chat content with max height */}
        <div className="flex-1 w-full flex flex-col bg-gray-50 rounded-[22.5px] overflow-hidden">
          
          {/* HEADER */}
          <div className="px-3 py-4 w-full flex justify-between items-center">
            {/* 3 DOTS BUTTON */}
            <div className="relative" ref={menuRef}>
              <div
                className="rounded-full p-2 hover:bg-gray-100  transition duration-200 cursor-pointer"
                onClick={toggleMenu}
              >
                <EllipsisVertical size={20} />
              </div>

              {/* Toggle Menu */}
              {menuOpen && (
                <div
                  className="absolute top-10 left-1 w-32 bg-gray-50 shadow-lg rounded-lg z-50 border border-gray-200 "
                  style={{ position: "absolute" }}
                >
                  <ul className="text-xs text-gray-700">
                    <li className="p-2 hover:bg-gray-100 cursor-pointer hover:font-medium flex items-center space-x-2">
                      <History size={16} />
                      <span>Chat History</span>
                    </li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer hover:font-medium flex items-center space-x-2">
                      <Settings size={16} />
                      <span>Preferences</span>
                    </li>
                    <li className="p-2 hover:bg-gray-100 cursor-pointer hover:font-medium flex items-center space-x-2">
                      <User size={16} />
                      <span>Account</span>
                    </li>
                  </ul>
                </div>
              )}

            </div>
            {/* LOGO + OVERLAY */}
            <div className="flex gap-4 items-center">
              <Image src="/images/Logo.svg" alt="Logo" width={50} height={50} className="h-6 w-6" />
              <p className="font-semibold text-md">Overlay</p>
            </div>
            {/* RESTART AND CLOSE BUTTONS */}
            <div className="flex items-center space-x-0">
              <div onClick={resetChat} className="rounded-full p-2 hover:bg-gray-100 transition duration-200 cursor-pointer hover:-rotate-180">
                <RotateCcw size={20} />
              </div>
            </div>
          </div>

          {/* MESSAGE AREA WITH SCROLLING */}
          <ScrollArea className="flex-1 w-full max-h-[60vh] overflow-y-auto">
            <div className="space-y-4 pt-2 px-5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`w-full flex flex-col text-xs ${
                    message.username === "user"
                      ? "items-end font-semibold text-right ml-auto"
                      : "items-start font-medium text-left"
                  }`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  <div
                    className={`${styles.markdownTableContainer} ${
                      message.username === "user" 
                        ? "  max-w-[95%] break-words" 
                        : "  max-w-[95%] break-words"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {/* LOADING ANIMATION */}
              {isTyping && <TypingIndicator />}
            </div>
          </ScrollArea>

          {/* FLOATING BUTTONS - SUGGESTIONS */}
          {/* Container for floating buttons and input area */}
          <div className="flex flex-col w-full mt-auto px-3 py-3">
            {/* FLOATING BUTTONS - SUGGESTIONS */}
            <AnimatePresence>
              {filteredActions.length > 0 && (
                <div className="flex justify-center items-center mb-2 space-x-2 font-medium text-xs">
                  {filteredActions.map(action => (
                    <motion.div
                      key={action.id}
                      className="flex bg-white text-10pt text-center py-1.5 px-3 rounded-2xl shadow-md shadow-gray-200 hover:-translate-y-1 hover:font-semibold hover:cursor-pointer hover:shadow-gray-300 transition duration-300"
                      onClick={() => handleButtonClick(action.text)}
                      initial={{ opacity: 0, y: 10 }}  // Initial animation state
                      animate={{ opacity: 1, y: 0 }}   // Animate to this state
                      exit={{ opacity: 0, y: -10 }}    // Exit animation when removed
                      transition={{ duration: 0.3 }}   // Animation duration
                    >
                      <p>{action.text}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* INPUT AREA */}
            <form onSubmit={handleSubmit} className="flex items-center w-full space-x-2">
              <textarea
                className="w-full p-2 border px-4 py-3 text-xs rounded-2xl shadow-md focus:outline-none resize-none overflow-hidden"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  e.target.style.height = "auto"; // Reset height to auto
                  e.target.style.height = `${e.target.scrollHeight}px`; // Set height based on content
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { // Check if Enter is pressed without Shift
                    e.preventDefault(); // Prevent default Enter behavior
                    handleSubmit(e); // Call submit function
                    e.target.style.height = "auto"; // Reset height after sending
                  }
                }}
                rows={1} // Initial row count
              />
              {/* Send Button */}
              <button 
                type="submit"
                className="transform transition-transform duration-300 hover:scale-110 hover:rotate-12"
              >
                <Image src="/images/Send.svg" alt="Send" width={35} height={35} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
