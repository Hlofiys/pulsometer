import { FC } from 'react'
import Header from '../../ui/header/Header';
import styles from './GeneralRoute.module.scss';
import Footer from '../../ui/footer/Footer';
import { Outlet } from 'react-router-dom';
import { useGetUsers } from '../../api/hooks/user/useGetUsers';

const GeneralRoute:FC = () => {
  useGetUsers();
  return (
    <div className={styles.mainPageContainer}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default GeneralRoute