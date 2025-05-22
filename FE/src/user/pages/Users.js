import React, { Fragment, useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
    const [users, setUsers] = useState([]);
    const { error, sendRequest, clearError, isLoading } = useHttpClient();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_API}/user`
                );

                setUsers(data.users);
            } catch (err) {
                console.log(err);
            }
        };

        fetchUsers();
    }, [sendRequest]);

    return (
        <Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && <UsersList items={users} />}
        </Fragment>
    );
};

export default Users;
