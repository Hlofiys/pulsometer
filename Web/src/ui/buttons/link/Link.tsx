import { AnchorHTMLAttributes, FC, memo } from 'react';
import styles from './Link.module.scss';

const Link:FC<AnchorHTMLAttributes<HTMLAnchorElement>> = (props) => {
  return (
    <a {...props} className={styles.link}>
        {props.children}
    </a>
  )
}

export default memo(Link);