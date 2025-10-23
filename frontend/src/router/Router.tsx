import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../pages/main/Main";
import GeneralRoute from "./route/GeneralRoute";
import CreateUser from "../pages/users/create.page/CreateUser";
import ViewUsers from "../pages/users/view.page/ViewUsers";
import StartMeasurements from "../pages/measurements/start/StartMeasurements";
import ReviewSessions from "../pages/measurements/review/ReviewSessions";
import ProcessSession from "../pages/measurements/process/ProcessSession";
import { HoverKeypointProvider } from "../context/hoverKeypoint/HoverKeypointContext";

export enum RouterPath {
  NOT_FOUND = "*",
  MAIN = "/",
  CREATE = "/create",
  VIEW = "/view",
  START_MEASUREMENTS = "/start-measurements",
  REVIEW_MEASUREMENTS = "/review-measurements",
  REVIEW_SESSION = "/review-sessions",
  PROCESS_SESSION = "/process-session",
}
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
          <Route
            path={RouterPath.NOT_FOUND}
            element={<h1>Страница не найдена!</h1>}
          />
          <Route path={RouterPath.MAIN} element={<Main />} />
          <Route path={RouterPath.CREATE} element={<CreateUser />} />
          <Route path={RouterPath.VIEW} element={<ViewUsers />} />
          <Route
            path={RouterPath.VIEW + "/:deviceId"}
            element={<ViewUsers />}
          />
          <Route
            path={RouterPath.START_MEASUREMENTS + "/:deviceId/:userId"}
            element={<StartMeasurements />}
          />
          <Route
            path={RouterPath.START_MEASUREMENTS + "/:deviceId"}
            element={<StartMeasurements />}
          />
          <Route
            path={RouterPath.REVIEW_MEASUREMENTS + "/:sessionId"}
            element={
              <HoverKeypointProvider>
                <ProcessSession />
              </HoverKeypointProvider>
            }
          />
          <Route
            path={RouterPath.REVIEW_SESSION + "/:id"}
            element={<ReviewSessions />}
          />
          <Route
            path={RouterPath.PROCESS_SESSION + "/:sessionId"}
            element={
              <HoverKeypointProvider>
                <ProcessSession />
              </HoverKeypointProvider>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
