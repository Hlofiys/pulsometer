import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../pages/main/Main";
import GeneralRoute from "./route/GeneralRoute";
import CreateUser from "../pages/users/create.page/CreateUser";
import ViewUsers from "../pages/users/view.page/ViewUsers";
import StartMeasurements from "../pages/measurements/start/StartMeasurements";
import ReviewMeasurements from "../pages/measurements/review/ReviewMeasurements";
import ProcessMeasurements from "../pages/measurements/process/ProcessMeasurements";

const Router: FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route element={<GeneralRoute />}>
          <Route path="*" element={<h1>Страница не найдена!</h1>} />
          <Route path="/" element={<Main />} />
          <Route path="/create" element={<CreateUser />} />
          <Route path="/view" element={<ViewUsers />} />
          <Route path="/start-measurements" element={<StartMeasurements />} />
          <Route path="/review-measurements/:id" element={<ReviewMeasurements />} />
          <Route path="/process-measurements/:id" element={<ProcessMeasurements/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
