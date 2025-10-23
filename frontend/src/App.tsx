import { AlertProvider } from "./context/alert/AlertProvider";
import Router from "./router/Router";

function App() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        margin: 0,
      }}
    >
      <AlertProvider>
        <Router />
      </AlertProvider>
    </div>
  );
}

export default App;
