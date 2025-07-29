"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Filter } from "bad-words";

type MessageLog = {
  sender: string;
  text: string;
};

const ChatBot = () => {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const filter = new Filter();

  const onSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const query = formData.get("chat-input");
    if (!query) return;

    // Check for offensive terms
    if (filter.isProfane(query.toString())) {
      const warningMessage = {
        sender: "Wave",
        text: "Your message contains inappropriate language. Please rephrase.",
      };
      setMessages((prev) => [...prev, warningMessage]);
      form.reset();
      return;
    }

    // Add User message to the chat log
    const userMessage = { sender: "User", text: query.toString() };
    setMessages((prev) => [...prev, userMessage]);

    // Reset the form and focus on the input
    form.reset();
    const inputElement = form.querySelector("textarea");
    if (inputElement) {
      inputElement.focus();
    }

    // Add Bot response to the chat log
    try {
      const response = await fetch("api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: query.toString() }),
      });
      const data = await response.json();

      const botMessage = {
        sender: "Wave",
        text:
          data.answer || "Sorry, I couldn't find information on that for you.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };
  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      const form = e.currentTarget.closest("form") as HTMLFormElement;
      if (form) {
        form.requestSubmit(); // Programmatically submit the form
      }
    }
  };

  // Suggested questions
  const suggestedQuestions = [
    "How do I install the chatbot?",
    "What technologies are used in this chatbot?",
  ];
  const suggestedQuestionHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    const question = e.currentTarget.textContent;
    if (question) {
      const form = e.currentTarget.closest("form") as HTMLFormElement;
      const inputElement = form.querySelector("textarea");
      if (inputElement) {
        inputElement.value = question; // Set the textarea value to the suggested question
        inputElement.focus(); // Focus on the textarea
      }
    }
  };

  return (
    <div className="w-[500px] mx-auto p-4 border rounded shadow-lg">
      <div className="flex w-full">
        <Image alt="Wave - Chatbot" src="/wave.png" width={200} height={200} />
        <h1 className="mb-2 bg-white rounded-xl p-2 text-black self-start before:content-[''] before:absolute before:border-l-[10px] before:border-l-transparent before:border-r-[10px] before:border-r-transparent before:border-t-[20px] before:border-t-white before:rotate-[45deg] before:bottom-[-0.5rem] before:left-[-0.5rem] relative text-sm">
          Hello! I&apos;m <strong>Wave</strong> your friendly interweb chatbot.
        </h1>
      </div>
      <form onSubmit={onSubmitHandler}>
        <div>
          <h2 className="font-bold text-lg my-2">Suggested questions</h2>
          {suggestedQuestions.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <li key={index}>
                  <button
                    className="bg-white rounded-full text-black py-2 px-4 text-xs cursor-pointer hover:bg-gray-200"
                    onClick={suggestedQuestionHandler}
                  >
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="chat-input" className="block mb-2">
            <textarea
              placeholder="Type your message here..."
              className="w-full h-32 p-2 border rounded"
              id="chat-input"
              name="chat-input"
              rows={4}
              autoFocus={true}
              required={true}
              onKeyDown={onKeyDownHandler}
            ></textarea>
          </label>
          <input
            type="submit"
            value="Send"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          />
        </div>
      </form>
      {messages.length > 0 && (
        <>
          <h2 className="font-bold text-xl mt-8">Message Log</h2>
          <ul className="mt-4">
            {messages.map((msg, index) => (
              <li
                key={index}
                className="mb-2 border-b border-white pb-2 last:border-0"
              >
                <strong>Author:</strong> {msg.sender}
                <br />
                <strong>Text:</strong> {msg.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ChatBot;
