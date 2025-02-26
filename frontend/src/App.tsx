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
      <Router />
    </div>
  );
}

export default App;
