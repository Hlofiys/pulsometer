import { AlertProvider } from "./context/alert/AlertProvider";
import { SSEProvider } from "./context/sse/SSEProvider";
import ErrorBoundary from "./ui/errorBoundary/ErrorBoundary";
import Router from "./router/Router";

function App() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 0,
      }}
    >
      <ErrorBoundary>
        <SSEProvider>
          <AlertProvider>
            <Router />
          </AlertProvider>
        </SSEProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
