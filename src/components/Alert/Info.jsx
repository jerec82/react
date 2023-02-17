import { React } from 'react';
import { Alert} from 'antd';

const Info = (props) => {
   
    return (
        <Alert 
            message={props.stateMessage}
            type={props.stateTypeMessage} 
            showIcon>
        </Alert>
    );
}

export default Info