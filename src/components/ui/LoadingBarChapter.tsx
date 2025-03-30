export const LoadingBarChapter = () => {
    return (
      <>
        <style>{`
          @keyframes typewriter {
            from {
              width: 0;
            }
            to {
              width: 100%;
            }
          }
          @keyframes blink {
            0% {
              border-color: white;
            }
            50% {
              border-color: transparent;
            }
            100% {
              border-color: white;
            }
          }
          .typewriter-text {
            display: inline-block;
            overflow: hidden;
            white-space: nowrap;
            border-right: 2px solid white;
            width: 0;
            animation: typewriter 2s steps(20) forwards, blink 0.75s step-end infinite;
          }
        `}</style>
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          <div className="mb-2 px-2 py-1 text-xs text-white bg-black rounded shadow">
            <span className="typewriter-text">Création des chapitres en cours...</span>
          </div>
          <div className="w-48 h-2 bg-gray-300 rounded overflow-hidden">
            <div className="h-full bg-black animate-pulse"></div>
          </div>
        </div>
      </>
    );
  };

