import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "../pages/main/Main";
import GeneralRoute from "./route/GeneralRoute";
import CreateUser from "../pages/users/create.page/CreateUser";
import ViewUsers from "../pages/users/view.page/ViewUsers";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
