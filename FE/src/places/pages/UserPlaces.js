import React, { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import PlaceList from '../components/PlaceList';

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState([]);
    const { sendRequest, error, isLoading, clearError } = useHttpClient();

    const userId = useParams().userId;
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_API}/places/user/${userId}`
                );
                setLoadedPlaces(responseData.places);
            } catch (err) {
                console.log(err);
            }
        };
        fetchPlaces();
    }, [sendRequest, userId]);

    const onDeleteHandler = async (placeId) => {
        setLoadedPlaces(loadedPlaces.filter((place) => place.id !== placeId));
    };
    return (
        <Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            {loadedPlaces && (
                <PlaceList items={loadedPlaces} onDelete={onDeleteHandler} />
            )}
        </Fragment>
    );
};

export default UserPlaces;
