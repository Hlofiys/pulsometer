import { FC, lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Spin } from "antd";
import GeneralRoute from "./route/GeneralRoute";
import { HoverKeypointProvider } from "../context/hoverKeypoint/HoverKeypointContext";

const Main = lazy(() => import("../pages/main/Main"));
const CreateUser = lazy(() => import("../pages/users/create.page/CreateUser"));
const ViewUsers = lazy(() => import("../pages/users/view.page/ViewUsers"));
const StartMeasurements = lazy(
  () => import("../pages/measurements/start/StartMeasurements")
);
const ReviewSessions = lazy(
  () => import("../pages/measurements/review/ReviewSessions")
);
const ProcessSession = lazy(
  () => import("../pages/measurements/process/ProcessSession")
);

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
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "100vh",
            }}
          >
            <Spin size="large" />
          </div>
        }
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
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
