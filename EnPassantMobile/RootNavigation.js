import * as React from 'react';
import {CommonActions} from '@react-navigation/native';

export const navigationRef = React.createRef();

export function dispatch() {
    navigationRef.current?.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [
                {name: 'Home'},
            ],
        })
    );
}

