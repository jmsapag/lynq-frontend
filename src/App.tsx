import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const basename = import.meta.env.BASE_URL;
  return (
    <BrowserRouter basename={basename}>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Lynq - People Counter
                </h1>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
