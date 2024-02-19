import React, { FC, ReactNode } from 'react';
import './MyModal.css';

interface IMyModalProps {
    visible: boolean;
    setVisible(visible: boolean): void;
    children: ReactNode;
}

const MyModal: FC<IMyModalProps> = ({ visible, setVisible,children }) => {
    console.log(visible+"11")
    const rootClasses = ['myModal'];

    if (visible) {
        console.log(visible)
        rootClasses.push('active');
    }

    return (
        <div className={rootClasses.join(' ')} onClick={() => setVisible(false)}>
            <div className='myModalContent' onClick={(e) => e.stopPropagation()}>
                {children}
                {visible+"asd"}
            </div>
        </div>
    );
};

export default MyModal;
